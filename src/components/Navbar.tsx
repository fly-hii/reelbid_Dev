'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Wallet, LogOut, Loader2, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
    const { data: session, status } = useSession();
    const { theme, toggleTheme } = useTheme();
    const [wallet, setWallet] = useState({ balance: 0 });
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (session?.user) {
            fetch('/api/wallet')
                .then(res => res.json())
                .then(data => {
                    if (!data.error) setWallet({ balance: data.balance });
                })
                .catch(console.error);
        }
    }, [session]);

    return (
        <nav
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                background: 'var(--bg-navbar)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border-primary)',
                transition: 'background 0.3s, border-color 0.3s',
            }}
        >
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
                    {/* Logo */}
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                        <div
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, var(--accent), #ec4899)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: '18px',
                                boxShadow: '0 2px 12px rgba(124, 58, 237, 0.3)',
                            }}
                        >
                            R
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '20px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                            ReelBid
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="desktop-nav">
                        <Link
                            href="/auctions"
                            style={{
                                color: 'var(--text-secondary)',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                padding: '8px 16px',
                                borderRadius: '10px',
                                transition: 'color 0.2s, background 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--text-primary)';
                                e.currentTarget.style.background = 'var(--bg-card-hover)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--text-secondary)';
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            Auctions
                        </Link>

                        <Link
                            href="/working-process"
                            style={{
                                color: 'var(--text-secondary)',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                padding: '8px 16px',
                                borderRadius: '10px',
                                transition: 'color 0.2s, background 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--text-primary)';
                                e.currentTarget.style.background = 'var(--bg-card-hover)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--text-secondary)';
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            Process
                        </Link>

                        {status === 'loading' ? (
                            <Loader2 style={{ width: 20, height: 20, color: 'var(--text-muted)' }} className="animate-spin" />
                        ) : session && session.user ? (
                            <>
                                {/* Role badge */}
                                {(() => {
                                    const role = (session.user as any)?.role || 'Buyer';
                                    const roleCfg: Record<string, { bg: string; color: string }> = {
                                        Admin: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
                                        Seller: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
                                        Buyer: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
                                    };
                                    const rc = roleCfg[role] || roleCfg.Buyer;
                                    return (
                                        <span style={{
                                            fontSize: '0.72rem', fontWeight: 800, padding: '4px 12px',
                                            borderRadius: '999px', background: rc.bg, color: rc.color,
                                            textTransform: 'uppercase', letterSpacing: '0.04em',
                                        }}>
                                            {role}
                                        </span>
                                    );
                                })()}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: 'var(--success-soft)',
                                        padding: '6px 14px',
                                        borderRadius: '999px',
                                        border: '1px solid transparent',
                                    }}
                                >
                                    <Wallet style={{ width: 16, height: 16, color: 'var(--success)' }} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)' }}>
                                        ₹{wallet.balance.toLocaleString()}
                                    </span>
                                </div>
                                <Link
                                    href="/dashboard"
                                    style={{
                                        color: 'var(--text-secondary)',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        padding: '8px 16px',
                                        borderRadius: '10px',
                                        transition: 'color 0.2s, background 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = 'var(--text-primary)';
                                        e.currentTarget.style.background = 'var(--bg-card-hover)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/settings/profile"
                                    style={{
                                        color: 'var(--text-secondary)',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        padding: '8px 16px',
                                        borderRadius: '10px',
                                        transition: 'color 0.2s, background 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = 'var(--text-primary)';
                                        e.currentTarget.style.background = 'var(--bg-card-hover)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    title="Sign Out"
                                    style={{
                                        padding: '8px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: 'transparent',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        transition: 'color 0.2s, background 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = 'var(--danger)';
                                        e.currentTarget.style.background = 'var(--danger-soft)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'var(--text-muted)';
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <LogOut style={{ width: 18, height: 18 }} />
                                </button>
                            </>
                        ) : (
                            <Link href="/auth/signin" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem', borderRadius: '10px' }}>
                                Sign In
                            </Link>
                        )}

                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                            style={{
                                padding: '8px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-primary)',
                                background: 'var(--bg-card)',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--accent)';
                                e.currentTarget.style.color = 'var(--accent-text)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-primary)';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                        >
                            {theme === 'dark'
                                ? <Sun style={{ width: 18, height: 18 }} />
                                : <Moon style={{ width: 18, height: 18 }} />}
                        </button>
                    </div>

                    {/* Mobile hamburger */}
                    <div style={{ display: 'none' }} className="mobile-nav-toggle">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                onClick={toggleTheme}
                                style={{
                                    padding: '8px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-primary)',
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                }}
                            >
                                {theme === 'dark' ? <Sun style={{ width: 18, height: 18 }} /> : <Moon style={{ width: 18, height: 18 }} />}
                            </button>
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                style={{
                                    padding: '8px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-primary)',
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                }}
                            >
                                {mobileOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu dropdown */}
            {mobileOpen && (
                <div
                    style={{
                        background: 'var(--bg-card)',
                        borderTop: '1px solid var(--border-primary)',
                        padding: '16px 24px',
                    }}
                    className="mobile-menu"
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Link href="/auctions" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '10px 0', fontWeight: 600 }}>
                            Auctions
                        </Link>
                        <Link href="/working-process" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '10px 0', fontWeight: 600 }}>
                            Process
                        </Link>
                        {session?.user ? (
                            <>
                                {/* Mobile role badge */}
                                {(() => {
                                    const role = (session.user as any)?.role || 'Buyer';
                                    const roleCfg: Record<string, { bg: string; color: string }> = {
                                        Admin: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
                                        Seller: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
                                        Buyer: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
                                    };
                                    const rc = roleCfg[role] || roleCfg.Buyer;
                                    return (
                                        <span style={{
                                            fontSize: '0.72rem', fontWeight: 800, padding: '4px 12px',
                                            borderRadius: '999px', background: rc.bg, color: rc.color,
                                            textTransform: 'uppercase', letterSpacing: '0.04em', alignSelf: 'start',
                                        }}>
                                            {role}
                                        </span>
                                    );
                                })()}
                                <Link href="/dashboard" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '10px 0', fontWeight: 600 }}>
                                    Dashboard
                                </Link>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0' }}>
                                    <Wallet style={{ width: 16, height: 16, color: 'var(--success)' }} />
                                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>₹{wallet.balance.toLocaleString()}</span>
                                </div>
                                <button onClick={() => { signOut(); setMobileOpen(false); }} style={{ color: 'var(--danger)', background: 'none', border: 'none', textAlign: 'left', padding: '10px 0', fontWeight: 600, cursor: 'pointer' }}>
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link href="/auth/signin" onClick={() => setMobileOpen(false)} className="btn-primary" style={{ textAlign: 'center', marginTop: '8px', textDecoration: 'none' }}>
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            )}

            <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-toggle { display: flex !important; }
        }
      `}</style>
        </nav>
    );
}
