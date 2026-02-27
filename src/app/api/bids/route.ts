import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Item from '@/models/Item';
import Bid from '@/models/Bid';
import WalletTransaction from '@/models/WalletTransaction';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { sendExtensionEmail } from '@/lib/emails';

// GET top bids for an item
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get('itemId');
        const userId = searchParams.get('userId');
        const limit = parseInt(searchParams.get('limit') || '5', 10);

        await connectDB();

        // If userId provided, return that user's bids across all auctions
        if (userId) {
            const bids = await Bid.find({ user: userId })
                .sort({ createdAt: -1 })
                .populate('item', 'title images currentPrice endDate status securityPercentage')
                .lean();

            const enhancedBids = await Promise.all(bids.map(async (bid: any) => {
                const higherBidsCount = await Bid.countDocuments({
                    item: bid.item._id,
                    amount: { $gt: bid.amount }
                });
                return {
                    ...bid,
                    position: higherBidsCount + 1
                };
            }));

            return NextResponse.json(enhancedBids);
        }

        if (!itemId) {
            return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
        }

        const bids = await Bid.find({ item: itemId })
            .sort({ amount: -1 })
            .limit(limit)
            .populate('user', 'name image')
            .lean();

        return NextResponse.json(bids);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { itemId, amount } = await req.json();
        await connectDB();

        const user = await User.findById((session.user as any).id);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        if (user.role !== 'Buyer') {
            return NextResponse.json({ error: 'Only buyers can place bids' }, { status: 403 });
        }

        const item = await Item.findById(itemId);
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        if (item.seller.toString() === user._id.toString()) {
            return NextResponse.json({ error: 'Sellers cannot bid on their own items' }, { status: 403 });
        }

        if (item.status !== 'Active') {
            return NextResponse.json({ error: 'This auction is not active' }, { status: 400 });
        }

        const now = new Date();
        if (now > item.endDate) {
            return NextResponse.json({ error: 'Auction has ended' }, { status: 400 });
        }

        if (amount <= item.currentPrice) {
            return NextResponse.json({ error: 'Bid must be higher than current price' }, { status: 400 });
        }

        if (amount < item.startingPrice) {
            return NextResponse.json({ error: 'Bid must be at least the base price' }, { status: 400 });
        }

        // Find what this buyer already has locked on THIS auction
        const existingBidsOnItem = await Bid.find({
            item: item._id,
            user: user._id,
            depositRefunded: false,
        }).sort({ createdAt: 1 });

        // ========================================
        // DYNAMIC DEPOSIT CALCULATION
        // ========================================
        const securityPct = item.securityPercentage || 5;
        const LIMIT = 80000;
        const STEP = 10000;
        let requiredDeposit = 0;

        if (existingBidsOnItem.length === 0) {
            if (amount <= LIMIT) {
                requiredDeposit = Math.ceil((amount * securityPct) / 100);
            } else {
                const baseDeposit = Math.ceil((LIMIT * securityPct) / 100);
                const extraAmount = amount - LIMIT;
                const extraSteps = Math.floor(extraAmount / STEP);
                const extraDeposit = Math.ceil((extraSteps * STEP * securityPct) / 100);
                requiredDeposit = baseDeposit + extraDeposit;
            }
        } else {
            const firstBidAmount = existingBidsOnItem[0].amount;
            const initialRequiredDeposit = Math.ceil((firstBidAmount * securityPct) / 100);

            let baseRequired = 0;
            if (firstBidAmount <= LIMIT) {
                const limitForDoubling = Math.min(amount, LIMIT);
                const ratio = limitForDoubling / firstBidAmount;
                const power = Math.max(0, Math.floor(Math.log2(ratio)));
                baseRequired = initialRequiredDeposit * Math.pow(2, power);
            } else {
                baseRequired = Math.ceil((LIMIT * securityPct) / 100);
            }

            let extraDeposit = 0;
            if (amount > LIMIT) {
                const extraAmount = amount - LIMIT;
                const extraSteps = Math.floor(extraAmount / STEP);
                extraDeposit = Math.ceil((extraSteps * STEP * securityPct) / 100);
            }
            requiredDeposit = baseRequired + extraDeposit;
        }

        const alreadyLocked = existingBidsOnItem.reduce(
            (sum: number, b: any) => sum + (b.lockedDeposit || 0), 0
        );

        const additionalNeeded = Math.max(0, requiredDeposit - alreadyLocked);
        const availableBalance = user.walletBalance - (user.lockedBalance || 0);

        if (additionalNeeded > 0 && additionalNeeded > availableBalance) {
            return NextResponse.json({
                error: `Insufficient balance. Required Lock: ₹${requiredDeposit}, Already Locked: ₹${alreadyLocked}, Please add ₹${additionalNeeded} to your wallet.`,
            }, { status: 400 });
        }

        // ========================================
        // LOCK THE ADDITIONAL DEPOSIT
        // ========================================
        if (additionalNeeded > 0) {
            user.lockedBalance = (user.lockedBalance || 0) + additionalNeeded;
            await user.save();

            // record the lock transaction
            await WalletTransaction.create({
                user: user._id,
                type: 'lock',
                amount: additionalNeeded,
                description: `Security deposit locked for bid ₹${amount} on "${item.title}"`,
                auction: item._id,
                balanceAfter: user.walletBalance,
                lockedAfter: user.lockedBalance,
            });
        }

        // ========================================
        // SNIPER PROTECTION
        // ========================================
        const timeRemaining = item.endDate.getTime() - now.getTime();
        let extended = false;
        if (timeRemaining <= 10 * 60 * 1000 && timeRemaining > 0) {
            item.endDate = new Date(item.endDate.getTime() + 60 * 60 * 1000);
            extended = true;
        }

        // ========================================
        // MARK PREVIOUS TOP BID AS OUTBID
        // ========================================
        await Bid.updateMany(
            { item: item._id, isTopBid: true },
            { isTopBid: false, status: 'outbid' }
        );

        // ========================================
        // CREATE THE NEW BID
        // ========================================
        const bid = await Bid.create({
            amount,
            user: user._id,
            item: item._id,
            isTopBid: true,
            lockedDeposit: additionalNeeded, // only the newly locked amount for this bid
            status: 'active',
        });

        // Update item
        item.currentPrice = amount;
        item.highestBidder = user._id;
        item.bidCount = (item.bidCount || 0) + 1;
        await item.save();

        // Trigger Notification if extended
        if (extended) {
            try {
                await sendExtensionEmail(item._id.toString());
            } catch (err) {
                console.error('Email failed to send:', err);
            }
        }

        // Broadcast to web sockets
        const io = (global as any).io;
        if (io) {
            io.to(itemId).emit('bidUpdated', {
                itemId,
                newPrice: item.currentPrice,
                endDate: item.endDate,
                highestBidderId: user._id,
                bidCount: item.bidCount,
            });
        }

        return NextResponse.json({
            success: true,
            newPrice: item.currentPrice,
            endDate: item.endDate,
            lockedDeposit: requiredDeposit,
            additionalLocked: additionalNeeded,
            totalLockedOnAuction: requiredDeposit,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
