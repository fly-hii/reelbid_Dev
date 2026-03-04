import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Tier from '@/models/Tier';
import WalletTransaction from '@/models/WalletTransaction';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { assertWalletIntegrity, resignWallet } from '@/lib/walletIntegrity';

// Helper: compute tier from dynamic tier settings
async function computeTier(balance: number): Promise<string> {
    const tiers = await Tier.find().sort({ minBalance: -1 }); // highest first
    for (const tier of tiers) {
        if (balance >= tier.minBalance) return tier.name;
    }
    return 'None';
}

// GET wallet info + transaction history
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const includeTransactions = searchParams.get('transactions') === 'true';
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        await connectDB();
        const user = await User.findById((session.user as any).id);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // All balance values come from DB only — never from client
        const result: any = {
            balance: user.walletBalance,
            lockedBalance: user.lockedBalance || 0,
            availableBalance: user.walletBalance - (user.lockedBalance || 0),
            tier: user.tier,
        };

        if (includeTransactions) {
            result.transactions = await WalletTransaction.find({ user: user._id })
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate('auction', 'title')
                .lean();
        }

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST to add money to wallet
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount } = await req.json();

        // ── Server-side amount validation ──
        if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
            return NextResponse.json({ error: 'Invalid topup amount' }, { status: 400 });
        }
        // Cap single topup to prevent abuse; round to integer
        const MAX_TOPUP = 500000; // ₹5,00,000 max single topup
        const sanitizedAmount = Math.min(Math.round(amount), MAX_TOPUP);
        if (sanitizedAmount <= 0) {
            return NextResponse.json({ error: 'Invalid topup amount' }, { status: 400 });
        }

        await connectDB();
        const user = await User.findById((session.user as any).id);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // ── Verify wallet integrity BEFORE mutation ──
        assertWalletIntegrity(user);

        // Mutate the balance (server-side only, never trust client balance)
        user.walletBalance += sanitizedAmount;
        user.tier = await computeTier(user.walletBalance);

        // ── Re-sign wallet hash after mutation ──
        resignWallet(user);
        await user.save();

        // Record the credit transaction
        await WalletTransaction.create({
            user: user._id,
            type: 'credit',
            amount: sanitizedAmount,
            description: `Wallet top-up of ₹${sanitizedAmount}`,
            balanceAfter: user.walletBalance,
            lockedAfter: user.lockedBalance || 0,
        });

        return NextResponse.json({
            success: true,
            balance: user.walletBalance,
            lockedBalance: user.lockedBalance || 0,
            availableBalance: user.walletBalance - (user.lockedBalance || 0),
            tier: user.tier,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
