import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tier from '@/models/Tier';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// Middleware: check admin
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    await connectDB();
    const user = await User.findById((session.user as any).id);
    if (!user || user.role !== 'Admin') return null;
    return user;
}

// GET — list all tiers
export async function GET() {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const tiers = await Tier.find().sort({ order: 1 });
        return NextResponse.json(tiers);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST — create new tier
export async function POST(req: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const { name, minBalance, bidLimit, order } = await req.json();
        if (!name || minBalance == null || bidLimit == null) {
            return NextResponse.json({ error: 'name, minBalance, and bidLimit are required' }, { status: 400 });
        }

        const tier = await Tier.create({ name, minBalance, bidLimit, order: order || 0 });
        return NextResponse.json({ success: true, tier });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT — update existing tier
export async function PUT(req: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const { tierId, name, minBalance, bidLimit, order } = await req.json();
        if (!tierId) return NextResponse.json({ error: 'tierId is required' }, { status: 400 });

        const tier = await Tier.findByIdAndUpdate(
            tierId,
            { name, minBalance, bidLimit, order },
            { new: true }
        );
        if (!tier) return NextResponse.json({ error: 'Tier not found' }, { status: 404 });

        return NextResponse.json({ success: true, tier });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE — remove tier
export async function DELETE(req: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const { searchParams } = new URL(req.url);
        const tierId = searchParams.get('tierId');
        if (!tierId) return NextResponse.json({ error: 'tierId is required' }, { status: 400 });

        await Tier.findByIdAndDelete(tierId);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
