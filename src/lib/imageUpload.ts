import sharp from 'sharp';
import { uploadToS3 } from './s3';
import { randomUUID } from 'crypto';

/**
 * Convert an image buffer to WebP format using sharp.
 * Applies quality 80 for a good balance of quality and size.
 */
export async function convertToWebp(inputBuffer: Buffer): Promise<Buffer> {
    return sharp(inputBuffer)
        .webp({ quality: 80 })
        .toBuffer();
}

/**
 * Process and upload a single image.
 * Accepts a base64 data URI or raw buffer.
 * Converts to WebP and uploads to S3.
 * Returns the public S3 URL.
 */
export async function processAndUploadImage(
    input: string | Buffer,
    folder: string = 'images'
): Promise<string> {
    let buffer: Buffer;

    if (typeof input === 'string') {
        // Handle data URI: "data:image/png;base64,iVBOR..."
        const dataUriMatch = input.match(/^data:image\/\w+;base64,([\s\S]+)$/);
        if (dataUriMatch) {
            buffer = Buffer.from(dataUriMatch[1], 'base64');
        } else if (input.startsWith('http://') || input.startsWith('https://')) {
            // It's already a URL, return as-is (already uploaded)
            return input;
        } else {
            // Assume raw base64
            buffer = Buffer.from(input, 'base64');
        }
    } else {
        buffer = input;
    }

    // Convert to WebP
    const webpBuffer = await convertToWebp(buffer);

    // Generate unique filename
    const filename = `${folder}/${randomUUID()}.webp`;

    // Upload to S3
    const url = await uploadToS3(webpBuffer, filename, 'image/webp');
    return url;
}

/**
 * Process and upload multiple images.
 * Returns array of S3 URLs.
 */
export async function processAndUploadImages(
    inputs: (string | Buffer)[],
    folder: string = 'images'
): Promise<string[]> {
    const results: string[] = [];
    for (const input of inputs) {
        if (!input) continue;
        try {
            const url = await processAndUploadImage(input, folder);
            results.push(url);
        } catch (err) {
            console.error('Failed to process image:', err);
            // Skip failed images
        }
    }
    return results;
}
