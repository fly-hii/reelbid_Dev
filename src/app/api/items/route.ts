import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Item from '@/models/Item';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const sellerId = searchParams.get('sellerId');
        const status = searchParams.get('status');

        await connectDB();

        if (id) {
            const item = await Item.findById(id)
                .populate('highestBidder', 'name email image phone address city state pincode')
                .populate('winner', 'name email image phone address city state pincode')
                .populate('seller', 'name email image');
            if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            return NextResponse.json(item);
        }

        const filter: any = {};
        if (sellerId) {
            filter.seller = sellerId;
        } else {
            filter.status = { $in: ['Active', 'Completed'] };
        }

        if (status) {
            filter.status = status;
        }

        const items = await Item.find(filter)
            .sort({ endDate: 1 })
            .populate('highestBidder', 'name image')
            .populate('seller', 'name image');

        return NextResponse.json(items);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only Admin or Seller can create items
        if ((session.user as any).role !== 'Admin' && (session.user as any).role !== 'Seller') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await connectDB();
        const body = await req.json();

        // Validate securityPercentage
        const secPct = body.securityPercentage ?? 5;
        if (secPct < 1 || secPct > 50) {
            return NextResponse.json({ error: 'Security percentage must be between 1% and 50%' }, { status: 400 });
        }

        const item = await Item.create({
            title: body.title,
            description: body.description,
            images: body.images || [],
            category: body.category || 'General',
            startingPrice: body.startingPrice,
            securityPercentage: secPct,
            startDate: body.startDate,
            endDate: body.endDate,
            seller: (session.user as any).id,
            status: 'Active',
        });

        return NextResponse.json(item);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH — update item (for seller who owns it)
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { itemId, ...updates } = body;

        await connectDB();
        const item = await Item.findById(itemId);
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        const userRole = (session.user as any).role;
        const userId = (session.user as any).id;
        if (userRole !== 'Admin' && item.seller.toString() !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Prevent editing active auction's key fields if bids exist
        if (item.bidCount > 0 && (updates.startingPrice || updates.securityPercentage)) {
            return NextResponse.json({ error: 'Cannot change price or deposit % after bids exist' }, { status: 400 });
        }

        Object.assign(item, updates);
        await item.save();

        return NextResponse.json(item);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
