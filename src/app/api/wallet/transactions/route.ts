import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { WalletTransaction, User, Item } from '@/models/index';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

        const where: any = {};

        if (role === 'Admin') {
            if (userId) where.userId = userId;
        } else {
            where.userId = currentUserId;
        }

        if (type) where.type = type;

        const transactions = await WalletTransaction.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit,
            include: [
                { model: User, as: 'user', attributes: ['name', 'email', 'role'] },
                { model: Item, as: 'auction', attributes: ['title'] }
            ]
        });

        const total = await WalletTransaction.count({ where });

        return NextResponse.json({ transactions, total });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
