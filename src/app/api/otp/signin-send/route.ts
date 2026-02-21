import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

// In-memory OTP store for sign-in (separate from registration)
export const signinOtpStore = new Map<string, { otp: string; expiresAt: number }>();

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        await connectDB();

        // User must exist to sign in via OTP
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return NextResponse.json({ error: 'No account found with this email' }, { status: 404 });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Store OTP
        signinOtpStore.set(email, { otp, expiresAt });

        // Log OTP for dev
        console.log(`[SIGNIN OTP] ${email} => ${otp}`);

        // Optionally send email
        try {
            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT) || 587,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            });

            if (process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_USER !== 'your_email@gmail.com') {
                await transporter.sendMail({
                    from: process.env.EMAIL_FROM || 'noreply@reelbid.com',
                    to: email,
                    subject: 'ReelBid — Your Sign-In OTP',
                    html: `
                        <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px;">
                            <h2 style="color: #7c3aed;">ReelBid Sign In</h2>
                            <p>Your one-time password to sign in is:</p>
                            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #7c3aed; padding: 16px 0;">${otp}</div>
                            <p style="color: #888;">This code expires in 5 minutes. Do not share it with anyone.</p>
                        </div>
                    `,
                });
            }
        } catch (emailErr) {
            console.log('[SIGNIN OTP] Email sending skipped or failed:', emailErr);
        }

        return NextResponse.json({ success: true, message: 'OTP sent to your email' });
    } catch (error: any) {
        console.error('Signin OTP send error:', error);
        return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
    }
}
