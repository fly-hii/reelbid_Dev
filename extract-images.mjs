/**
 * Extract Images from MongoDB
 * 
 * This script connects to the ReelBid MongoDB database and extracts all
 * image data (base64 strings) from the following collections:
 * 
 * - items.images[]           (auction item photos)
 * - users.image              (profile photos)
 * - fanassociations.heroImage, bannerImage, galleryImages[]
 * - fanmembers.photo
 * 
 * Images are saved to ./extracted-images/<collection>/<docId>_<field>_<index>.<ext>
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// ─── Config ───────────────────────────────────────────────────────────
const MONGODB_URI = 'mongodb+srv://sribharathividyanikethanvmg_db_user:PCOJ8NNa8g3Px0OM@cluster0.zd38mvu.mongodb.net/';
const OUTPUT_DIR = './extracted-images';

// ─── Helpers ──────────────────────────────────────────────────────────

function parseBase64Image(dataStr) {
    if (!dataStr || typeof dataStr !== 'string') return null;

    // Handle data URI: "data:image/png;base64,iVBOR..."
    const dataUriMatch = dataStr.match(/^data:image\/(\w+);base64,(.+)$/s);
    if (dataUriMatch) {
        return {
            ext: dataUriMatch[1] === 'jpeg' ? 'jpg' : dataUriMatch[1],
            buffer: Buffer.from(dataUriMatch[2], 'base64'),
        };
    }

    // Handle raw base64 (no data URI prefix) — try to detect from magic bytes
    if (/^[A-Za-z0-9+/=]{100,}$/.test(dataStr.slice(0, 200).replace(/\s/g, ''))) {
        const buf = Buffer.from(dataStr, 'base64');
        let ext = 'png'; // default
        if (buf[0] === 0xFF && buf[1] === 0xD8) ext = 'jpg';
        else if (buf.slice(0, 4).toString() === '\x89PNG') ext = 'png';
        else if (buf.slice(0, 4).toString('ascii') === 'RIFF') ext = 'webp';
        else if (buf.slice(0, 3).toString('ascii') === 'GIF') ext = 'gif';
        return { ext, buffer: buf };
    }

    // It's a URL, not base64
    return null;
}

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function saveImage(buffer, ext, collectionName, docId, field, index = null) {
    const dir = path.join(OUTPUT_DIR, collectionName);
    ensureDir(dir);
    const suffix = index !== null ? `_${index}` : '';
    const filename = `${docId}_${field}${suffix}.${ext}`;
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

// ─── Extraction Logic ─────────────────────────────────────────────────

async function extractFromCollection(db, collectionName, imageFields) {
    const collection = db.collection(collectionName);
    const docs = await collection.find({}).toArray();
    let totalSaved = 0;
    const urls = [];

    console.log(`\n📦 ${collectionName}: ${docs.length} documents found`);

    for (const doc of docs) {
        const docId = doc._id.toString();

        for (const fieldDef of imageFields) {
            const { field, isArray } = fieldDef;
            const value = doc[field];

            if (!value) continue;

            if (isArray && Array.isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                    const parsed = parseBase64Image(value[i]);
                    if (parsed) {
                        const savedPath = saveImage(parsed.buffer, parsed.ext, collectionName, docId, field, i);
                        console.log(`  ✅ Saved: ${savedPath} (${(parsed.buffer.length / 1024).toFixed(1)} KB)`);
                        totalSaved++;
                    } else if (value[i] && typeof value[i] === 'string' && value[i].startsWith('http')) {
                        urls.push({ docId, field, index: i, url: value[i] });
                    }
                }
            } else if (typeof value === 'string') {
                const parsed = parseBase64Image(value);
                if (parsed) {
                    const savedPath = saveImage(parsed.buffer, parsed.ext, collectionName, docId, field);
                    console.log(`  ✅ Saved: ${savedPath} (${(parsed.buffer.length / 1024).toFixed(1)} KB)`);
                    totalSaved++;
                } else if (value.startsWith('http')) {
                    urls.push({ docId, field, url: value });
                }
            }
        }
    }

    return { totalSaved, urls };
}

// ─── Main ─────────────────────────────────────────────────────────────

async function main() {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected!\n');

    const db = mongoose.connection.db;
    ensureDir(OUTPUT_DIR);

    // List all collections first
    const collections = await db.listCollections().toArray();
    console.log('📋 Collections in database:', collections.map(c => c.name).join(', '));

    let grandTotalSaved = 0;
    const allUrls = [];

    // 1. Items — images[]
    const itemsResult = await extractFromCollection(db, 'items', [
        { field: 'images', isArray: true },
    ]);
    grandTotalSaved += itemsResult.totalSaved;
    allUrls.push(...itemsResult.urls);

    // 2. Users — image
    const usersResult = await extractFromCollection(db, 'users', [
        { field: 'image', isArray: false },
    ]);
    grandTotalSaved += usersResult.totalSaved;
    allUrls.push(...usersResult.urls);

    // 3. Fan Associations — heroImage, bannerImage, galleryImages[]
    const fanAssocResult = await extractFromCollection(db, 'fanassociations', [
        { field: 'heroImage', isArray: false },
        { field: 'bannerImage', isArray: false },
        { field: 'galleryImages', isArray: true },
    ]);
    grandTotalSaved += fanAssocResult.totalSaved;
    allUrls.push(...fanAssocResult.urls);

    // 4. Fan Members — photo
    const fanMemberResult = await extractFromCollection(db, 'fanmembers', [
        { field: 'photo', isArray: false },
    ]);
    grandTotalSaved += fanMemberResult.totalSaved;
    allUrls.push(...fanMemberResult.urls);

    // ─── Summary ──────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(60));
    console.log(`🎉 EXTRACTION COMPLETE`);
    console.log(`   Base64 images saved: ${grandTotalSaved}`);
    console.log(`   URL references found: ${allUrls.length}`);
    console.log(`   Output directory: ${path.resolve(OUTPUT_DIR)}`);
    console.log('═'.repeat(60));

    // Save URL references to a JSON file for reference
    if (allUrls.length > 0) {
        const urlsFile = path.join(OUTPUT_DIR, 'url_references.json');
        fs.writeFileSync(urlsFile, JSON.stringify(allUrls, null, 2));
        console.log(`\n📝 URL references saved to: ${urlsFile}`);
    }

    // Save a manifest of all extracted images
    const manifest = {
        extractedAt: new Date().toISOString(),
        totalBase64Images: grandTotalSaved,
        totalUrlReferences: allUrls.length,
        collections: {
            items: itemsResult.totalSaved,
            users: usersResult.totalSaved,
            fanassociations: fanAssocResult.totalSaved,
            fanmembers: fanMemberResult.totalSaved,
        },
        urls: allUrls,
    };
    const manifestFile = path.join(OUTPUT_DIR, 'manifest.json');
    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
    console.log(`📄 Manifest saved to: ${manifestFile}`);

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB.');
}

main().catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
});
