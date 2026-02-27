import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Item from '@/models/Item';
import Bid from '@/models/Bid';
import WalletTransaction from '@/models/WalletTransaction';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'Admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await connectDB();

        const [totalUsers, totalItems, totalBids, totalTransactions, users, items] = await Promise.all([
            User.countDocuments(),
            Item.countDocuments(),
            Bid.countDocuments(),
            WalletTransaction.countDocuments(),
            User.find().select('name email role walletBalance lockedBalance tier isApproved createdAt').sort({ createdAt: -1 }).lean(),
            Item.find()
                .populate('seller', 'name email')
                .populate('highestBidder', 'name email')
                .populate('winner', 'name email')
                .sort({ createdAt: -1 })
                .lean(),
        ]);

        // Compute wallet flow stats
        const walletStats = await WalletTransaction.aggregate([
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
        ]);

        const walletFlow: any = {};
        for (const s of walletStats) {
            walletFlow[s._id] = { total: s.total, count: s.count };
        }

        const buyers = users.filter((u: any) => u.role === 'Buyer').length;
        const sellers = users.filter((u: any) => u.role === 'Seller').length;
        const admins = users.filter((u: any) => u.role === 'Admin').length;
        const activeAuctions = items.filter((i: any) => i.status === 'Active' && new Date(i.endDate) > new Date()).length;
        const completedAuctions = items.filter((i: any) => i.status === 'Completed' || (i.status === 'Active' && new Date(i.endDate) <= new Date())).length;
        const totalRevenue = items
            .filter((i: any) => i.status === 'Completed')
            .reduce((sum: number, i: any) => sum + (i.finalAmount || i.currentPrice || 0), 0);
        const totalLockedDeposits = users.reduce((sum: number, u: any) => sum + (u.lockedBalance || 0), 0);

        return NextResponse.json({
            stats: {
                totalUsers, totalItems, totalBids, totalTransactions,
                buyers, sellers, admins,
                activeAuctions, completedAuctions,
                totalRevenue, totalLockedDeposits,
                walletFlow,
            },
            users,
            items,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
