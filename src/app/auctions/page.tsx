'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Clock, Loader2, Coins, Search, SlidersHorizontal, Lock, Gavel, Filter, Eye, Flame } from 'lucide-react';

interface Item {
    _id: string;
    title: string;
    description: string;
    startingPrice: number;
    currentPrice: number;
    status: string;
    endDate: string;
    securityPercentage?: number;
    category?: string;
    bidCount?: number;
    images?: string[];
}

export default function Auctions() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'live' | 'ended' | 'trending'>('all');
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => {
        fetch('/api/items')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setItems(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const categories = [...new Set(items.map(i => i.category || 'General'))];

    let filtered = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
            (item.description || '').toLowerCase().includes(search.toLowerCase());
        const isLive = new Date(item.endDate) > new Date() && item.status === 'Active';
        const matchesFilter = filter === 'all' || (filter === 'live' && isLive) || (filter === 'ended' && !isLive) || (filter === 'trending' && isLive && (item.bidCount || 0) > 0);
        const matchesCategory = !categoryFilter || (item.category || 'General') === categoryFilter;
        return matchesSearch && matchesFilter && matchesCategory;
    });

    if (filter === 'trending') {
        filtered.sort((a, b) => (b.bidCount || 0) - (a.bidCount || 0));
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Loading auctions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Header */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
                alignItems: 'start', gap: '16px',
            }}>
                <div>
                    <h1 style={{
                        fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900,
                        color: 'var(--text-primary)', letterSpacing: '-0.03em',
                        lineHeight: 1.2,
                    }}>
                        Active <span className="gradient-text">Auctions</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.92rem' }}>
                        {filtered.length} {filtered.length === 1 ? 'item' : 'items'} available for bidding
                    </p>
                </div>

                {/* Search */}
                <div className="auction-search-bar" style={{ position: 'relative', minWidth: '280px' }}>
                    <div style={{
                        position: 'absolute', left: '14px', top: '50%',
                        transform: 'translateY(-50%)', color: 'var(--text-muted)',
                    }}>
                        <Search style={{ width: 18, height: 18 }} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search auctions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field focus-ring"
                        style={{ paddingLeft: '44px', fontSize: '0.9rem' }}
                    />
                </div>
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center',
                padding: '12px 16px', background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)',
            }}>
                <Filter size={15} style={{ color: 'var(--text-muted)' }} />
                {(['all', 'live', 'trending', 'ended'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '7px 18px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                        fontWeight: 700, fontSize: '0.8rem',
                        background: filter === f ? 'var(--gradient-primary)' : 'transparent',
                        color: filter === f ? '#fff' : 'var(--text-muted)',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: filter === f ? '0 2px 12px rgba(139,92,246,0.25)' : 'none',
                    }}
                        onMouseEnter={(e) => {
                            if (filter !== f) e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                            if (filter !== f) e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                    >
                        {f === 'all' ? 'All' : f === 'live' ? '● Live' : f === 'trending' ? '🔥 Trending' : '⏱ Ended'}
                    </button>
                ))}

                {categories.length > 1 && (
                    <>
                        <div style={{
                            width: '1px', height: '20px',
                            background: 'var(--border-primary)', margin: '0 6px',
                        }} />
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                            style={{
                                padding: '7px 14px', borderRadius: '999px', fontSize: '0.8rem',
                                background: 'var(--bg-input)', color: 'var(--text-primary)',
                                border: '1px solid var(--border-primary)', cursor: 'pointer',
                                fontWeight: 600,
                            }}>
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </>
                )}
            </div>

            {/* Grid */}
            <div className="stagger-children" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
            }}>
                {filtered.map((item) => {
                    const isLive = new Date(item.endDate) > new Date() && item.status === 'Active';
                    const timeLeft = new Date(item.endDate).getTime() - Date.now();
                    const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
                    const minsLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));
                    const isEndingSoon = isLive && timeLeft < 86400000;

                    return (
                        <Link
                            key={item._id}
                            href={`/auctions/${item._id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div
                                className="card card-glow"
                                style={{
                                    cursor: 'pointer',
                                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                {/* Image area */}
                                <div style={{
                                    height: '200px', position: 'relative', overflow: 'hidden',
                                    background: 'var(--bg-secondary)',
                                }}>
                                    {item.images?.[0] ? (
                                        <img src={item.images[0]} alt={item.title}
                                            style={{
                                                width: '100%', height: '100%', objectFit: 'contain',
                                                background: '#000', transition: 'transform 0.5s',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                        />
                                    ) : (
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            background: 'linear-gradient(135deg, var(--gradient-hero-1), var(--gradient-hero-2))',
                                        }} />
                                    )}

                                    {/* Gradient overlay at bottom */}
                                    <div style={{
                                        position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px',
                                        background: 'linear-gradient(transparent, var(--bg-card))',
                                        pointerEvents: 'none',
                                    }} />

                                    {/* Status badge */}
                                    <div
                                        className={isLive ? 'badge-success' : 'badge-danger'}
                                        style={{
                                            position: 'absolute', bottom: '14px', left: '14px',
                                            backdropFilter: 'blur(8px)',
                                            fontSize: '0.72rem',
                                        }}
                                    >
                                        {isLive ? (
                                            <>
                                                <div style={{
                                                    width: '6px', height: '6px', borderRadius: '50%',
                                                    background: 'var(--success)',
                                                    animation: 'pulse-glow 2s infinite',
                                                }} />
                                                {hoursLeft}h {minsLeft}m
                                            </>
                                        ) : (
                                            <>
                                                <Clock style={{ width: 11, height: 11 }} />
                                                Ended
                                            </>
                                        )}
                                    </div>

                                    {/* Ending soon fire badge */}
                                    {isEndingSoon && (
                                        <div style={{
                                            position: 'absolute', top: '14px', left: '14px',
                                            padding: '4px 10px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 700,
                                            background: 'var(--danger-soft)', color: 'var(--danger)',
                                            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '4px',
                                            border: '1px solid rgba(239,68,68,0.15)',
                                        }}>
                                            <Flame style={{ width: 10, height: 10 }} />
                                            Hot
                                        </div>
                                    )}

                                    {/* Security Deposit Badge */}
                                    <div style={{
                                        position: 'absolute', top: '14px', right: '14px',
                                        padding: '4px 10px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 700,
                                        background: 'var(--warning-soft)', color: 'var(--warning)',
                                        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '4px',
                                        border: '1px solid rgba(245,158,11,0.15)',
                                    }}>
                                        <Lock style={{ width: 10, height: 10 }} />
                                        {item.securityPercentage || 5}% Deposit
                                    </div>

                                    {/* Category badge */}
                                    {item.category && item.category !== 'General' && (
                                        <div style={{
                                            position: 'absolute', bottom: '14px', right: '14px',
                                            padding: '4px 10px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 700,
                                            background: 'var(--accent-soft)', color: 'var(--accent-text)',
                                            backdropFilter: 'blur(4px)',
                                            border: '1px solid rgba(139,92,246,0.15)',
                                        }}>
                                            {item.category}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div style={{ padding: '20px 22px' }}>
                                    <h3 style={{
                                        fontSize: '1.05rem',
                                        fontWeight: 700,
                                        color: 'var(--text-primary)',
                                        marginBottom: '10px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        lineHeight: 1.3,
                                    }}>
                                        {item.title}
                                    </h3>

                                    {/* Bid count */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px',
                                    }}>
                                        <Gavel size={13} />
                                        {item.bidCount || 0} bids
                                    </div>

                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'end',
                                    }}>
                                        <div>
                                            <div style={{
                                                fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
                                                marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em',
                                            }}>
                                                Current Bid
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Coins style={{ width: 18, height: 18, color: 'var(--accent-text)' }} />
                                                <span style={{
                                                    fontSize: '1.4rem', fontWeight: 900,
                                                    color: 'var(--text-primary)',
                                                    letterSpacing: '-0.03em',
                                                }}>
                                                    ₹{item.currentPrice.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                width: '42px',
                                                height: '42px',
                                                borderRadius: '12px',
                                                background: 'var(--accent-soft)',
                                                color: 'var(--accent-text)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.3s',
                                                border: '1px solid rgba(139,92,246,0.1)',
                                            }}
                                        >
                                            <ArrowUpRight style={{ width: 18, height: 18 }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div
                    className="card"
                    style={{
                        textAlign: 'center',
                        padding: '60px 24px',
                        border: '2px dashed var(--border-primary)',
                    }}
                >
                    <div style={{
                        width: '64px', height: '64px', borderRadius: 'var(--radius-md)',
                        background: 'var(--accent-soft)', color: 'var(--accent-text)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                    }}>
                        <SlidersHorizontal style={{ width: 32, height: 32 }} />
                    </div>
                    <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                        {search ? 'No auctions match your search.' : 'No active auctions right now.'}
                    </p>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        Check back later or adjust your search filters.
                    </p>
                </div>
            )}
        </div>
    );
}
