import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Item from '@/models/Item';
import Bid from '@/models/Bid';
import WalletTransaction from '@/models/WalletTransaction';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

/**
 * POST /api/auctions/complete
 * Body: { itemId: string }
 * 
 * This endpoint handles auction completion:
 * 1. Marks auction as Completed
 * 2. Declares the highest bidder as winner
 * 3. Adjusts winner's security deposit into final payment
 * 4. Refunds all losing bidders' security deposits
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { itemId } = await req.json();
        await connectDB();

        const item = await Item.findById(itemId);
        if (!item) return NextResponse.json({ error: 'Auction not found' }, { status: 404 });

        // Allow anyone to close the auction IF the time has naturally ended.
        // If it's still running, only the seller or admin can manually force-close it early.
        const userRole = (session.user as any).role;
        const userId = (session.user as any).id;
        const isOwnerOrAdmin = userRole === 'Admin' || item.seller.toString() === userId;
        const hasTimeExpired = new Date() >= new Date(item.endDate);

        if (!isOwnerOrAdmin && !hasTimeExpired) {
            return NextResponse.json({ error: 'Auction is still active. Only the seller or admin can close it early.' }, { status: 403 });
        }

        if (item.status === 'Completed') {
            return NextResponse.json({ error: 'Auction is already completed' }, { status: 400 });
        }

        // Get all bids for this auction
        const allBids = await Bid.find({ item: item._id, depositRefunded: false });

        // Group bids by user to find unique bidders
        const bidderMap: Record<string, { totalLocked: number; bids: any[] }> = {};
        for (const bid of allBids) {
            const bidderId = bid.user.toString();
            if (!bidderMap[bidderId]) {
                bidderMap[bidderId] = { totalLocked: 0, bids: [] };
            }
            bidderMap[bidderId].totalLocked += bid.lockedDeposit || 0;
            bidderMap[bidderId].bids.push(bid);
        }

        const winnerId = item.highestBidder?.toString();
        let refundCount = 0;
        let winnerDeposit = 0;

        for (const [bidderId, data] of Object.entries(bidderMap)) {
            const bidder = await User.findById(bidderId);
            if (!bidder) continue;

            if (bidderId === winnerId) {
                // ========================================
                // WINNER: Adjust deposit into final payment
                // ========================================
                winnerDeposit = data.totalLocked;
                const remainingPayment = item.currentPrice - winnerDeposit;

                // Mark bids as won
                await Bid.updateMany(
                    { item: item._id, user: bidderId },
                    { status: 'won', depositRefunded: false }
                );

                // Unlock the deposit locally
                bidder.lockedBalance = Math.max(0, (bidder.lockedBalance || 0) - winnerDeposit);

                // Deduct the full final item price from wallet balance
                bidder.walletBalance = Math.max(0, bidder.walletBalance - item.currentPrice);

                // Record the remaining payment outside of deposit tracking
                if (remainingPayment > 0) {
                    await WalletTransaction.create({
                        user: bidderId,
                        type: 'payment',
                        amount: remainingPayment,
                        description: `Final payment for winning "${item.title}" (₹${item.currentPrice} - ₹${winnerDeposit} deposit)`,
                        auction: item._id,
                        balanceAfter: bidder.walletBalance + winnerDeposit,
                        lockedAfter: bidder.lockedBalance,
                    });
                }

                // Also record the deposit extraction
                await WalletTransaction.create({
                    user: bidderId,
                    type: 'debit',
                    amount: winnerDeposit,
                    description: `Security deposit adjusted into payment for "${item.title}"`,
                    auction: item._id,
                    balanceAfter: bidder.walletBalance,
                    lockedAfter: bidder.lockedBalance,
                });

                await bidder.save();
            } else {
                // ========================================
                // LOSERS: Refund security deposit
                // ========================================
                const refundAmount = data.totalLocked;
                if (refundAmount > 0) {
                    bidder.lockedBalance = Math.max(0, (bidder.lockedBalance || 0) - refundAmount);
                    await bidder.save();

                    await WalletTransaction.create({
                        user: bidderId,
                        type: 'refund',
                        amount: refundAmount,
                        description: `Security deposit refunded for "${item.title}" (auction ended)`,
                        auction: item._id,
                        balanceAfter: bidder.walletBalance,
                        lockedAfter: bidder.lockedBalance,
                    });

                    // Mark bids as refunded
                    await Bid.updateMany(
                        { item: item._id, user: bidderId },
                        { status: 'refunded', depositRefunded: true }
                    );

                    refundCount++;
                }
            }
        }

        // Update item status
        item.status = 'Completed';
        item.winner = winnerId ? winnerId : undefined;
        item.finalAmount = winnerId ? item.currentPrice : undefined;
        await item.save();

        // Broadcast completion via socket
        const io = (global as any).io;
        if (io) {
            io.to(itemId).emit('auctionCompleted', {
                itemId,
                winnerId,
                finalPrice: item.currentPrice,
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Auction completed successfully',
            winner: winnerId || null,
            finalPrice: item.currentPrice,
            winnerDeposit,
            refundedBidders: refundCount,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET /api/auctions/complete?itemId=xxx
 * Returns auction completion summary
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get('itemId');

        if (!itemId) {
            return NextResponse.json({ error: 'itemId required' }, { status: 400 });
        }

        await connectDB();

        const item = await Item.findById(itemId)
            .populate('winner', 'name email image')
            .populate('seller', 'name email image')
            .populate('highestBidder', 'name email image');

        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const totalBids = await Bid.countDocuments({ item: itemId });
        const uniqueBidders = await Bid.distinct('user', { item: itemId });

        return NextResponse.json({
            item,
            totalBids,
            uniqueBidders: uniqueBidders.length,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
