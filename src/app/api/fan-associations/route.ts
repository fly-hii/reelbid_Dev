import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import FanAssociation from '@/models/FanAssociation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

function generateSlug(heroName: string, areaName: string) {
    return `${heroName}-fans-${areaName}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Admin: Create fan association with a president user
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'Admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { presidentName, presidentEmail, presidentPassword, presidentPhone, heroName, areaName, heroImage, bannerImage, description, themeColor } = body;

        if (!presidentName || !presidentEmail || !presidentPassword || !heroName || !areaName) {
            return NextResponse.json({ error: 'President name, email, password, hero name, and area name are required' }, { status: 400 });
        }

        await connectDB();

        // Check if email already exists
        const existing = await User.findOne({ email: presidentEmail });
        if (existing) {
            return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
        }

        // Create slug
        let slug = generateSlug(heroName, areaName);
        const existingSlug = await FanAssociation.findOne({ slug });
        if (existingSlug) {
            slug = slug + '-' + Date.now();
        }

        // Create president user
        const hashedPassword = await bcrypt.hash(presidentPassword, 10);
        const president = await User.create({
            name: presidentName,
            email: presidentEmail,
            password: hashedPassword,
            phone: presidentPhone || '',
            role: 'President',
            profileCompleted: true,
        });

        // Create fan association
        const fanAssociation = await FanAssociation.create({
            heroName,
            areaName,
            slug,
            president: president._id,
            heroImage: heroImage || '',
            bannerImage: bannerImage || '',
            description: description || '',
            themeColor: themeColor || '#8b5cf6',
        });

        return NextResponse.json({ success: true, fanAssociation, president });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Get all fan associations (Admin)
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const presidentId = searchParams.get('presidentId');

        let query: any = {};
        if (presidentId) {
            query.president = presidentId;
        }

        const associations = await FanAssociation.find(query)
            .populate('president', 'name email phone')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, associations });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Admin: Update fan association (images, description, etc.)
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['Admin', 'President'].includes((session.user as any)?.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { associationId, heroImage, bannerImage, galleryImages, description, contactPhone, contactEmail, socialLinks, themeColor, isActive } = body;

        if (!associationId) {
            return NextResponse.json({ error: 'Association ID required' }, { status: 400 });
        }

        await connectDB();

        const updateData: any = {};
        if (heroImage !== undefined) updateData.heroImage = heroImage;
        if (bannerImage !== undefined) updateData.bannerImage = bannerImage;
        if (galleryImages !== undefined) updateData.galleryImages = galleryImages;
        if (description !== undefined) updateData.description = description;
        if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
        if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
        if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
        if (themeColor !== undefined) updateData.themeColor = themeColor;
        if (isActive !== undefined) updateData.isActive = isActive;

        const association = await FanAssociation.findByIdAndUpdate(associationId, updateData, { new: true })
            .populate('president', 'name email phone');

        if (!association) {
            return NextResponse.json({ error: 'Association not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, association });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Admin: Delete fan association
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'Admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const associationId = searchParams.get('id');

        if (!associationId) {
            return NextResponse.json({ error: 'Association ID required' }, { status: 400 });
        }

        await connectDB();
        const deleted = await FanAssociation.findByIdAndDelete(associationId);
        if (!deleted) {
            return NextResponse.json({ error: 'Association not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
