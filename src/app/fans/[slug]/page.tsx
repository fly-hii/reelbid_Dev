import { Metadata } from 'next';
import connectDB from '@/lib/db';
import FanAssociation from '@/models/FanAssociation';
import FanMember from '@/models/FanMember';
import User from '@/models/User';
import FanPageClient from './FanPageClient';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    await connectDB();
    const association = await FanAssociation.findOne({ where: { slug, isActive: true } });

    if (!association) {
        return { title: 'Fan Association Not Found | ReelBid' };
    }

    return {
        title: `${association.heroName} Fans Association ${association.areaName} | ReelBid`,
        description: `Official fan page of ${association.heroName} Fans Association, ${association.areaName}. ${association.description || `Join the fan community and celebrate the legacy of ${association.heroName}!`}`,
        keywords: `${association.heroName}, fans, fan association, ${association.areaName}, reelbid, ${association.heroName} fans association ${association.areaName}, telugu fans, movie fans`,
        openGraph: {
            title: `${association.heroName} Fans Association - ${association.areaName}`,
            description: association.description || `Official fan page of ${association.heroName} in ${association.areaName}`,
            images: association.heroImage ? [association.heroImage] : [],
            type: 'website',
        },
    };
}

export default async function FanPage({ params }: Props) {
    const { slug } = await params;
    await connectDB();

    const association: any = await FanAssociation.findOne({
        where: { slug, isActive: true },
        include: [{ model: User, as: 'president', attributes: ['id', 'name', 'email', 'phone'] }]
    });

    if (!association) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 20px', minHeight: '60vh' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '12px' }}>Fan Association Not Found</h1>
                <p style={{ color: 'var(--text-muted)' }}>The fan association you&apos;re looking for doesn&apos;t exist or has been deactivated.</p>
            </div>
        );
    }

    const members = await FanMember.findAll({
        where: { associationId: association.id },
        order: [['order', 'ASC'], ['createdAt', 'ASC']]
    });

    // Serialize for client component
    const serializedAssociation = JSON.parse(JSON.stringify(association.get({ plain: true })));
    serializedAssociation._id = serializedAssociation.id; // Map id to _id for frontend parity

    const serializedMembers = members.map(m => {
        const plain = m.get({ plain: true });
        return { ...plain, _id: plain.id };
    });

    return <FanPageClient association={serializedAssociation} members={serializedMembers} />;
}
