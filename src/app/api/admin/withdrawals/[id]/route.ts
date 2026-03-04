import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WithdrawRequest from '@/models/WithdrawRequest';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { assertWalletIntegrity, resignWallet } from '@/lib/walletIntegrity';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== 'Admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { status, adminNotes } = await req.json();

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        await connectDB();

        const withdrawal = await WithdrawRequest.findById(id).populate('user');
        if (!withdrawal) {
            return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 });
        }

        if (withdrawal.status !== 'pending') {
            return NextResponse.json({ error: `Withdrawal is already ${withdrawal.status}` }, { status: 400 });
        }

        const user = await User.findById(withdrawal.user._id);
        if (!user) {
            return NextResponse.json({ error: 'Associated user not found' }, { status: 404 });
        }

        // ── Verify wallet integrity BEFORE any balance mutation ──
        assertWalletIntegrity(user);

        // Processing status
        withdrawal.status = status;
        if (adminNotes) withdrawal.adminNotes = adminNotes;

        if (status === 'rejected') {
            // Refund the user walletbalance (amount verified from DB withdrawal record, NOT client)
            user.walletBalance += withdrawal.amount;

            // ── Re-sign wallet hash after mutation ──
            resignWallet(user);
            await user.save();

            await WalletTransaction.create({
                user: user._id,
                type: 'credit',
                amount: withdrawal.amount,
                description: `Withdrawal request rejected by Admin. Amount refunded.`,
                balanceAfter: user.walletBalance,
                lockedAfter: user.lockedBalance || 0,
            });
        }

        await withdrawal.save();

        return NextResponse.json({ success: true, withdrawal });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
