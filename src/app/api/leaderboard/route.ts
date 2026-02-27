import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Item from '@/models/Item';
import Bid from '@/models/Bid';

export async function GET() {
    try {
        await connectDB();

        // 1. Total Auctions Won
        const winners = await Item.aggregate([
            { $match: { status: 'Completed', winner: { $exists: true, $ne: null } } },
            { $group: { _id: '$winner', wins: { $sum: 1 }, totalSpent: { $sum: '$finalAmount' } } },
            { $sort: { wins: -1 } },
            { $limit: 10 }
        ]);

        const populatedWinners = await User.populate(winners, { path: '_id', select: 'name image' });

        // 2. Most Active Bidders (Highest number of bids across platform)
        const activeBidders = await Bid.aggregate([
            { $group: { _id: '$user', totalBids: { $sum: 1 } } },
            { $sort: { totalBids: -1 } },
            { $limit: 10 }
        ]);

        const populatedActiveBidders = await User.populate(activeBidders, { path: '_id', select: 'name image' });

        // 3. Highest Single Bid Amount
        const highestBids = await Bid.aggregate([
            { $group: { _id: '$user', highestBid: { $max: '$amount' } } },
            { $sort: { highestBid: -1 } },
            { $limit: 10 }
        ]);

        const populatedHighestBids = await User.populate(highestBids, { path: '_id', select: 'name image' });

        return NextResponse.json({
            winners: populatedWinners,
            activeBidders: populatedActiveBidders,
            highestBids: populatedHighestBids
        });
    } catch (error: any) {
        console.error('Leaderboard API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch leaderboard data' }, { status: 500 });
    }
}
