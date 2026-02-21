import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        const { name, email, phone, password, method } = await req.json();

        // For OTP method, password is not required
        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
        }

        if (method === 'password' && !password) {
            return NextResponse.json({ error: 'Password is required for password registration' }, { status: 400 });
        }

        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
        }

        // Create buyer account (only buyers can self-register)
        const userData: any = {
            name,
            email,
            phone: phone || '',
            role: 'Buyer',
            tier: 'None',
            walletBalance: 0,
            profileCompleted: false,
        };

        // Only set password if provided (password method)
        if (password) {
            userData.password = password; // In production, hash this with bcrypt
        }

        const user = await User.create(userData);

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
    }
}
