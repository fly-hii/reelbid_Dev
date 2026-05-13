import nodemailer from 'nodemailer';
import connectDB from '@/lib/db';
import { Bid, User, Item } from '@/models/index';
import { Op, fn, col, literal } from 'sequelize';
import { getSequelize } from '@/lib/mysql';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587', 10),
    auth: {
        user: process.env.EMAIL_SERVER_USER || 'admin@reelbid.com',
        pass: process.env.EMAIL_SERVER_PASSWORD || 'secret',
    },
});

export async function sendExtensionEmail(itemId: string | number) {
    try {
        await connectDB();
        const item = await Item.findByPk(itemId);
        if (!item) return;

        // Get Top 10 distinct bidders by max bid amount
        const sequelize = getSequelize();
        const topBidders = await Bid.findAll({
            attributes: ['userId', [fn('MAX', col('amount')), 'maxAmount']],
            where: { itemId: item.id },
            group: ['userId'],
            order: [[literal('maxAmount'), 'DESC']],
            limit: 10,
            raw: true,
        });

        const userIds = topBidders.map((b: any) => b.userId);
        if (userIds.length === 0) return;

        const usersToNotify = await User.findAll({ where: { id: { [Op.in]: userIds } } });

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
