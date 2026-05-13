import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Item, User } from '@/models/index';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validateFields } from '@/lib/profanityFilter';
import { processAndUploadImages } from '@/lib/imageUpload';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const sellerId = searchParams.get('sellerId');
        const status = searchParams.get('status');

        await connectDB();

        if (id) {
            const item = await Item.findByPk(id, {
                include: [
                    { model: User, as: 'highestBidder', attributes: ['id', 'name', 'email', 'image', 'phone', 'address', 'city', 'state', 'pincode'] },
                    { model: User, as: 'winner', attributes: ['id', 'name', 'email', 'image', 'phone', 'address', 'city', 'state', 'pincode'] },
                    { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'image'] },
                ],
            });
            if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            const plain = item.toJSON() as any;
            plain.images = item.imagesArray;
            plain.revenueShares = item.revenueSharesArray;
            plain.shippingAddress = item.shippingAddressObj;
            plain.secondChanceOffers = item.secondChanceOffersArray;
            plain._id = item.id;
            return NextResponse.json(plain);
        }

        const session = await getServerSession(authOptions);
        const where: any = {};

        if (sellerId) {
            // For Sequelize JSON search — find items where revenueShares contains the sellerId
            const { Op } = await import('sequelize');
            where.revenueShares = { [Op.like]: `%${sellerId}%` };
        } else if ((session?.user as any)?.role === 'Admin') {
            const { Op } = await import('sequelize');
            where.status = { [Op.in]: ['Pending', 'Active', 'Completed', 'Cancelled'] };
        } else {
            const { Op } = await import('sequelize');
            where.status = { [Op.in]: ['Active', 'Completed'] };
        }

        if (status) {
            where.status = status;
        }

        const items = await Item.findAll({
            where,
            order: [['endDate', 'DESC']],
            include: [
                { model: User, as: 'highestBidder', attributes: ['id', 'name', 'image'] },
                { model: User, as: 'winner', attributes: ['id', 'name', 'image'] },
                { model: User, as: 'seller', attributes: ['id', 'name', 'image'] },
            ],
        });

        const result = items.map(item => {
            const plain = item.toJSON() as any;
            plain.images = item.imagesArray;
            plain.revenueShares = item.revenueSharesArray;
            plain._id = item.id;
            return plain;
        });

        return NextResponse.json(result);
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

        if ((session.user as any).role !== 'Admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await connectDB();
        const body = await req.json();

        const secPct = body.securityPercentage ?? 5;
        if (secPct < 1 || secPct > 50) {
            return NextResponse.json({ error: 'Security percentage must be between 1% and 50%' }, { status: 400 });
        }

        const profanityError = validateFields({ Title: body.title || '', Description: body.description || '' });
        if (profanityError) {
            return NextResponse.json({ error: profanityError }, { status: 400 });
        }

        // Upload images to S3 (auto-converts to WebP)
        let imageUrls: string[] = [];
        if (body.images && body.images.length > 0) {
            imageUrls = await processAndUploadImages(body.images, 'items');
        }

        const item = await Item.create({
            title: body.title,
            movieName: body.movieName || '',
            description: body.description,
            images: JSON.stringify(imageUrls),
            category: body.category || 'General',
            startingPrice: body.startingPrice,
            currentPrice: body.startingPrice || 0,
            securityPercentage: secPct,
            startDate: body.startDate,
            endDate: body.endDate,
            platformFeeType: body.platformFeeType || 'percentage',
            platformFeeValue: body.platformFeeValue || 0,
            revenueShares: JSON.stringify(body.revenueShares || []),
            sellerId: parseInt((session.user as any).id),
            status: 'Active',
        });

        const plain = item.toJSON() as any;
        plain.images = imageUrls;
        plain._id = item.id;
        return NextResponse.json(plain);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { itemId, ...updates } = body;

        await connectDB();
        const item = await Item.findByPk(itemId);
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        const userRole = (session.user as any).role;
        const userId = parseInt((session.user as any).id);
        if (userRole !== 'Admin' && item.sellerId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (item.bidCount > 0 && (updates.startingPrice || updates.securityPercentage)) {
            return NextResponse.json({ error: 'Cannot change price or deposit % after bids exist' }, { status: 400 });
        }

        if (updates.title || updates.description) {
            const profanityError = validateFields({
                ...(updates.title ? { Title: updates.title } : {}),
                ...(updates.description ? { Description: updates.description } : {}),
            });
            if (profanityError) {
                return NextResponse.json({ error: profanityError }, { status: 400 });
            }
        }

        // Handle image updates
        if (updates.images && Array.isArray(updates.images)) {
            const imageUrls = await processAndUploadImages(updates.images, 'items');
            updates.images = JSON.stringify(imageUrls);
        }
        if (updates.revenueShares) {
            updates.revenueShares = JSON.stringify(updates.revenueShares);
        }
        if (updates.shippingAddress && typeof updates.shippingAddress === 'object') {
            updates.shippingAddress = JSON.stringify(updates.shippingAddress);
        }
        if (updates.secondChanceOffers) {
            updates.secondChanceOffers = JSON.stringify(updates.secondChanceOffers);
        }

        await item.update(updates);

        const plain = item.toJSON() as any;
        plain.images = item.imagesArray;
        plain._id = item.id;
        return NextResponse.json(plain);
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
        const item = await Item.findByPk(itemId);
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        const userRole = (session.user as any).role;
        const userId = parseInt((session.user as any).id);

        if (userRole !== 'Admin' && item.sellerId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (item.status === 'Active' && item.bidCount > 0) {
            return NextResponse.json({ error: 'Cannot delete active auction with existing bids' }, { status: 400 });
        }

        await item.destroy();
        return NextResponse.json({ success: true, message: 'Auction deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
