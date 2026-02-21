import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Item from '@/models/Item';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        await connectDB();

        if (id) {
            const item = await Item.findById(id).populate('highestBidder', 'name email image phone address city state pincode');
            if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            return NextResponse.json(item);
        }

        const items = await Item.find({ status: { $in: ['Active', 'Completed'] } })
            .sort({ endDate: 1 })
            .populate('highestBidder', 'name image');

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

        const item = await Item.create({
            ...body,
            seller: (session.user as any).id,
            status: 'Active',
        });

        return NextResponse.json(item);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
