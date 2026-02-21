import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Item from '@/models/Item';
import Bid from '@/models/Bid';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { sendExtensionEmail } from '@/lib/emails';

// GET top bids for an item
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get('itemId');
        const limit = parseInt(searchParams.get('limit') || '5', 10);

        if (!itemId) {
            return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
        }

        await connectDB();

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

        const item = await Item.findById(itemId);
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        if (item.seller.toString() === user._id.toString()) {
            return NextResponse.json({ error: 'Sellers cannot bid on their own items' }, { status: 403 });
        }

        const now = new Date();
        if (now > item.endDate) {
            return NextResponse.json({ error: 'Auction has ended' }, { status: 400 });
        }

        if (amount <= item.currentPrice) {
            return NextResponse.json({ error: 'Bid must be higher than current price' }, { status: 400 });
        }

        // Checking Wallet balance vs Bid amount limit
        // Tier A: Wallet >= 100 -> 10,000
        // Tier B: Wallet >= 500 -> 100,000
        // Tier C: Wallet >= 1000 -> 1,000,000
        let bidLimit = 0;
        if (user.walletBalance >= 1000) bidLimit = 1000000;
        else if (user.walletBalance >= 500) bidLimit = 100000;
        else if (user.walletBalance >= 100) bidLimit = 10000;

        if (amount > bidLimit) {
            return NextResponse.json({ error: 'Bid exceeds your wallet tier limit' }, { status: 400 });
        }

        // Sniper Protection
        // Trigger if bid placed within last 10 minutes of auction
        const timeRemaining = item.endDate.getTime() - now.getTime();
        let extended = false;
        if (timeRemaining <= 10 * 60 * 1000 && timeRemaining > 0) {
            // Extend by 1 hour
            item.endDate = new Date(item.endDate.getTime() + 60 * 60 * 1000);
            extended = true;
        }

        // Create bid
        const bid = await Bid.create({
            amount,
            user: user._id,
            item: item._id,
            isTopBid: true,
        });

        // Update old top bids to false
        await Bid.updateMany({ item: item._id, _id: { $ne: bid._id } }, { isTopBid: false });

        // Update item current price
        item.currentPrice = amount;
        item.highestBidder = user._id;
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
            });
        }

        return NextResponse.json({
            success: true,
            newPrice: item.currentPrice,
            endDate: item.endDate
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
