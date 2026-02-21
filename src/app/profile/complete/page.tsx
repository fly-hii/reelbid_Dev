'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Loader2, User, Phone, MapPin, Building, Map, Hash,
    Film, CheckCircle, ArrowRight, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
    'Chandigarh', 'Andaman & Nicobar', 'Dadra & Nagar Haveli', 'Lakshadweep',
];

export default function CompleteProfile() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [form, setForm] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
    });

    // Pre-fill from session & check if already completed
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }
        if (status === 'loading') return;

        // Fetch current profile data
        fetch(`/api/profile/complete?t=${Date.now()}`)
            .then(r => r.json())
            .then(data => {
                let fallbackCompleted = false;
                try { fallbackCompleted = sessionStorage.getItem('profile_completed_fallback') === 'true'; } catch { }

                if (data.profileCompleted || fallbackCompleted) {
                    // Profile already completed, redirect to dashboard
                    router.push('/dashboard');
                    return;
                }
                setForm({
                    name: data.name || (session?.user?.name ?? ''),
                    phone: data.phone || '',
                    address: data.address || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                });
                setChecking(false);
            })
            .catch(() => {
                setForm(f => ({ ...f, name: session?.user?.name ?? '' }));
                setChecking(false);
            });
    }, [status, session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/profile/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || 'Something went wrong');
                setLoading(false);
                return;
            }

            toast.success('Profile completed! Welcome to ReelBid 🎬');
            // Update the session to reflect profileCompleted = true
            try { sessionStorage.setItem('profile_completed_fallback', 'true'); } catch { }
            await update();
            setTimeout(() => router.push('/dashboard'), 800);
        } catch {
            toast.error('Failed to save profile');
            setLoading(false);
        }
    };

    if (status === 'loading' || checking) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '75vh', padding: '24px 0' }}>
            <div
                className="animate-slide-up"
                style={{
                    width: '100%',
                    maxWidth: '520px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '24px',
                    padding: '44px 36px',
                    boxShadow: 'var(--shadow-floating)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Top accent line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--accent), #22c55e, #ec4899)' }} />

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div
                        style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, var(--accent), #22c55e)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            margin: '0 auto 18px',
                            boxShadow: '0 6px 20px rgba(124, 58, 237, 0.25)',
                        }}
                    >
                        <Sparkles style={{ width: 28, height: 28 }} />
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        Complete Your Profile
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px', maxWidth: '380px', margin: '8px auto 0' }}>
                        Just a few details before you start bidding on movie memorabilia
                    </p>
                </div>

                {/* Email badge (read-only) */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 16px', borderRadius: '12px',
                    background: 'var(--accent-soft)', border: '1px solid var(--accent)',
                    marginBottom: '24px',
                }}>
                    <CheckCircle style={{ width: 18, height: 18, color: 'var(--accent-text)' }} />
                    <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Signed in as</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-text)' }}>{session?.user?.email}</div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Full Name */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                            Full Name *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <User style={{ width: 18, height: 18 }} />
                            </div>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                                className="input-field focus-ring"
                                style={{ paddingLeft: '42px' }}
                                placeholder="Your full name"
                            />
                        </div>
                    </div>

                    {/* Mobile Number */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                            Mobile Number *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Phone style={{ width: 18, height: 18 }} />
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>+91</span>
                            </div>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                required
                                className="input-field focus-ring"
                                style={{ paddingLeft: '76px' }}
                                placeholder="10-digit mobile number"
                                maxLength={10}
                                inputMode="numeric"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                            Address *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }}>
                                <MapPin style={{ width: 18, height: 18 }} />
                            </div>
                            <textarea
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                required
                                className="input-field focus-ring"
                                style={{ paddingLeft: '42px', resize: 'vertical', minHeight: '65px' }}
                                placeholder="House/Flat No., Street, Locality"
                            />
                        </div>
                    </div>

                    {/* City & State */}
                    <div className="register-password-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                City *
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                    <Building style={{ width: 18, height: 18 }} />
                                </div>
                                <input
                                    type="text"
                                    value={form.city}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    required
                                    className="input-field focus-ring"
                                    style={{ paddingLeft: '42px' }}
                                    placeholder="City"
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                State *
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                    <Map style={{ width: 18, height: 18 }} />
                                </div>
                                <select
                                    value={form.state}
                                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                                    required
                                    className="input-field focus-ring"
                                    style={{ paddingLeft: '42px', appearance: 'none' }}
                                >
                                    <option value="">Select State</option>
                                    {INDIAN_STATES.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Pincode */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                            Pincode *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <Hash style={{ width: 18, height: 18 }} />
                            </div>
                            <input
                                type="text"
                                value={form.pincode}
                                onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                required
                                className="input-field focus-ring"
                                style={{ paddingLeft: '42px' }}
                                placeholder="6-digit pincode"
                                maxLength={6}
                                inputMode="numeric"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            padding: '15px',
                            fontSize: '1rem',
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                        }}
                    >
                        {loading ? (
                            <Loader2 style={{ width: 20, height: 20 }} className="animate-spin" />
                        ) : (
                            <>
                                Save & Continue
                                <ArrowRight style={{ width: 18, height: 18 }} />
                            </>
                        )}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Your details are securely stored and only used for auction deliveries
                </p>
            </div>
        </div>
    );
}
