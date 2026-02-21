'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import BuyerDashboard from './BuyerDashboard';
import SellerDashboard from './SellerDashboard';
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [profileChecked, setProfileChecked] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            window.location.href = '/auth/signin';
            return;
        }
        if (status !== 'authenticated') return;

        const role = (session?.user as any)?.role || 'Buyer';
        let fallbackCompleted = false;
        try { fallbackCompleted = sessionStorage.getItem('profile_completed_fallback') === 'true'; } catch { }

        const profileCompleted = (session?.user as any)?.profileCompleted || fallbackCompleted;

        // Only Buyers need to complete their profile
        if (role === 'Buyer' && !profileCompleted) {
            // Double-check with the API in case session is stale
            fetch(`/api/profile/complete?t=${Date.now()}`)
                .then(r => r.json())
                .then(data => {
                    if (!data.profileCompleted) {
                        router.push('/profile/complete');
                    } else {
                        setProfileChecked(true);
                    }
                })
                .catch(() => setProfileChecked(true));
        } else {
            setProfileChecked(true);
        }
    }, [status, session, router]);

    if (status === 'loading' || !profileChecked) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" />
            </div>
        );
    }

    const role = (session?.user as any)?.role || 'Buyer';

    if (role === 'Admin') return <AdminDashboard />;
    if (role === 'Seller') return <SellerDashboard />;
    return <BuyerDashboard />;
}
