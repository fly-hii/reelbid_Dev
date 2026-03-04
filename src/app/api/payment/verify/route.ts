import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Item from '@/models/Item';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

/**
 * POST /api/payment/verify
 * Verifies Razorpay payment signature and marks the auction payment as completed
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, auctionId }
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            auctionId,
        } = await req.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !auctionId) {
            return NextResponse.json({ error: 'Missing required payment fields' }, { status: 400 });
        }

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: 'Payment verification failed — invalid signature' }, { status: 400 });
        }

        await connectDB();

        const item = await Item.findById(auctionId);
        if (!item) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        // Verify user is the winner
        if (!item.winner || item.winner.toString() !== userId) {
            return NextResponse.json({ error: 'You are not the winner of this auction' }, { status: 403 });
        }

        if (item.winnerPaymentStatus === 'paid') {
            return NextResponse.json({ error: 'Payment already completed' }, { status: 400 });
        }

        // Mark payment as completed
        item.winnerPaymentStatus = 'paid';
        item.paymentMethod = 'online';
        item.paymentCompletedAt = new Date();
        item.razorpayOrderId = razorpay_order_id;
        item.razorpayPaymentId = razorpay_payment_id;
        await item.save();

        return NextResponse.json({
            success: true,
            message: 'Payment verified and completed successfully!',
            paymentId: razorpay_payment_id,
        });
    } catch (error: any) {
        console.error('Payment verification error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
