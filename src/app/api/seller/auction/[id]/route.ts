import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Item from '@/models/Item';
import Bid from '@/models/Bid';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/seller/auction/[id]
 * Returns top 5 bidders for a specific completed auction
 * Only accessible by the seller who owns the auction
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        await connectDB();

        const item = await Item.findById(id)
            .populate('winner', 'name email phone image address city state pincode')
            .populate('seller', 'name email')
            .populate('highestBidder', 'name email phone image address city state pincode');

        if (!item) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        // Only seller or admin can access
        if (role !== 'Admin' && item.seller._id.toString() !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get top 5 unique bidders (highest bid per user)
        const topBids = await Bid.aggregate([
            { $match: { item: item._id } },
            { $sort: { amount: -1 } },
            {
                $group: {
                    _id: '$user',
                    highestBid: { $max: '$amount' },
                    bidCount: { $sum: 1 },
                    latestBid: { $first: '$createdAt' },
                    lockedDeposit: { $sum: '$lockedDeposit' },
                    status: { $first: '$status' },
                }
            },
            { $sort: { highestBid: -1 } },
            { $limit: 5 },
        ]);

        // Populate user details for top bidders
        const userIds = topBids.map(b => b._id);
        const users = await User.find({ _id: { $in: userIds } })
            .select('name email phone image address city state pincode')
            .lean();

        const userMap: Record<string, any> = {};
        users.forEach(u => { userMap[(u as any)._id.toString()] = u; });

        const topBidders = topBids.map((bid, index) => ({
            rank: index + 1,
            user: userMap[bid._id.toString()] || { name: 'Unknown', email: '' },
            highestBid: bid.highestBid,
            bidCount: bid.bidCount,
            latestBid: bid.latestBid,
            lockedDeposit: bid.lockedDeposit,
            status: bid.status,
            isWinner: item.winner && bid._id.toString() === item.winner._id?.toString(),
        }));

        // Calculate remaining amount for winner
        const winnerBidder = topBidders.find(b => b.isWinner);
        const remainingAmount = winnerBidder
            ? winnerBidder.highestBid - winnerBidder.lockedDeposit
            : 0;

        return NextResponse.json({
            auction: {
                _id: item._id,
                title: item.title,
                description: item.description,
                images: item.images,
                category: item.category,
                startingPrice: item.startingPrice,
                currentPrice: item.currentPrice,
                finalAmount: item.finalAmount,
                status: item.status,
                startDate: item.startDate,
                endDate: item.endDate,
                bidCount: item.bidCount,
                securityPercentage: item.securityPercentage,
                winner: item.winner,
                winnerPaymentStatus: item.winnerPaymentStatus || 'pending',
                paymentMethod: item.paymentMethod,
                paymentCompletedAt: item.paymentCompletedAt,
                secondChanceStatus: item.secondChanceStatus || 'closed',
                secondChanceNotifiedAt: item.secondChanceNotifiedAt,
                secondChanceOffers: item.secondChanceOffers || [],
                shippingAddress: item.shippingAddress || null,
                lastPaymentReminder: item.lastPaymentReminder,
            },
            topBidders,
            remainingAmount,
        });
    } catch (error: any) {
        console.error('Seller auction detail error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
