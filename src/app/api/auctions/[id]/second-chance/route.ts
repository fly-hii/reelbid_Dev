import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Item, Bid, User } from '@/models/index';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/auctions/[id]/second-chance
 * Returns second-chance offer details for the current buyer
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
        await connectDB();

        const item = await Item.findByPk(id);
        if (!item) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        // Check if user has a bid on this auction
        const userBid = await Bid.findOne({ 
            where: { itemId: item.id, userId },
            order: [['amount', 'DESC']]
        });

        if (!userBid) {
            return NextResponse.json({ error: 'You did not bid on this auction' }, { status: 400 });
        }

        // Check if second-chance is open
        const isOpen = item.secondChanceStatus === 'open';

        // Check if user is the winner (winners don't get second chance)
        const isWinner = item.winnerId?.toString() === userId.toString();

        // Check if user already submitted a second-chance offer
        const existingOffer = item.secondChanceOffersArray.find(
            (o: any) => o.userId?.toString() === userId.toString()
        );

        const winningAmount = Number(item.finalAmount) || Number(item.currentPrice);

        return NextResponse.json({
            isOpen,
            isWinner,
            winningAmount,
            userBidAmount: Number(userBid.amount),
            minPrice: Math.round(winningAmount * 0.95),
            maxPrice: Math.round(winningAmount * 1.05),
            existingOffer: existingOffer || null,
            auctionTitle: item.title,
        });
    } catch (error: any) {
        console.error('Second chance GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/auctions/[id]/second-chance
 * Buyer submits their second-chance offer (±5% of winning bid)
 * Body: { percentageAdjustment: number } (-5 to +5)
 */
export async function POST(
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
        await connectDB();

        const item = await Item.findByPk(id);
        if (!item) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        if (item.secondChanceStatus !== 'open') {
            return NextResponse.json({ error: 'Second-chance offers are not open for this auction' }, { status: 400 });
        }

        // Check user is not the winner
        if (item.winnerId === userId) {
            return NextResponse.json({ error: 'Winners cannot submit second-chance offers' }, { status: 400 });
        }

        // Check user has a bid
        const userBid = await Bid.findOne({ 
            where: { itemId: item.id, userId },
            order: [['amount', 'DESC']]
        });
        
        if (!userBid) {
            return NextResponse.json({ error: 'You did not bid on this auction' }, { status: 400 });
        }

        const offers = item.secondChanceOffersArray;

        // Check if already submitted
        const alreadySubmitted = offers.some(
            (o: any) => parseInt(o.userId) === userId
        );
        if (alreadySubmitted) {
            return NextResponse.json({ error: 'You have already submitted a second-chance offer' }, { status: 400 });
        }

        const { percentageAdjustment } = await req.json();
        const adjustment = parseFloat(percentageAdjustment) || 0;
        if (adjustment < -5 || adjustment > 5) {
            return NextResponse.json({ error: 'Adjustment must be between -5% and +5%' }, { status: 400 });
        }

        const winningAmount = Number(item.finalAmount) || Number(item.currentPrice);
        const offerPrice = Math.round(winningAmount * (1 + adjustment / 100));

        const user = await User.findByPk(userId, { attributes: ['name', 'email'] });

        const offerRecord = {
            userId,
            userName: user?.name || 'Unknown',
            userEmail: user?.email || '',
            originalBid: Number(userBid.amount),
            offerPrice,
            percentageAdjustment: adjustment,
            sentAt: new Date(),
            status: 'pending', // buyer submitted, waiting for seller approval
        };

        offers.push(offerRecord);
        item.secondChanceOffers = JSON.stringify(offers);
        await item.save();

        return NextResponse.json({
            success: true,
            message: `Your offer of ₹${offerPrice.toLocaleString()} has been sent to the seller!`,
            offer: offerRecord,
        });
    } catch (error: any) {
        console.error('Second chance POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
