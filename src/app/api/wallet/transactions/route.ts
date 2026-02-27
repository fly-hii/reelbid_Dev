import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WalletTransaction from '@/models/WalletTransaction';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

/**
 * GET /api/wallet/transactions
 * Admin: view all transactions
 * Buyer/Seller: view own transactions
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const type = searchParams.get('type'); // credit, debit, lock, unlock, refund, payment
        const userId = searchParams.get('userId');

        await connectDB();

        const role = (session.user as any).role;
        const currentUserId = (session.user as any).id;

        const filter: any = {};

        if (role === 'Admin') {
            if (userId) filter.user = userId;
        } else {
            filter.user = currentUserId;
        }

        if (type) filter.type = type;

        const transactions = await WalletTransaction.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('user', 'name email role')
            .populate('auction', 'title')
            .lean();

        const total = await WalletTransaction.countDocuments(filter);

        return NextResponse.json({ transactions, total });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
