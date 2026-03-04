'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Wallet, LogOut, Loader2, Sun, Moon, Menu, X, Gavel, Trophy, LayoutGrid, User, ChevronRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
    const { data: session, status } = useSession();
    const { theme, toggleTheme } = useTheme();
    const [wallet, setWallet] = useState({ balance: 0 });
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const navLinks = [
        { href: '/auctions', label: 'Auctions', icon: <Gavel style={{ width: 16, height: 16 }} /> },
        { href: '/leaderboard', label: 'Leaderboard', icon: <Trophy style={{ width: 16, height: 16 }} /> },
        { href: '/working-process', label: 'How It Works', icon: <LayoutGrid style={{ width: 16, height: 16 }} /> },
    ];

    const role = (session?.user as any)?.role || 'Buyer';
    const roleCfg: Record<string, { bg: string; color: string; border: string }> = {
        Admin: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.2)' },
        Seller: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
        Buyer: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'rgba(59,130,246,0.2)' },
    };
    const rc = roleCfg[role] || roleCfg.Buyer;

    return (
        <>
            <nav
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    background: scrolled ? 'var(--bg-navbar)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
                    WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
                    borderBottom: scrolled ? '1px solid var(--border-primary)' : '1px solid transparent',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.1)' : 'none',
                }}
            >
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '68px' }}>
                        {/* Logo */}
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                            <div
                                style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '12px',
                                    background: 'var(--gradient-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontWeight: 900,
                                    fontSize: '18px',
                                    boxShadow: '0 4px 16px rgba(139, 92, 246, 0.35)',
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                R
                            </div>
                            <span style={{
                                fontWeight: 900,
                                fontSize: '20px',
                                color: 'var(--text-primary)',
                                letterSpacing: '-0.03em',
                            }}>
                                Reel<span className="gradient-text">Bid</span>
                            </span>
                        </Link>

                        {/* Desktop nav */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="desktop-nav">
                            {navLinks.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="nav-link"
                                    style={{
                                        color: 'var(--text-secondary)',
                                        textDecoration: 'none',
                                        fontSize: '0.88rem',
                                        fontWeight: 600,
                                        padding: '8px 16px',
                                        borderRadius: 'var(--radius-sm)',
                                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
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
                                    {link.label}
                                </Link>
                            ))}

                            {/* Separator */}
                            <div style={{ width: '1px', height: '24px', background: 'var(--border-primary)', margin: '0 4px' }} />

                            {status === 'loading' ? (
                                <Loader2 style={{ width: 20, height: 20, color: 'var(--text-muted)' }} className="animate-spin" />
                            ) : session && session.user ? (
                                <>
                                    {/* Role badge */}
                                    <span style={{
                                        fontSize: '0.7rem', fontWeight: 800, padding: '4px 12px',
                                        borderRadius: '999px', background: rc.bg, color: rc.color,
                                        textTransform: 'uppercase', letterSpacing: '0.05em',
                                        border: `1px solid ${rc.border}`,
                                    }}>
                                        {role}
                                    </span>

                                    {/* Wallet badge */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: 'var(--success-soft)',
                                            padding: '6px 14px',
                                            borderRadius: '999px',
                                            border: '1px solid rgba(16, 185, 129, 0.15)',
                                        }}
                                    >
                                        <Wallet style={{ width: 14, height: 14, color: 'var(--success)' }} />
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)' }}>
                                            ₹{wallet.balance.toLocaleString()}
                                        </span>
                                    </div>

                                    <Link
                                        href="/dashboard"
                                        className="nav-link"
                                        style={{
                                            color: 'var(--text-secondary)',
                                            textDecoration: 'none',
                                            fontSize: '0.88rem',
                                            fontWeight: 600,
                                            padding: '8px 16px',
                                            borderRadius: 'var(--radius-sm)',
                                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
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
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--border-primary)',
                                            background: 'var(--bg-card)',
                                            color: 'var(--text-secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            textDecoration: 'none',
                                            transition: 'all 0.25s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--accent)';
                                            e.currentTarget.style.color = 'var(--accent-text)';
                                            e.currentTarget.style.background = 'var(--accent-soft)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--border-primary)';
                                            e.currentTarget.style.color = 'var(--text-secondary)';
                                            e.currentTarget.style.background = 'var(--bg-card)';
                                        }}
                                    >
                                        <User style={{ width: 16, height: 16 }} />
                                    </Link>

                                    <button
                                        onClick={() => signOut()}
                                        title="Sign Out"
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--border-primary)',
                                            background: 'var(--bg-card)',
                                            color: 'var(--text-muted)',
                                            cursor: 'pointer',
                                            transition: 'all 0.25s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = 'var(--danger)';
                                            e.currentTarget.style.background = 'var(--danger-soft)';
                                            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = 'var(--text-muted)';
                                            e.currentTarget.style.background = 'var(--bg-card)';
                                            e.currentTarget.style.borderColor = 'var(--border-primary)';
                                        }}
                                    >
                                        <LogOut style={{ width: 16, height: 16 }} />
                                    </button>
                                </>
                            ) : (
                                <Link href="/auth/signin" className="btn-primary" style={{ padding: '9px 22px', fontSize: '0.85rem', textDecoration: 'none' }}>
                                    Sign In
                                </Link>
                            )}

                            {/* Theme toggle */}
                            <button
                                onClick={toggleTheme}
                                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-primary)',
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.25s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--accent)';
                                    e.currentTarget.style.color = 'var(--accent-text)';
                                    e.currentTarget.style.background = 'var(--accent-soft)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                    e.currentTarget.style.background = 'var(--bg-card)';
                                }}
                            >
                                {theme === 'dark'
                                    ? <Sun style={{ width: 16, height: 16 }} />
                                    : <Moon style={{ width: 16, height: 16 }} />}
                            </button>
                        </div>

                        {/* Mobile hamburger */}
                        <div style={{ display: 'none' }} className="mobile-nav-toggle">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                    onClick={toggleTheme}
                                    style={{
                                        width: '38px',
                                        height: '38px',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--border-primary)',
                                        background: 'var(--bg-card)',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {theme === 'dark' ? <Sun style={{ width: 17, height: 17 }} /> : <Moon style={{ width: 17, height: 17 }} />}
                                </button>
                                <button
                                    onClick={() => setMobileOpen(!mobileOpen)}
                                    style={{
                                        width: '38px',
                                        height: '38px',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--border-primary)',
                                        background: mobileOpen ? 'var(--accent-soft)' : 'var(--bg-card)',
                                        color: mobileOpen ? 'var(--accent-text)' : 'var(--text-primary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.25s',
                                    }}
                                >
                                    {mobileOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile menu overlay */}
                {mobileOpen && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            top: '68px',
                            background: 'var(--bg-overlay)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 40,
                        }}
                        onClick={() => setMobileOpen(false)}
                    />
                )}

                {/* Mobile menu dropdown */}
                <div
                    style={{
                        position: 'absolute',
                        top: '68px',
                        left: 0,
                        right: 0,
                        background: 'var(--bg-card)',
                        borderBottom: '1px solid var(--border-primary)',
                        padding: mobileOpen ? '20px 24px' : '0 24px',
                        maxHeight: mobileOpen ? '80vh' : '0',
                        overflow: 'hidden',
                        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: mobileOpen ? 1 : 0,
                        zIndex: 45,
                        boxShadow: mobileOpen ? '0 20px 40px rgba(0,0,0,0.2)' : 'none',
                    }}
                    className="mobile-menu"
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                style={{
                                    color: 'var(--text-primary)',
                                    textDecoration: 'none',
                                    padding: '14px 16px',
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    borderRadius: 'var(--radius-sm)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                            >
                                <span style={{ color: 'var(--accent-text)' }}>{link.icon}</span>
                                {link.label}
                                <ChevronRight style={{ width: 14, height: 14, color: 'var(--text-muted)', marginLeft: 'auto' }} />
                            </Link>
                        ))}

                        <div style={{ height: '1px', background: 'var(--border-primary)', margin: '8px 0' }} />

                        {session?.user ? (
                            <>
                                {/* Mobile role badge */}
                                <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{
                                        fontSize: '0.7rem', fontWeight: 800, padding: '4px 12px',
                                        borderRadius: '999px', background: rc.bg, color: rc.color,
                                        textTransform: 'uppercase', letterSpacing: '0.05em',
                                        border: `1px solid ${rc.border}`,
                                    }}>
                                        {role}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Wallet style={{ width: 14, height: 14, color: 'var(--success)' }} />
                                        <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.88rem' }}>₹{wallet.balance.toLocaleString()}</span>
                                    </div>
                                </div>

                                <Link
                                    href="/dashboard"
                                    onClick={() => setMobileOpen(false)}
                                    style={{
                                        color: 'var(--text-primary)',
                                        textDecoration: 'none',
                                        padding: '14px 16px',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        borderRadius: 'var(--radius-sm)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <LayoutGrid style={{ width: 16, height: 16, color: 'var(--accent-text)' }} />
                                    Dashboard
                                    <ChevronRight style={{ width: 14, height: 14, color: 'var(--text-muted)', marginLeft: 'auto' }} />
                                </Link>

                                <Link
                                    href="/settings/profile"
                                    onClick={() => setMobileOpen(false)}
                                    style={{
                                        color: 'var(--text-primary)',
                                        textDecoration: 'none',
                                        padding: '14px 16px',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        borderRadius: 'var(--radius-sm)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <User style={{ width: 16, height: 16, color: 'var(--accent-text)' }} />
                                    Profile
                                    <ChevronRight style={{ width: 14, height: 14, color: 'var(--text-muted)', marginLeft: 'auto' }} />
                                </Link>

                                <div style={{ height: '1px', background: 'var(--border-primary)', margin: '4px 0' }} />

                                <button
                                    onClick={() => { signOut(); setMobileOpen(false); }}
                                    style={{
                                        color: 'var(--danger)',
                                        background: 'none',
                                        border: 'none',
                                        textAlign: 'left',
                                        padding: '14px 16px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontSize: '0.95rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        borderRadius: 'var(--radius-sm)',
                                        width: '100%',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--danger-soft)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <LogOut style={{ width: 16, height: 16 }} />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/auth/signin"
                                onClick={() => setMobileOpen(false)}
                                className="btn-primary"
                                style={{
                                    textAlign: 'center',
                                    marginTop: '8px',
                                    textDecoration: 'none',
                                    padding: '14px',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            <style>{`
                @media (max-width: 768px) {
                    .desktop-nav { display: none !important; }
                    .mobile-nav-toggle { display: flex !important; }
                }
            `}</style>
        </>
    );
}
