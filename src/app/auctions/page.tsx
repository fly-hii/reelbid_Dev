'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Clock, Loader2, Coins, Search, SlidersHorizontal } from 'lucide-react';

interface Item {
    _id: string;
    title: string;
    description: string;
    startingPrice: number;
    currentPrice: number;
    status: string;
    endDate: string;
}

export default function Auctions() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/items')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setItems(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filtered = items.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        Active Auctions
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.95rem' }}>
                        {filtered.length} {filtered.length === 1 ? 'item' : 'items'} available for bidding
                    </p>
                </div>

                {/* Search */}
                <div className="auction-search-bar" style={{ position: 'relative', minWidth: '260px' }}>
                    <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                        <Search style={{ width: 18, height: 18 }} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search auctions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field focus-ring"
                        style={{ paddingLeft: '42px', fontSize: '0.9rem' }}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {filtered.map((item) => {
                    const isLive = new Date(item.endDate) > new Date();

                    return (
                        <Link
                            key={item._id}
                            href={`/auctions/${item._id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div
                                className="card"
                                style={{
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'transform 0.25s, box-shadow 0.25s, border-color 0.25s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                {/* Image area */}
                                <div style={{ height: '180px', position: 'relative', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--gradient-hero-1), var(--gradient-hero-2))' }} />

                                    {/* Status badge */}
                                    <div
                                        className={isLive ? 'badge-success' : 'badge-danger'}
                                        style={{ position: 'absolute', bottom: '12px', left: '12px' }}
                                    >
                                        <Clock style={{ width: 12, height: 12 }} />
                                        {isLive ? 'Live' : 'Ended'}
                                    </div>
                                </div>

                                {/* Content */}
                                <div style={{ padding: '20px' }}>
                                    <h3 style={{
                                        fontSize: '1.05rem',
                                        fontWeight: 700,
                                        color: 'var(--text-primary)',
                                        marginBottom: '16px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {item.title}
                                    </h3>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Current Bid
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Coins style={{ width: 18, height: 18, color: 'var(--accent-text)' }} />
                                                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                                    ₹{item.currentPrice.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '12px',
                                                background: 'var(--accent-soft)',
                                                color: 'var(--accent-text)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'background 0.2s',
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
                    style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: 'var(--bg-card)',
                        border: '2px dashed var(--border-primary)',
                        borderRadius: '20px',
                    }}
                >
                    <SlidersHorizontal style={{ width: 40, height: 40, color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                    <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {search ? 'No auctions match your search.' : 'No active auctions right now.'}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        Check back later or adjust your search filters.
                    </p>
                </div>
            )}
        </div>
    );
}
