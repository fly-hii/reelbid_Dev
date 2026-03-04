import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import WithdrawRequest from '@/models/WithdrawRequest';
import WalletTransaction from '@/models/WalletTransaction';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { assertWalletIntegrity, resignWallet } from '@/lib/walletIntegrity';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        await connectDB();

        const requests = await WithdrawRequest.find({ user: userId }).sort({ createdAt: -1 });
        return NextResponse.json(requests);
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

        const userId = (session.user as any).id;
        const { amount, bankName, accountName, accountNumber, ifscCode } = await req.json();

        // ── Server-side amount validation ──
        if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 100) {
            return NextResponse.json({ error: 'Minimum withdrawal amount is ₹100' }, { status: 400 });
        }

        const sanitizedAmount = Math.round(amount);
        if (sanitizedAmount < 100) {
            return NextResponse.json({ error: 'Minimum withdrawal amount is ₹100' }, { status: 400 });
        }

        // ── Bank details validation ──
        if (!bankName || typeof bankName !== 'string' || bankName.trim().length < 2) {
            return NextResponse.json({ error: 'Valid bank name is required' }, { status: 400 });
        }
        if (!accountName || typeof accountName !== 'string' || accountName.trim().length < 2) {
            return NextResponse.json({ error: 'Valid account holder name is required' }, { status: 400 });
        }
        if (!accountNumber || typeof accountNumber !== 'string' || !/^\d{9,18}$/.test(accountNumber.trim())) {
            return NextResponse.json({ error: 'Valid account number is required (9-18 digits)' }, { status: 400 });
        }
        if (!ifscCode || typeof ifscCode !== 'string' || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.trim().toUpperCase())) {
            return NextResponse.json({ error: 'Valid IFSC code is required (e.g. HDFC0001234)' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // ── Verify wallet integrity BEFORE mutation ──
        assertWalletIntegrity(user);

        // ── Balance check from DB (NEVER trust client-side balance) ──
        const dbAvailableBalance = user.walletBalance - (user.lockedBalance || 0);

        if (sanitizedAmount > dbAvailableBalance) {
            return NextResponse.json({ error: 'Insufficient available balance' }, { status: 400 });
        }

        // Deduct from wallet right away to prevent double withdrawal
        user.walletBalance -= sanitizedAmount;

        // ── Re-sign wallet hash after mutation ──
        resignWallet(user);
        await user.save();

        // Create the withdraw request with sanitized values
        const withdrawal = await WithdrawRequest.create({
            user: userId,
            amount: sanitizedAmount,
            bankName: bankName.trim(),
            accountName: accountName.trim(),
            accountNumber: accountNumber.trim(),
            ifscCode: ifscCode.trim().toUpperCase(),
            status: 'pending'
        });

        // Record via Wallet Transaction
        await WalletTransaction.create({
            user: userId,
            type: 'debit',
            amount: sanitizedAmount,
            description: `Withdrawal request initiated (#${withdrawal._id.toString().substring(0, 8)})`,
            balanceAfter: user.walletBalance,
            lockedAfter: user.lockedBalance || 0,
        });

        return NextResponse.json({ success: true, withdrawal });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
