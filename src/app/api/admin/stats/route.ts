import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User, Item, Bid, WalletTransaction } from '@/models/index';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fn, col } from 'sequelize';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'Admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await connectDB();

        const [totalUsers, totalItems, totalBids, totalTransactions, users, items] = await Promise.all([
            User.count(),
            Item.count(),
            Bid.count(),
            WalletTransaction.count(),
            User.findAll({
                attributes: ['id', 'name', 'email', 'role', 'walletBalance', 'lockedBalance', 'tier', 'isApproved', 'createdAt'],
                order: [['createdAt', 'DESC']],
                raw: true,
            }),
            Item.findAll({
                include: [
                    { model: User, as: 'seller', attributes: ['id', 'name', 'email'] },
                    { model: User, as: 'highestBidder', attributes: ['id', 'name', 'email'] },
                    { model: User, as: 'winner', attributes: ['id', 'name', 'email'] },
                ],
                order: [['createdAt', 'DESC']],
            }),
        ]);

        const itemsRaw = items.map(i => {
            const plain = i.toJSON() as any;
            plain._id = plain.id;
            return plain;
        });

        const usersRaw = users.map((u: any) => ({ ...u, _id: u.id }));

        // Compute wallet flow stats
        const walletStats = await WalletTransaction.findAll({
            attributes: [
                'type',
                [fn('SUM', col('amount')), 'total'],
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['type'],
            raw: true,
        });

        const walletFlow: any = {};
        for (const s of walletStats as any) {
            walletFlow[s.type] = { total: Number(s.total) || 0, count: Number(s.count) || 0 };
        }

        const buyers = usersRaw.filter((u: any) => u.role === 'Buyer').length;
        const sellers = usersRaw.filter((u: any) => u.role === 'Seller').length;
        const admins = usersRaw.filter((u: any) => u.role === 'Admin').length;
        const activeAuctions = itemsRaw.filter((i: any) => i.status === 'Active' && new Date(i.endDate) > new Date()).length;
        const completedAuctions = itemsRaw.filter((i: any) => i.status === 'Completed' || (i.status === 'Active' && new Date(i.endDate) <= new Date())).length;
        const totalRevenue = itemsRaw
            .filter((i: any) => i.status === 'Completed')
            .reduce((sum: number, i: any) => sum + Number(i.finalAmount || i.currentPrice || 0), 0);
        const totalLockedDeposits = usersRaw.reduce((sum: number, u: any) => sum + Number(u.lockedBalance || 0), 0);

        return NextResponse.json({
            stats: {
                totalUsers, totalItems, totalBids, totalTransactions,
                buyers, sellers, admins,
                activeAuctions, completedAuctions,
                totalRevenue, totalLockedDeposits,
                walletFlow,
            },
            users: usersRaw,
            items: itemsRaw,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
