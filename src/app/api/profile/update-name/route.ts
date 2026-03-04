import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { containsProfanity } from '@/lib/profanityFilter';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name } = await req.json();

        if (!name || name.trim().length < 2) {
            return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
        }

        // Check for profanity
        const badWord = containsProfanity(name);
        if (badWord) {
            return NextResponse.json({ error: 'Name contains inappropriate language. Please choose a different name.' }, { status: 400 });
        }

        await connectDB();
        const user = await User.findByIdAndUpdate(
            (session.user as any).id,
            { name: name.trim() },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, name: user.name });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
