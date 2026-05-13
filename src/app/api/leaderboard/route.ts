import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Item from '@/models/Item';
import Bid from '@/models/Bid';
import { getSequelize } from '@/lib/mysql';
import { Op } from 'sequelize';

export async function GET() {
    try {
        await connectDB();
        const sequelize = getSequelize();

        // 1. Total Auctions Won
        const winners = await Item.findAll({
            where: {
                status: 'Completed',
                winnerId: { [Op.ne]: null }
            },
            attributes: [
                'winnerId',
                [sequelize.fn('COUNT', sequelize.col('Item.id')), 'wins'],
                [sequelize.fn('SUM', sequelize.col('Item.finalAmount')), 'totalSpent']
            ],
            group: ['winnerId', 'winner.id'],
            order: [[sequelize.literal('wins'), 'DESC']],
            limit: 10,
            include: [{ model: User, as: 'winner', attributes: ['id', 'name', 'image'] }]
        });

        const formattedWinners = winners.map((w: any) => ({
            _id: w.winner,
            wins: parseInt(w.getDataValue('wins')),
            totalSpent: parseFloat(w.getDataValue('totalSpent'))
        }));

        // 2. Most Active Bidders (Highest number of bids across platform)
        const activeBidders = await Bid.findAll({
            attributes: [
                'userId',
                [sequelize.fn('COUNT', sequelize.col('Bid.id')), 'totalBids']
            ],
            group: ['userId', 'user.id'],
            order: [[sequelize.literal('totalBids'), 'DESC']],
            limit: 10,
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'image'] }]
        });

        const formattedActiveBidders = activeBidders.map((b: any) => ({
            _id: b.user,
            totalBids: parseInt(b.getDataValue('totalBids'))
        }));

        // 3. Highest Single Bid Amount
        const highestBids = await Bid.findAll({
            attributes: [
                'userId',
                [sequelize.fn('MAX', sequelize.col('Bid.amount')), 'highestBid']
            ],
            group: ['userId', 'user.id'],
            order: [[sequelize.literal('highestBid'), 'DESC']],
            limit: 10,
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'image'] }]
        });

        const formattedHighestBids = highestBids.map((b: any) => ({
            _id: b.user,
            highestBid: parseFloat(b.getDataValue('highestBid'))
        }));

        return NextResponse.json({
            winners: formattedWinners,
            activeBidders: formattedActiveBidders,
            highestBids: formattedHighestBids
        });
    } catch (error: any) {
        console.error('Leaderboard API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch leaderboard data' }, { status: 500 });
    }
}
