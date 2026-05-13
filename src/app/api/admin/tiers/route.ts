import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Tier, User } from '@/models/index';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Middleware: check admin
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    await connectDB();
    const user = await User.findByPk((session.user as any).id);
    if (!user || user.role !== 'Admin') return null;
    return user;
}

// GET — list all tiers
export async function GET() {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const tiers = await Tier.findAll({ order: [['order', 'ASC']] });
        const result = tiers.map(t => ({ ...t.toJSON(), _id: t.id }));
        return NextResponse.json(result);
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
        const plain = { ...tier.toJSON(), _id: tier.id };
        return NextResponse.json({ success: true, tier: plain });
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

        const tier = await Tier.findByPk(tierId);
        if (!tier) return NextResponse.json({ error: 'Tier not found' }, { status: 404 });

        await tier.update({ name, minBalance, bidLimit, order });
        const plain = { ...tier.toJSON(), _id: tier.id };

        return NextResponse.json({ success: true, tier: plain });
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

        const tier = await Tier.findByPk(tierId);
        if (tier) {
            await tier.destroy();
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
