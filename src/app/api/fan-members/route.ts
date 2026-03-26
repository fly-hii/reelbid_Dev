import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FanMember from '@/models/FanMember';
import FanAssociation from '@/models/FanAssociation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Add member to fan association (President or Admin)
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['Admin', 'President'].includes((session.user as any)?.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { associationId, title, name, designation, phone, photo, order } = body;

        if (!associationId || !title || !name || !designation) {
            return NextResponse.json({ error: 'Association ID, title, name, and designation are required' }, { status: 400 });
        }

        await connectDB();

        // If president, verify they own this association
        if ((session.user as any).role === 'President') {
            const association = await FanAssociation.findById(associationId);
            if (!association || association.president.toString() !== (session.user as any).id) {
                return NextResponse.json({ error: 'You can only add members to your own association' }, { status: 403 });
            }
        }

        const member = await FanMember.create({
            association: associationId,
            title,
            name,
            designation,
            phone: phone || '',
            photo: photo || '',
            order: order || 0,
        });

        return NextResponse.json({ success: true, member });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Get members of a fan association
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const associationId = searchParams.get('associationId');

        if (!associationId) {
            return NextResponse.json({ error: 'Association ID required' }, { status: 400 });
        }

        const members = await FanMember.find({ association: associationId })
            .sort({ order: 1, createdAt: 1 });

        return NextResponse.json({ success: true, members });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Update a member
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['Admin', 'President'].includes((session.user as any)?.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { memberId, title, name, designation, phone, photo, order } = body;

        if (!memberId) {
            return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
        }

        await connectDB();

        const updateData: any = {};
        if (title) updateData.title = title;
        if (name) updateData.name = name;
        if (designation) updateData.designation = designation;
        if (phone !== undefined) updateData.phone = phone;
        if (photo !== undefined) updateData.photo = photo;
        if (order !== undefined) updateData.order = order;

        const member = await FanMember.findByIdAndUpdate(memberId, updateData, { new: true });
        if (!member) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, member });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Delete a member
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['Admin', 'President'].includes((session.user as any)?.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const memberId = searchParams.get('id');

        if (!memberId) {
            return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
        }

        await connectDB();
        const deleted = await FanMember.findByIdAndDelete(memberId);
        if (!deleted) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
