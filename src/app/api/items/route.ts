import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Item from '@/models/Item';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validateFields } from '@/lib/profanityFilter';

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

        const session = await getServerSession(authOptions);
        const filter: any = {};
        if (sellerId) {
            filter['revenueShares.sellerId'] = sellerId;
        } else if ((session?.user as any)?.role === 'Admin') {
            filter.status = { $in: ['Pending', 'Active', 'Completed', 'Cancelled'] };
        } else {
            filter.status = { $in: ['Active', 'Completed'] };
        }

        if (status) {
            filter.status = status;
        }

        const items = await Item.find(filter)
            .sort({ endDate: -1 })
            .populate('highestBidder', 'name image')
            .populate('winner', 'name image')
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

        // Only Admin can create items now
        if ((session.user as any).role !== 'Admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await connectDB();
        const body = await req.json();

        // Validate securityPercentage
        const secPct = body.securityPercentage ?? 5;
        if (secPct < 1 || secPct > 50) {
            return NextResponse.json({ error: 'Security percentage must be between 1% and 50%' }, { status: 400 });
        }

        // Check for profanity in title & description
        const profanityError = validateFields({ Title: body.title || '', Description: body.description || '' });
        if (profanityError) {
            return NextResponse.json({ error: profanityError }, { status: 400 });
        }

        const item = await Item.create({
            title: body.title,
            movieName: body.movieName || '',
            description: body.description,
            images: body.images || [],
            category: body.category || 'General',
            startingPrice: body.startingPrice,
            securityPercentage: secPct,
            startDate: body.startDate,
            endDate: body.endDate,
            platformFeeType: body.platformFeeType || 'percentage',
            platformFeeValue: body.platformFeeValue || 0,
            revenueShares: body.revenueShares || [], // Admin specifies sellers & percentages
            seller: (session.user as any).id,
            status: 'Active', // Admin creating it directly makes it Active
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

        // Check for profanity in title & description if being updated
        if (updates.title || updates.description) {
            const profanityError = validateFields({
                ...(updates.title ? { Title: updates.title } : {}),
                ...(updates.description ? { Description: updates.description } : {}),
            });
            if (profanityError) {
                return NextResponse.json({ error: profanityError }, { status: 400 });
            }
        }

        Object.assign(item, updates);
        await item.save();

        return NextResponse.json(item);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get('itemId');

        if (!itemId) return NextResponse.json({ error: 'itemId is required' }, { status: 400 });

        await connectDB();
        const item = await Item.findById(itemId);
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        const userRole = (session.user as any).role;
        const userId = (session.user as any).id;

        // Only Admin or the Seller who created it can delete
        if (userRole !== 'Admin' && item.seller.toString() !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Prevent deleting active auction with bids
        if (item.status === 'Active' && item.bidCount > 0) {
            return NextResponse.json({ error: 'Cannot delete active auction with existing bids' }, { status: 400 });
        }

        await Item.findByIdAndDelete(itemId);
        return NextResponse.json({ success: true, message: 'Auction deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
