'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Clock, Loader2, Coins, Search, SlidersHorizontal, Trophy, Award } from 'lucide-react';

interface User {
    _id: string;
    name: string;
    image: string;
}

interface Item {
    _id: string;
    title: string;
    description: string;
    startingPrice: number;
    currentPrice: number;
    status: string;
    endDate: string;
    category?: string;
    bidCount?: number;
    images?: string[];
    winner?: User;
    highestBidder?: User;
}

export default function ClosedAuctions() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/items?status=Completed')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setItems(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    let filtered = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
            (item.description || '').toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Loading closed auctions...</p>
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
                        Closed <span className="gradient-text">Auctions</span> Portfolio
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.92rem' }}>
                        Discover past auctions and their respective winners.
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
                        placeholder="Search closed auctions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field focus-ring"
                        style={{ paddingLeft: '44px', fontSize: '0.9rem' }}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="stagger-children" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
            }}>
                {filtered.map((item) => {
                    const theWinner = item.winner || item.highestBidder;
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
                                        className="badge-danger"
                                        style={{
                                            position: 'absolute', bottom: '14px', left: '14px',
                                            backdropFilter: 'blur(8px)',
                                            fontSize: '0.72rem',
                                        }}
                                    >
                                        <Clock style={{ width: 11, height: 11 }} />
                                        Closed
                                    </div>

                                    {/* Winner overlay badge directly on image if present */}
                                    {theWinner && (
                                        <div style={{
                                            position: 'absolute', top: '14px', right: '14px',
                                            padding: '4px 10px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 700,
                                            background: 'var(--success-soft)', color: 'var(--success)',
                                            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '4px',
                                            border: '1px solid rgba(16, 185, 129, 0.15)',
                                        }}>
                                            <Award style={{ width: 12, height: 12 }} />
                                            Sold
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

                                    {/* Winner section */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '10px', background: 'var(--bg-secondary)',
                                        borderRadius: '8px', marginBottom: '14px',
                                        border: '1px solid var(--border-primary)'
                                    }}>
                                        <Trophy style={{ width: 16, height: 16, color: 'var(--warning)' }} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                            {theWinner ? (
                                                <>
                                                    <img
                                                        src={theWinner.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${theWinner._id}`}
                                                        alt="Winner"
                                                        style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                                                    />
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                        {theWinner.name} won this!
                                                    </span>
                                                </>
                                            ) : (
                                                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                                                    Closed without a winner
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'end',
                                    }}>
                                        <div>
                                            <div style={{
                                                fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
                                                marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em',
                                            }}>
                                                Winning Bid
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
                        {search ? 'No closed auctions match your search.' : 'No closed auctions right now.'}
                    </p>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        Check back later once active auctions are completed.
                    </p>
                </div>
            )}
        </div>
    );
}
