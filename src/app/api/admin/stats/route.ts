import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Item from '@/models/Item';
import Bid from '@/models/Bid';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'Admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await connectDB();

        const [totalUsers, totalItems, totalBids, users, items] = await Promise.all([
            User.countDocuments(),
            Item.countDocuments(),
            Bid.countDocuments(),
            User.find().select('name email role walletBalance tier createdAt').sort({ createdAt: -1 }).lean(),
            Item.find()
                .populate('seller', 'name email')
                .populate('highestBidder', 'name email')
                .sort({ createdAt: -1 })
                .lean(),
        ]);

        const buyers = users.filter((u: any) => u.role === 'Buyer').length;
        const sellers = users.filter((u: any) => u.role === 'Seller').length;
        const admins = users.filter((u: any) => u.role === 'Admin').length;
        const activeAuctions = items.filter((i: any) => i.status === 'Active' && new Date(i.endDate) > new Date()).length;
        const completedAuctions = items.filter((i: any) => i.status === 'Completed' || (i.status === 'Active' && new Date(i.endDate) <= new Date())).length;
        const totalRevenue = items.reduce((sum: number, i: any) => sum + (i.currentPrice || 0), 0);

        return NextResponse.json({
            stats: { totalUsers, totalItems, totalBids, buyers, sellers, admins, activeAuctions, completedAuctions, totalRevenue },
            users,
            items,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
