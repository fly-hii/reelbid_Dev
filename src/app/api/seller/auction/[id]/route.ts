import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Item, Bid, User } from '@/models/index';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fn, col, literal } from 'sequelize';

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

        const userId = parseInt((session.user as any).id);
        const role = (session.user as any).role;

        await connectDB();

        const item = await Item.findByPk(id, {
            include: [
                { model: User, as: 'winner', attributes: ['id', 'name', 'email', 'phone', 'image', 'address', 'city', 'state', 'pincode'] },
                { model: User, as: 'seller', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'highestBidder', attributes: ['id', 'name', 'email', 'phone', 'image', 'address', 'city', 'state', 'pincode'] }
            ]
        });

        if (!item) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        // Only seller or admin can access
        if (role !== 'Admin' && item.sellerId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get top 5 unique bidders (highest bid per user)
        const topBids = await Bid.findAll({
            attributes: [
                'userId',
                [fn('MAX', col('amount')), 'highestBid'],
                [fn('COUNT', col('id')), 'bidCount'],
                [fn('MIN', col('createdAt')), 'latestBid'],
                [fn('SUM', col('lockedDeposit')), 'lockedDeposit'],
                [fn('MAX', col('status')), 'status']
            ],
            where: { itemId: item.id },
            group: ['userId'],
            order: [[literal('highestBid'), 'DESC']],
            limit: 5,
            raw: true
        });

        // Populate user details for top bidders
        const userIds = topBids.map((b: any) => b.userId);
        const { Op } = await import('sequelize');
        const users = await User.findAll({
            where: { id: { [Op.in]: userIds } },
            attributes: ['id', 'name', 'email', 'phone', 'image', 'address', 'city', 'state', 'pincode'],
            raw: true
        });

        const userMap: Record<string, any> = {};
        users.forEach((u: any) => { 
            const plain = { ...u, _id: u.id };
            userMap[u.id.toString()] = plain; 
        });

        const topBidders = topBids.map((bid: any, index) => ({
            rank: index + 1,
            user: userMap[bid.userId.toString()] || { name: 'Unknown', email: '' },
            highestBid: Number(bid.highestBid),
            bidCount: Number(bid.bidCount),
            latestBid: bid.latestBid,
            lockedDeposit: Number(bid.lockedDeposit),
            status: bid.status,
            isWinner: item.winnerId && bid.userId === item.winnerId,
        }));

        // Calculate remaining amount for winner
        const winnerBidder = topBidders.find((b: any) => b.isWinner);
        const remainingAmount = winnerBidder
            ? winnerBidder.highestBid - winnerBidder.lockedDeposit
            : 0;

        const plainItem = item.toJSON() as any;

        return NextResponse.json({
            auction: {
                _id: plainItem.id,
                title: plainItem.title,
                description: plainItem.description,
                images: item.imagesArray,
                category: plainItem.category,
                startingPrice: plainItem.startingPrice,
                currentPrice: plainItem.currentPrice,
                finalAmount: plainItem.finalAmount,
                status: plainItem.status,
                startDate: plainItem.startDate,
                endDate: plainItem.endDate,
                bidCount: plainItem.bidCount,
                securityPercentage: plainItem.securityPercentage,
                winner: plainItem.winner,
                winnerPaymentStatus: plainItem.winnerPaymentStatus || 'pending',
                paymentMethod: plainItem.paymentMethod,
                paymentCompletedAt: plainItem.paymentCompletedAt,
                secondChanceStatus: plainItem.secondChanceStatus || 'closed',
                secondChanceNotifiedAt: plainItem.secondChanceNotifiedAt,
                secondChanceOffers: item.secondChanceOffersArray || [],
                shippingAddress: item.shippingAddressObj || null,
                lastPaymentReminder: plainItem.lastPaymentReminder,
            },
            topBidders,
            remainingAmount,
        });
    } catch (error: any) {
        console.error('Seller auction detail error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
