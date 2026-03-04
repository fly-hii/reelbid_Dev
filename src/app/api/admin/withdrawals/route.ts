import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WithdrawRequest from '@/models/WithdrawRequest';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== 'Admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Fetch all withdraw requests, populate the user making the request
        const withdrawals = await WithdrawRequest.find()
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(withdrawals);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
