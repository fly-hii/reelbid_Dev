import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// Admin: update a user's role
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'Admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { userId, role } = await req.json();

        if (!userId || !role || !['Admin', 'Seller', 'Buyer'].includes(role)) {
            return NextResponse.json({ error: 'Invalid userId or role' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('name email role');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Admin: delete a user
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'Admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // Prevent self-deletion
        if (userId === (session.user as any).id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }

        await connectDB();
        const deleted = await User.findByIdAndDelete(userId);
        if (!deleted) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
