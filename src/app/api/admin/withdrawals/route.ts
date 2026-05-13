import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { WithdrawRequest, User } from '@/models/index';
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
        const withdrawals = await WithdrawRequest.findAll({
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone'] }]
        });

        const result = withdrawals.map(w => {
            const plain = w.toJSON() as any;
            plain._id = plain.id;
            return plain;
        });

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
