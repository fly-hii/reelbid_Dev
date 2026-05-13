import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Item, Bid, User } from '@/models/index';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Get seller's own items and stats
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = (session.user as any).role;
        if (role !== 'Seller' && role !== 'Admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const sellerId = parseInt((session.user as any).id);
        await connectDB();

        const itemsData = await Item.findAll({
            where: { sellerId },
            include: [{ model: User, as: 'highestBidder', attributes: ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'] }],
            order: [['createdAt', 'DESC']]
        });

        const items = itemsData.map(i => {
            const plain = i.toJSON() as any;
            plain._id = plain.id;
            return plain;
        });

        const totalListings = items.length;
        const activeListings = items.filter((i: any) => i.status === 'Active' && new Date(i.endDate) > new Date()).length;
        const completedListings = items.filter((i: any) => i.status === 'Completed' || (i.status === 'Active' && new Date(i.endDate) <= new Date())).length;
        const totalEarnings = items
            .filter((i: any) => i.status === 'Completed' || (i.status === 'Active' && new Date(i.endDate) <= new Date()))
            .reduce((sum: number, i: any) => sum + Number(i.currentPrice || 0), 0);

        // Get total bids on seller's items
        const itemIds = items.map((i: any) => i.id);
        const { Op } = await import('sequelize');
        const totalBidsOnItems = await Bid.count({ where: { itemId: { [Op.in]: itemIds } } });

        return NextResponse.json({
            stats: { totalListings, activeListings, completedListings, totalEarnings, totalBidsOnItems },
            items,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
