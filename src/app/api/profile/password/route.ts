import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/index';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 });
        }

        await connectDB();
        const user = await User.findByPk((session.user as any).id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.password && currentPassword !== 'otp-verified' && currentPassword !== 'google-login') {
            return NextResponse.json({ error: 'You are signed in via OTP or Google. You cannot change your password via this method.' }, { status: 400 });
        }

        let isValid = false;

        if (user.password?.startsWith('$2a$') || user.password?.startsWith('$2b$')) {
            isValid = await bcrypt.compare(currentPassword, user.password);
        } else {
            isValid = (currentPassword === user.password);
        }

        if (!isValid) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return NextResponse.json({ success: true, message: 'Password updated successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
