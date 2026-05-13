import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Bid, Item, User } from '@/models/index';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Op } from 'sequelize';

// Get buyer's bid history and won items
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        await connectDB();

        // Get all user bids
        const bidsData = await Bid.findAll({
            where: { userId },
            include: [{
                model: Item,
                as: 'item',
                attributes: ['id', 'title', 'currentPrice', 'startingPrice', 'endDate', 'status', 'highestBidderId', 'sellerId'],
                include: [{ model: User, as: 'seller', attributes: ['id', 'name'] }]
            }],
            order: [['createdAt', 'DESC']]
        });

        const bids = bidsData.map(b => {
            const plain = b.toJSON() as any;
            if (plain.item) plain.item._id = plain.item.id;
            if (plain.item && plain.item.seller) plain.item.seller._id = plain.item.seller.id;
            return plain;
        });

        // Get items won by user
        const wonItemsData = await Item.findAll({
            where: {
                highestBidderId: userId,
                [Op.or]: [
                    { status: 'Completed' },
                    { status: 'Active', endDate: { [Op.lte]: new Date() } },
                ]
            },
            include: [{ model: User, as: 'seller', attributes: ['id', 'name'] }],
            order: [['endDate', 'DESC']]
        });

        const wonItems = wonItemsData.map(i => {
            const plain = i.toJSON() as any;
            plain._id = plain.id;
            if (plain.seller) plain.seller._id = plain.seller.id;
            return plain;
        });

        // Get active bids (items still live)
        const activeBids = bids.filter(
            (b: any) => b.item && b.item.status === 'Active' && new Date(b.item.endDate) > new Date()
        );

        const totalBidsPlaced = bids.length;
        const totalWon = wonItems.length;
        const totalSpent = wonItems.reduce((sum: number, i: any) => sum + Number(i.currentPrice || 0), 0);

        return NextResponse.json({
            stats: { totalBidsPlaced, totalWon, totalSpent, activeBidsCount: activeBids.length },
            bids,
            wonItems,
            activeBids,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
