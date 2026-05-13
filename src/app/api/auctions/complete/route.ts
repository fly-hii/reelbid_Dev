import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User, Item, Bid, WalletTransaction } from '@/models/index';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { assertWalletIntegrity, resignWallet } from '@/lib/walletIntegrity';

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

        const item = await Item.findByPk(itemId);
        if (!item) return NextResponse.json({ error: 'Auction not found' }, { status: 404 });

        // Allow anyone to close the auction IF the time has naturally ended.
        // If it's still running, only the seller or admin can manually force-close it early.
        const userRole = (session.user as any).role;
        const userId = parseInt((session.user as any).id);
        const isOwnerOrAdmin = userRole === 'Admin' || item.sellerId === userId;
        const hasTimeExpired = new Date() >= new Date(item.endDate);

        if (!isOwnerOrAdmin && !hasTimeExpired) {
            return NextResponse.json({ error: 'Auction is still active. Only the seller or admin can close it early.' }, { status: 403 });
        }

        if (item.status === 'Completed') {
            return NextResponse.json({ error: 'Auction is already completed' }, { status: 400 });
        }

        // Get all bids for this auction
        const allBids = await Bid.findAll({ where: { itemId: item.id, depositRefunded: false } });

        // Group bids by user to find unique bidders
        const bidderMap: Record<number, { totalLocked: number; bids: any[] }> = {};
        for (const bid of allBids) {
            const bidderId = bid.userId;
            if (!bidderMap[bidderId]) {
                bidderMap[bidderId] = { totalLocked: 0, bids: [] };
            }
            bidderMap[bidderId].totalLocked += Number(bid.lockedDeposit || 0);
            bidderMap[bidderId].bids.push(bid);
        }

        const winnerId = item.highestBidderId;
        let refundCount = 0;
        let winnerDeposit = 0;

        for (const [bidderIdStr, data] of Object.entries(bidderMap)) {
            const bidderId = parseInt(bidderIdStr);
            const bidder = await User.findByPk(bidderId);
            if (!bidder) continue;

            // ── Verify wallet integrity before any balance mutation ──
            try { assertWalletIntegrity(bidder); } catch (e) {
                console.error(`Skipping bidder ${bidderId}: wallet integrity failed`);
                continue;
            }

            if (bidderId === winnerId) {
                // ========================================
                // WINNER: Adjust deposit into final payment
                // ========================================
                winnerDeposit = data.totalLocked;

                // Mark bids as won
                await Bid.update(
                    { status: 'won', depositRefunded: false },
                    { where: { itemId: item.id, userId: bidderId } }
                );

                // Unlock the deposit locally
                bidder.lockedBalance = Math.max(0, Number(bidder.lockedBalance || 0) - winnerDeposit);

                // Deduct the deposit amount from the wallet balance (it's consumed)
                bidder.walletBalance = Math.max(0, Number(bidder.walletBalance) - winnerDeposit);

                // Record the deposit extraction from the wallet
                await WalletTransaction.create({
                    userId: bidderId,
                    type: 'debit',
                    amount: winnerDeposit,
                    description: `Security deposit adjusted into payment for "${item.title}"`,
                    auctionId: item.id,
                    balanceAfter: bidder.walletBalance,
                    lockedAfter: bidder.lockedBalance,
                });

                // ── Re-sign wallet hash after mutation ──
                resignWallet(bidder);
                await bidder.save();
            } else {
                // ========================================
                // LOSERS: Refund security deposit
                // ========================================
                const refundAmount = data.totalLocked;
                if (refundAmount > 0) {
                    bidder.lockedBalance = Math.max(0, Number(bidder.lockedBalance || 0) - refundAmount);
                    // ── Re-sign wallet hash after mutation ──
                    resignWallet(bidder);
                    await bidder.save();

                    await WalletTransaction.create({
                        userId: bidderId,
                        type: 'refund',
                        amount: refundAmount,
                        description: `Security deposit refunded for "${item.title}" (auction ended)`,
                        auctionId: item.id,
                        balanceAfter: bidder.walletBalance,
                        lockedAfter: bidder.lockedBalance,
                    });

                    // Mark bids as refunded
                    await Bid.update(
                        { status: 'refunded', depositRefunded: true },
                        { where: { itemId: item.id, userId: bidderId } }
                    );

                    refundCount++;
                }
            }
        }

        // ====================================================================
        // REVENUE DISTRIBUTION: Deduct Platform Fee & Distribute among Sellers
        // ====================================================================
        if (winnerId) {
            const totalAmount = Number(item.currentPrice);
            let platformFee = 0;
            if (item.platformFeeType === 'percentage') {
                platformFee = totalAmount * (Number(item.platformFeeValue) / 100);
            } else {
                platformFee = Number(item.platformFeeValue) || 0;
            }

            const distributableAmount = Math.max(0, totalAmount - platformFee);

            // 1. Credit Platform Fee to Admin (First Admin found)
            if (platformFee > 0) {
                const adminUser = await User.findOne({ where: { role: 'Admin' } });
                if (adminUser) {
                    adminUser.walletBalance = Number(adminUser.walletBalance) + platformFee;
                    resignWallet(adminUser);
                    await adminUser.save();

                    await WalletTransaction.create({
                        userId: adminUser.id,
                        type: 'payment', // mapping platform_fee to payment since type is restricted
                        amount: platformFee,
                        description: `Platform fee received for auction "${item.title}"`,
                        auctionId: item.id,
                        balanceAfter: adminUser.walletBalance,
                        lockedAfter: adminUser.lockedBalance || 0,
                    });
                }
            }

            // 2. Distribute among sellers in revenueShares
            const revShares = item.revenueSharesArray;
            if (revShares && revShares.length > 0) {
                for (const share of revShares) {
                    const seller = await User.findByPk(share.sellerId);
                    if (seller) {
                        try {
                            assertWalletIntegrity(seller);
                            const sellerShareAmount = distributableAmount * (share.percentage / 100);
                            seller.walletBalance = Number(seller.walletBalance) + sellerShareAmount;
                            resignWallet(seller);
                            await seller.save();

                            await WalletTransaction.create({
                                userId: seller.id,
                                type: 'payment',
                                amount: sellerShareAmount,
                                description: `Revenue share (${share.percentage}%) for auction "${item.title}" (${share.professionalRole || 'Seller'})`,
                                auctionId: item.id,
                                balanceAfter: seller.walletBalance,
                                lockedAfter: seller.lockedBalance || 0,
                            });
                        } catch (e) {
                            console.error(`Failed to credit seller ${share.sellerId}:`, e);
                        }
                    }
                }
            } else {
                // Fallback: If no revenueShares, credit all to the auction creator
                const creator = await User.findByPk(item.sellerId);
                if (creator) {
                    try {
                        assertWalletIntegrity(creator);
                        creator.walletBalance = Number(creator.walletBalance) + distributableAmount;
                        resignWallet(creator);
                        await creator.save();

                        await WalletTransaction.create({
                            userId: creator.id,
                            type: 'payment',
                            amount: distributableAmount,
                            description: `Auction revenue for "${item.title}" (no split defined)`,
                            auctionId: item.id,
                            balanceAfter: creator.walletBalance,
                            lockedAfter: creator.lockedBalance || 0,
                        });
                    } catch (e) { console.error('Failed to credit creator:', e); }
                }
            }
        }

        // Update item status
        item.status = 'Completed';
        item.winnerId = winnerId ? winnerId : null;
        item.finalAmount = winnerId ? item.currentPrice : null;
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

        const item = await Item.findByPk(itemId, {
            include: [
                { model: User, as: 'winner', attributes: ['name', 'email', 'image'] },
                { model: User, as: 'seller', attributes: ['name', 'email', 'image'] },
                { model: User, as: 'highestBidder', attributes: ['name', 'email', 'image'] },
            ]
        });

        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const { Sequelize } = await import('sequelize');
        const totalBids = await Bid.count({ where: { itemId: item.id } });
        
        const uniqueBiddersObj = await Bid.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('userId')), 'userId']],
            where: { itemId: item.id }
        });

        return NextResponse.json({
            item,
            totalBids,
            uniqueBidders: uniqueBiddersObj.length,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
