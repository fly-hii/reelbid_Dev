'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { containsProfanity } from '@/lib/profanityFilter';
import toast from 'react-hot-toast';
import { AlertTriangle, User, Loader2, ShieldAlert } from 'lucide-react';

/**
 * ProfanityGuard — Global component that checks if the logged-in user's 
 * name contains profanity. If so, it shows a mandatory "Change Username" 
 * lightbox that blocks usage until the name is updated.
 */
export default function ProfanityGuard() {
    const { data: session, update: updateSession } = useSession();
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [saving, setSaving] = useState(false);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (!session?.user?.name || checked) return;

        const userName = session.user.name;
        const badWord = containsProfanity(userName);
        if (badWord) {
            setShowModal(true);
            setNewName('');
        }
        setChecked(true);
    }, [session?.user?.name, checked]);

    const handleUpdateName = async () => {
        if (!newName.trim()) {
            toast.error('Please enter a new name');
            return;
        }
        if (newName.trim().length < 2) {
            toast.error('Name must be at least 2 characters');
            return;
        }
        const badWord = containsProfanity(newName);
        if (badWord) {
            toast.error('The new name still contains inappropriate language. Please choose a different name.');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/profile/update-name', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success('Name updated successfully!');
            setShowModal(false);
            // Update the session to reflect the new name
            await updateSession();
            // Force reload to refresh everything
            window.location.reload();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update name');
        }
        setSaving(false);
    };

    if (!showModal) return null;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 10000,
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px',
            }}
        >
            <div
                className="animate-slide-up"
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '24px',
                    padding: '36px',
                    maxWidth: '460px',
                    width: '100%',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
                }}
            >
                {/* Warning Icon */}
                <div style={{
                    width: '60px', height: '60px', borderRadius: '16px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                }}>
                    <ShieldAlert size={30} style={{ color: 'var(--danger)' }} />
                </div>

                <h2 style={{
                    fontSize: '1.3rem', fontWeight: 800, textAlign: 'center',
                    color: 'var(--text-primary)', marginBottom: '8px',
                }}>
                    Username Not Allowed
                </h2>

                <p style={{
                    fontSize: '0.88rem', color: 'var(--text-muted)', textAlign: 'center',
                    lineHeight: 1.6, marginBottom: '24px',
                }}>
                    Your current username contains inappropriate language.
                    Please choose a new name to continue using ReelBid.
                </p>

                {/* Current name shown */}
                <div style={{
                    padding: '10px 14px', borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
                    marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                    <AlertTriangle size={14} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                    <div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--danger)', fontWeight: 600 }}>Current Name</p>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {session?.user?.name}
                        </p>
                    </div>
                </div>

                {/* New name input */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)',
                        marginBottom: '8px',
                    }}>
                        <User size={14} /> New Username
                    </label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Enter your new name..."
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateName(); }}
                        style={{
                            width: '100%', padding: '14px 16px', fontSize: '0.95rem',
                            borderRadius: '12px',
                        }}
                        autoFocus
                    />
                </div>

                <button
                    onClick={handleUpdateName}
                    disabled={saving || !newName.trim()}
                    className="btn-primary"
                    style={{
                        width: '100%', padding: '14px', fontSize: '0.95rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        borderRadius: '12px',
                        opacity: saving || !newName.trim() ? 0.6 : 1,
                    }}
                >
                    {saving ? (
                        <><Loader2 size={18} className="animate-spin" /> Updating...</>
                    ) : (
                        <>✓ Update Name & Continue</>
                    )}
                </button>

                <p style={{
                    textAlign: 'center', marginTop: '14px',
                    fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5,
                }}>
                    ReelBid has a strict policy against inappropriate usernames.
                    This is required before you can proceed.
                </p>
            </div>
        </div>
    );
}
