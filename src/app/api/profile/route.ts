import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, phone, address, city, state, pincode } = await req.json();

        // Validate required fields
        if (!name || !phone || !address || !city || !state || !pincode) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Basic phone validation (Indian 10-digit)
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            return NextResponse.json({ error: 'Please enter a valid phone number' }, { status: 400 });
        }

        // Basic pincode validation (Indian 6-digit)
        const cleanPin = pincode.replace(/\D/g, '');
        if (cleanPin.length !== 6) {
            return NextResponse.json({ error: 'Please enter a valid 6-digit pincode' }, { status: 400 });
        }

        await connectDB();
        const user = await User.findByIdAndUpdate(
            (session.user as any).id,
            {
                name,
                phone: cleanPhone,
                address,
                city,
                state,
                pincode: cleanPin,
            },
            { new: true }
        );

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json({
            success: true,
            user: {
                name: user.name,
                phone: user.phone,
                address: user.address,
                city: user.city,
                state: user.state,
                pincode: user.pincode,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
