import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tier from '@/models/Tier';

// Default tiers seeded if none exist
const DEFAULT_TIERS = [
    { name: 'Tier A', minBalance: 100, bidLimit: 10000, order: 1 },
    { name: 'Tier B', minBalance: 500, bidLimit: 100000, order: 2 },
    { name: 'Tier C', minBalance: 1000, bidLimit: 1000000, order: 3 },
];

export async function GET() {
    try {
        await connectDB();

        let tiers = await Tier.find().sort({ order: 1 });

        // Seed defaults if empty
        if (tiers.length === 0) {
            tiers = await Tier.insertMany(DEFAULT_TIERS);
        }

        return NextResponse.json(tiers);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
