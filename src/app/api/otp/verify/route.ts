import { NextResponse } from 'next/server';
import { otpStore } from '../send/route';

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        const stored = otpStore.get(email);

        if (!stored) {
            return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 });
        }

        if (Date.now() > stored.expiresAt) {
            otpStore.delete(email);
            return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
        }

        if (stored.otp !== otp) {
            return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 });
        }

        // OTP verified — delete from store
        otpStore.delete(email);

        return NextResponse.json({ success: true, verified: true });
    } catch (error: any) {
        console.error('OTP verify error:', error);
        return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
    }
}
