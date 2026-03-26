import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FanAssociation from '@/models/FanAssociation';
import FanMember from '@/models/FanMember';

// Public: Get fan association by slug with all members
export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await connectDB();
        const { slug } = await params;

        const association = await FanAssociation.findOne({ slug, isActive: true })
            .populate('president', 'name email phone');

        if (!association) {
            return NextResponse.json({ error: 'Fan association not found' }, { status: 404 });
        }

        const members = await FanMember.find({ association: association._id })
            .sort({ order: 1, createdAt: 1 });

        return NextResponse.json({
            success: true,
            association,
            members,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
