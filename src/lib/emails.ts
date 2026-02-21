import nodemailer from 'nodemailer';
import connectDB from '@/lib/db';
import Bid from '@/models/Bid';
import User from '@/models/User';
import Item from '@/models/Item';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587', 10),
    auth: {
        user: process.env.EMAIL_SERVER_USER || 'admin@reelbid.com',
        pass: process.env.EMAIL_SERVER_PASSWORD || 'secret',
    },
});

export async function sendExtensionEmail(itemId: string) {
    try {
        await connectDB();
        const item = await Item.findById(itemId);
        if (!item) return;

        // Get Top 10 previous bidders
        const topBids = await Bid.aggregate([
            { $match: { item: item._id } },
            { $sort: { amount: -1 } },
            { $group: { _id: "$user", amount: { $max: "$amount" } } },
            { $sort: { amount: -1 } },
            { $limit: 10 }
        ]);

        const userIds = topBids.map(b => b._id);
        const usersToNotify = await User.find({ _id: { $in: userIds } });

        // Send emails
        for (const user of usersToNotify) {
            if (user.email) {
                await transporter.sendMail({
                    from: `"ReelBid Alerts" <${process.env.EMAIL_FROM || 'noreply@reelbid.com'}>`,
                    to: user.email,
                    subject: `Auction Extended: ${item.title} 🚨`,
                    text: `Hi ${user.name},\n\nThe auction for "${item.title}" has been manually extended by 1 hour due to recent bidding activity (Sniper Protection).\n\nHurry and place your bids to win!\n\nReelBid Team`
                });
            }
        }
    } catch (error) {
        console.error('Failed to send extension email:', error);
    }
}
