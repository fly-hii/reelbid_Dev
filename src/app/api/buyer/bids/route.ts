import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Bid from '@/models/Bid';
import Item from '@/models/Item';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// Get buyer's bid history and won items
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        await connectDB();

        // Get all user bids
        const bids = await Bid.find({ user: userId })
            .populate({
                path: 'item',
                select: 'title currentPrice startingPrice endDate status highestBidder seller',
                populate: { path: 'seller', select: 'name' },
            })
            .sort({ createdAt: -1 })
            .lean();

        // Get items won by user
        const wonItems = await Item.find({
            highestBidder: userId,
            $or: [
                { status: 'Completed' },
                { status: 'Active', endDate: { $lte: new Date() } },
            ],
        })
            .populate('seller', 'name')
            .sort({ endDate: -1 })
            .lean();

        // Get active bids (items still live)
        const activeBids = bids.filter(
            (b: any) => b.item && b.item.status === 'Active' && new Date(b.item.endDate) > new Date()
        );

        const totalBidsPlaced = bids.length;
        const totalWon = wonItems.length;
        const totalSpent = wonItems.reduce((sum: number, i: any) => sum + (i.currentPrice || 0), 0);

        return NextResponse.json({
            stats: { totalBidsPlaced, totalWon, totalSpent, activeBidsCount: activeBids.length },
            bids,
            wonItems,
            activeBids,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
