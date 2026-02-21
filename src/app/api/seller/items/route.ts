import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Item from '@/models/Item';
import Bid from '@/models/Bid';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

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

        const sellerId = (session.user as any).id;
        await connectDB();

        const items = await Item.find({ seller: sellerId })
            .populate('highestBidder', 'name email phone address city state pincode')
            .sort({ createdAt: -1 })
            .lean();

        const totalListings = items.length;
        const activeListings = items.filter((i: any) => i.status === 'Active' && new Date(i.endDate) > new Date()).length;
        const completedListings = items.filter((i: any) => i.status === 'Completed' || (i.status === 'Active' && new Date(i.endDate) <= new Date())).length;
        const totalEarnings = items
            .filter((i: any) => i.status === 'Completed' || (i.status === 'Active' && new Date(i.endDate) <= new Date()))
            .reduce((sum: number, i: any) => sum + (i.currentPrice || 0), 0);

        // Get total bids on seller's items
        const itemIds = items.map((i: any) => i._id);
        const totalBidsOnItems = await Bid.countDocuments({ item: { $in: itemIds } });

        return NextResponse.json({
            stats: { totalListings, activeListings, completedListings, totalEarnings, totalBidsOnItems },
            items,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
