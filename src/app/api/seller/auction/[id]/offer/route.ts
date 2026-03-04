import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Item from '@/models/Item';
import Bid from '@/models/Bid';
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
 * POST /api/seller/auction/[id]/offer
 * Seller notifies top 4 runner-up bidders that the winner failed to pay.
 * Each bidder can then log in and submit a second-chance bid (±5% of winning amount).
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

        const sellerId = (session.user as any).id;
        const role = (session.user as any).role;

        await connectDB();

        const item = await Item.findById(id)
            .populate('seller', 'name email');

        if (!item) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        if (role !== 'Admin' && item.seller._id.toString() !== sellerId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (item.status !== 'Completed') {
            return NextResponse.json({ error: 'Auction is not completed' }, { status: 400 });
        }

        // Get winning bid amount
        const winningAmount = item.finalAmount || item.currentPrice;

        // Get top 5 unique bidders, skip the winner (rank 1)
        const topBids = await Bid.aggregate([
            { $match: { item: item._id } },
            { $sort: { amount: -1 } },
            {
                $group: {
                    _id: '$user',
                    highestBid: { $max: '$amount' },
                }
            },
            { $sort: { highestBid: -1 } },
            { $limit: 5 },
        ]);

        // Filter out the winner
        const runnerUpBids = topBids.filter(
            b => !item.winner || b._id.toString() !== item.winner.toString()
        ).slice(0, 4);

        if (runnerUpBids.length === 0) {
            return NextResponse.json({ error: 'No runner-up bidders found' }, { status: 400 });
        }

        // Get user details
        const userIds = runnerUpBids.map(b => b._id);
        const users = await User.find({ _id: { $in: userIds } }).select('name email').lean();
        const userMap: Record<string, any> = {};
        users.forEach(u => { userMap[(u as any)._id.toString()] = u; });

        // Send emails to all runner-ups
        const sentTo: string[] = [];
        for (const bid of runnerUpBids) {
            const user = userMap[bid._id.toString()];
            if (!user || !user.email) continue;

            const minPrice = Math.round(winningAmount * 0.95);
            const maxPrice = Math.round(winningAmount * 1.05);

            await transporter.sendMail({
                from: `"ReelBid" <${process.env.EMAIL_FROM || 'noreply@reelbid.com'}>`,
                to: user.email,
                subject: `🎯 Second Chance! You can still get "${item.title}"`,
                html: `
                    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1c1c21; color: #f4f4f5; border-radius: 16px; overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 32px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 800;">🎯 Second Chance Offer!</h1>
                            <p style="margin: 8px 0 0; opacity: 0.9;">The original winner didn't complete the purchase</p>
                        </div>
                        <div style="padding: 32px;">
                            <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700;">${item.title}</h2>
                            <div style="background: #27272a; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                                <div style="margin-bottom: 12px;">
                                    <span style="color: #a1a1aa; font-size: 14px;">Winning Bid Amount</span>
                                    <p style="margin: 4px 0 0; font-size: 28px; font-weight: 800; color: #7c3aed;">₹${winningAmount.toLocaleString()}</p>
                                </div>
                                <div style="border-top: 1px solid #3f3f46; padding-top: 12px;">
                                    <span style="color: #a1a1aa; font-size: 13px;">You can purchase this item for</span>
                                    <p style="margin: 4px 0 0; font-size: 18px; font-weight: 700; color: #22c55e;">
                                        ₹${minPrice.toLocaleString()} — ₹${maxPrice.toLocaleString()}
                                    </p>
                                    <p style="margin: 4px 0 0; color: #71717a; font-size: 12px;">
                                        (±5% of winning bid)
                                    </p>
                                </div>
                            </div>
                            <p style="color: #a1a1aa; line-height: 1.6;">
                                Hi ${user.name}, the original winner failed to complete their payment.
                                You now have a second chance to purchase "${item.title}".
                                Log in to select your price (±5% of the winning bid) and submit your offer to the seller.
                            </p>
                            <div style="margin-top: 24px; text-align: center;">
                                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auctions/${item._id}?secondChance=true"
                                   style="display: inline-block; background: #7c3aed; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700;">
                                    Submit Your Offer →
                                </a>
                            </div>
                        </div>
                        <div style="padding: 16px 32px; background: #111113; text-align: center; font-size: 12px; color: #71717a;">
                            ReelBid — Premium Movie Memorabilia Auctions
                        </div>
                    </div>
                `,
            });

            sentTo.push(`${user.name} (${user.email})`);
        }

        // Mark the item as having second-chance offers open
        item.secondChanceStatus = 'open';
        item.secondChanceNotifiedAt = new Date();
        await item.save();

        return NextResponse.json({
            success: true,
            message: `Second-chance notifications sent to ${sentTo.length} bidder(s)`,
            sentTo,
        });
    } catch (error: any) {
        console.error('Second chance notification error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
