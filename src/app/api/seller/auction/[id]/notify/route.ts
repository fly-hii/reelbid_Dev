import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Item from '@/models/Item';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587', 10),
    auth: {
        user: process.env.EMAIL_SERVER_USER || 'admin@reelbid.com',
        pass: process.env.EMAIL_SERVER_PASSWORD || 'secret',
    },
});

/**
 * POST /api/seller/auction/[id]/notify
 * Send payment reminder to the auction winner
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

        const item = await Item.findById(id)
            .populate('winner', 'name email')
            .populate('seller', 'name email');

        if (!item) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        if (role !== 'Admin' && item.seller._id.toString() !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (!item.winner) {
            return NextResponse.json({ error: 'No winner for this auction' }, { status: 400 });
        }

        const winner = await User.findById(item.winner._id);
        if (!winner || !winner.email) {
            return NextResponse.json({ error: 'Winner email not found' }, { status: 400 });
        }

        const finalAmount = item.finalAmount || item.currentPrice;

        await transporter.sendMail({
            from: `"ReelBid" <${process.env.EMAIL_FROM || 'noreply@reelbid.com'}>`,
            to: winner.email,
            subject: `⚡ Payment Reminder: Complete your purchase for "${item.title}"`,
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1c1c21; color: #f4f4f5; border-radius: 16px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 32px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 800;">🎉 Congratulations, ${winner.name}!</h1>
                        <p style="margin: 8px 0 0; opacity: 0.9;">You won the auction for "${item.title}"</p>
                    </div>
                    <div style="padding: 32px;">
                        <div style="background: #27272a; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                            <p style="margin: 0 0 8px; color: #a1a1aa; font-size: 14px;">Final Winning Amount</p>
                            <p style="margin: 0; font-size: 28px; font-weight: 800; color: #7c3aed;">₹${finalAmount.toLocaleString()}</p>
                        </div>
                        <p style="color: #a1a1aa; line-height: 1.6;">
                            This is a friendly reminder from the seller to complete your remaining payment for the item.
                            Please ensure the payment is completed at the earliest to avoid losing your winning bid.
                        </p>
                        <div style="margin-top: 24px; text-align: center;">
                            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard"
                               style="display: inline-block; background: #7c3aed; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700;">
                                Complete Payment →
                            </a>
                        </div>
                    </div>
                    <div style="padding: 16px 32px; background: #111113; text-align: center; font-size: 12px; color: #71717a;">
                        ReelBid — Premium Movie Memorabilia Auctions
                    </div>
                </div>
            `,
        });

        item.lastPaymentReminder = new Date();
        await item.save();

        return NextResponse.json({
            success: true,
            message: `Payment reminder sent to ${winner.name} (${winner.email})`,
        });
    } catch (error: any) {
        console.error('Notify winner error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
