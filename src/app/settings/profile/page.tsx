'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Loader2, User, Phone, MapPin, Building, Map, Hash,
    Lock, Sparkles, Save, ShieldCheck
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

export default function ProfileSettings() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [form, setForm] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
    });

    const [passForm, setPassForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }
        if (status === 'loading') return;

        fetch(`/api/profile/complete?t=${Date.now()}`)
            .then(r => r.json())
            .then(data => {
                setForm({
                    name: data.name || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [status, router]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || 'Failed to update profile');
                setSavingProfile(false);
                return;
            }

            toast.success('Profile updated successfully!');
            await update(); // Update session if name changed
            setSavingProfile(false);
        } catch {
            toast.error('Something went wrong');
            setSavingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passForm.newPassword !== passForm.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (passForm.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }
        setSavingPassword(true);

        try {
            const res = await fetch('/api/profile/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passForm.currentPassword,
                    newPassword: passForm.newPassword,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || 'Failed to update password');
                setSavingPassword(false);
                return;
            }

            toast.success('Password changed successfully!');
            setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setSavingPassword(false);
        } catch {
            toast.error('Something went wrong changing password');
            setSavingPassword(false);
        }
    };

    if (loading || status === 'loading') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 24px 60px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                    style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, var(--accent), #ec4899)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        boxShadow: '0 4px 16px rgba(124, 58, 237, 0.25)',
                    }}
                >
                    <User style={{ width: 28, height: 28 }} />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                        My Profile Settings
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px', margin: 0 }}>
                        Manage your account details and security
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* ═══ PROFILE EDIT FORM ═══ */}
                <div
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '24px',
                        padding: '32px',
                        boxShadow: 'var(--shadow-floating)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                        <Sparkles style={{ width: 20, height: 20, color: 'var(--accent-text)' }} />
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Personal Details</h2>
                    </div>

                    <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Full Name & Phone & Email */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
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

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                    Email Address
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                        <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                    </div>
                                    <input
                                        type="email"
                                        value={session?.user?.email || ''}
                                        disabled
                                        className="input-field"
                                        style={{ paddingLeft: '42px', opacity: 0.6, cursor: 'not-allowed' }}
                                    />
                                </div>
                            </div>
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

                        {/* City, State, Pincode */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
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
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                            <button
                                type="submit"
                                disabled={savingProfile}
                                className="btn-primary"
                                style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {savingProfile ? <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" /> : <Save style={{ width: 18, height: 18 }} />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>

                {/* ═══ PASSWORD CHANGE FORM ═══ */}
                <div
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '24px',
                        padding: '32px',
                        boxShadow: 'var(--shadow-floating)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                        <ShieldCheck style={{ width: 20, height: 20, color: 'var(--danger)' }} />
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Change Password</h2>
                    </div>

                    <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                Current Password *
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                    <Lock style={{ width: 18, height: 18 }} />
                                </div>
                                <input
                                    type="password"
                                    value={passForm.currentPassword}
                                    onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                                    required
                                    className="input-field focus-ring"
                                    style={{ paddingLeft: '42px' }}
                                    placeholder="Enter current password"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                    New Password *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                        <Lock style={{ width: 18, height: 18 }} />
                                    </div>
                                    <input
                                        type="password"
                                        value={passForm.newPassword}
                                        onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                                        required
                                        className="input-field focus-ring"
                                        style={{ paddingLeft: '42px' }}
                                        placeholder="New password (min 6 chars)"
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                    Confirm New Password *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                        <Lock style={{ width: 18, height: 18 }} />
                                    </div>
                                    <input
                                        type="password"
                                        value={passForm.confirmPassword}
                                        onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                                        required
                                        className="input-field focus-ring"
                                        style={{ paddingLeft: '42px' }}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                            <button
                                type="submit"
                                disabled={savingPassword}
                                className="btn-secondary focus-ring"
                                style={{
                                    padding: '12px 24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: 'var(--danger)',
                                    borderColor: 'transparent',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                }}
                            >
                                {savingPassword ? <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" /> : <Save style={{ width: 18, height: 18 }} />}
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
