import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Item from '@/models/Item';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/seller/auction/[id]/payment
 * Seller marks the winner's payment as completed (e.g. paid by cash)
 * Body: { method: 'cash' | 'online' }
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

        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        await connectDB();

        const item = await Item.findById(id).populate('seller', 'name email');

        if (!item) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        // Only seller or admin can mark payment
        if (role !== 'Admin' && item.seller._id.toString() !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (item.status !== 'Completed') {
            return NextResponse.json({ error: 'Auction is not completed yet' }, { status: 400 });
        }

        if (item.winnerPaymentStatus === 'paid') {
            return NextResponse.json({ error: 'Payment is already marked as paid' }, { status: 400 });
        }

        const { method } = await req.json();
        const paymentMethod = method || 'cash';

        // Update payment status
        item.winnerPaymentStatus = 'paid';
        item.paymentMethod = paymentMethod;
        item.paymentCompletedAt = new Date();
        await item.save();

        return NextResponse.json({
            success: true,
            message: `Payment marked as completed via ${paymentMethod}`,
            paymentStatus: 'paid',
            paymentMethod,
            completedAt: item.paymentCompletedAt,
        });
    } catch (error: any) {
        console.error('Payment update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
