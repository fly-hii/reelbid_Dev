import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { FanAssociation, FanMember, User } from '@/models/index';

// Public: Get fan association by slug with all members
export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await connectDB();
        const { slug } = await params;

        const association = await FanAssociation.findOne({ 
            where: { slug, isActive: true },
            include: [{ model: User, as: 'president', attributes: ['name', 'email', 'phone'] }]
        });

        if (!association) {
            return NextResponse.json({ error: 'Fan association not found' }, { status: 404 });
        }

        const members = await FanMember.findAll({ 
            where: { associationId: association.id },
            order: [['order', 'ASC'], ['createdAt', 'ASC']]
        });

        const assocPlain = association.toJSON() as any;
        assocPlain._id = assocPlain.id;

        const membersPlain = members.map(m => {
            const plain = m.toJSON() as any;
            plain._id = plain.id;
            return plain;
        });

        return NextResponse.json({
            success: true,
            association: assocPlain,
            members: membersPlain,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
