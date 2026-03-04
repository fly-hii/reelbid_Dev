import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Item from '@/models/Item';
import Bid from '@/models/Bid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validateFields } from '@/lib/profanityFilter';

function getRazorpay() {
    const Razorpay = require('razorpay');
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || '',
        key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
}

/**
 * POST /api/payment
 * Creates a Razorpay order for the winner to pay the remaining amount
 * Body: { auctionId: string }
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { auctionId, shippingAddress } = await req.json();

        if (!auctionId) {
            return NextResponse.json({ error: 'auctionId is required' }, { status: 400 });
        }

        // Validate shipping address
        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
            return NextResponse.json({ error: 'Complete shipping address is required' }, { status: 400 });
        }

        // Check for profanity in address fields
        const profanityError = validateFields({ 'Full Name': shippingAddress.fullName, 'Address': shippingAddress.addressLine, 'City': shippingAddress.city, 'State': shippingAddress.state });
        if (profanityError) {
            return NextResponse.json({ error: profanityError }, { status: 400 });
        }

        await connectDB();

        const item = await Item.findById(auctionId);
        if (!item) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        // Save shipping address to the item
        item.shippingAddress = {
            fullName: shippingAddress.fullName,
            phone: shippingAddress.phone,
            addressLine: shippingAddress.addressLine,
            city: shippingAddress.city,
            state: shippingAddress.state,
            pincode: shippingAddress.pincode,
        };
        await item.save();

        if (item.status !== 'Completed') {
            return NextResponse.json({ error: 'Auction is not completed' }, { status: 400 });
        }

        // Check this user is the winner
        if (!item.winner || item.winner.toString() !== userId) {
            return NextResponse.json({ error: 'You are not the winner of this auction' }, { status: 403 });
        }

        if (item.winnerPaymentStatus === 'paid') {
            return NextResponse.json({ error: 'Payment is already completed' }, { status: 400 });
        }

        // Calculate remaining amount
        const winningAmount = item.finalAmount || item.currentPrice;

        // Get the user's locked deposit for this auction
        const userBids = await Bid.find({ item: item._id, user: userId });
        const lockedDeposit = userBids.reduce((sum: number, b: any) => sum + (b.lockedDeposit || 0), 0);

        const remainingAmount = Math.max(0, winningAmount - lockedDeposit);

        if (remainingAmount <= 0) {
            return NextResponse.json({ error: 'No remaining amount to pay' }, { status: 400 });
        }

        // Create Razorpay order (amount in paise)
        const order = await getRazorpay().orders.create({
            amount: remainingAmount * 100,
            currency: 'INR',
            receipt: `rb_${auctionId.slice(-8)}_${Date.now().toString(36)}`,
            notes: {
                auctionId: auctionId,
                userId: userId,
                auctionTitle: item.title,
                winningAmount: winningAmount.toString(),
                remainingAmount: remainingAmount.toString(),
            },
        });

        return NextResponse.json({
            orderId: order.id,
            amount: remainingAmount,
            currency: 'INR',
            keyId: process.env.RAZORPAY_KEY_ID,
            auctionTitle: item.title,
            winningAmount,
            lockedDeposit,
            remainingAmount,
        });
    } catch (error: any) {
        console.error('Payment order creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
