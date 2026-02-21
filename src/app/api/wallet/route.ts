import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Tier from '@/models/Tier';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// Helper: compute tier from dynamic tier settings
async function computeTier(balance: number): Promise<string> {
    const tiers = await Tier.find().sort({ minBalance: -1 }); // highest first
    for (const tier of tiers) {
        if (balance >= tier.minBalance) return tier.name;
    }
    return 'None';
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount } = await req.json();
        if (typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json({ error: 'Invalid topup amount' }, { status: 400 });
        }

        await connectDB();
        const user = await User.findById((session.user as any).id);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        user.walletBalance += amount;
        user.tier = await computeTier(user.walletBalance);
        await user.save();

        return NextResponse.json({ success: true, balance: user.walletBalance, tier: user.tier });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById((session.user as any).id);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json({
            balance: user.walletBalance,
            tier: user.tier,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

