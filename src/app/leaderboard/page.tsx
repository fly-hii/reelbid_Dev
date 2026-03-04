'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Crown, Activity, Coins, Loader2, TrendingUp } from 'lucide-react';

interface LeaderboardData {
    winners: any[];
    activeBidders: any[];
    highestBids: any[];
}

export default function GlobalLeaderboard() {
    const [data, setData] = useState<LeaderboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/leaderboard')
            .then(res => res.json())
            .then((result) => {
                setData(result);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: '16px' }}>
                <Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading leaderboard...</p>
            </div>
        );
    }

    if (!data) return null;

    const panels = [
        {
            title: 'Top Collectors',
            subtitle: 'Most auction wins',
            icon: <Crown style={{ width: 22, height: 22 }} />,
            iconBg: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(234,179,8,0.05))',
            iconColor: '#eab308',
            borderColor: 'rgba(234,179,8,0.2)',
            data: data.winners || [],
            valueKey: 'wins',
            valueSuffix: ' wins',
            delay: '0s',
        },
        {
            title: 'Highest Pledges',
            subtitle: 'Biggest single bids',
            icon: <Coins style={{ width: 22, height: 22 }} />,
            iconBg: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
            iconColor: '#10b981',
            borderColor: 'rgba(16,185,129,0.2)',
            data: data.highestBids || [],
            valueKey: 'highestBid',
            valuePrefix: '₹',
            delay: '0.1s',
        },
        {
            title: 'Most Active Bidders',
            subtitle: 'Highest participation',
            icon: <Activity style={{ width: 22, height: 22 }} />,
            iconBg: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))',
            iconColor: '#3b82f6',
            borderColor: 'rgba(59,130,246,0.2)',
            data: data.activeBidders || [],
            valueKey: 'totalBids',
            valueSuffix: ' bids',
            delay: '0.2s',
        },
    ];

    const rankBg = [
        'linear-gradient(135deg, #fbbf24, #f59e0b)',
        'linear-gradient(135deg, #d1d5db, #9ca3af)',
        'linear-gradient(135deg, #d97706, #b45309)',
    ];
    const rankColors = ['#92400e', '#4b5563', '#fff'];
    const rankEmojis = ['🥇', '🥈', '🥉'];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0', paddingBottom: '80px' }}>
            {/* Header */}
            <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '48px' }}>
                <div style={{
                    width: '72px', height: '72px', borderRadius: 'var(--radius-lg)', margin: '0 auto 20px',
                    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 12px 32px rgba(245, 158, 11, 0.3)',
                }}>
                    <Trophy style={{ width: 36, height: 36, color: '#fff' }} />
                </div>
                <h1 style={{
                    fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900,
                    color: 'var(--text-primary)', letterSpacing: '-0.04em',
                    marginBottom: '10px',
                }}>
                    Global <span className="gradient-text">Leaderboard</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto' }}>
                    Top collectors and most active bidders on ReelBid
                </p>
            </div>

            {/* Panels Grid */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
            }}>
                {panels.map((panel, pi) => (
                    <div
                        key={pi}
                        className="card animate-slide-up"
                        style={{
                            padding: '28px',
                            display: 'flex', flexDirection: 'column', gap: '16px',
                            animationDelay: panel.delay,
                        }}
                    >
                        {/* Panel Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{
                                padding: '10px', borderRadius: '12px',
                                background: panel.iconBg,
                                color: panel.iconColor,
                                border: `1px solid ${panel.borderColor}`,
                            }}>
                                {panel.icon}
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                    {panel.title}
                                </h2>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    {panel.subtitle}
                                </p>
                            </div>
                        </div>

                        {/* Entries */}
                        {panel.data.length > 0 ? panel.data.map((u: any, i: number) => {
                            const isTop3 = i < 3;
                            const value = u[panel.valueKey];
                            const displayValue = `${panel.valuePrefix || ''}${typeof value === 'number' ? value.toLocaleString() : value
                                }${panel.valueSuffix || ''}`;

                            return (
                                <div key={u._id?._id || i} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: isTop3 ? '14px 16px' : '10px 16px',
                                    background: i === 0 ? `${panel.iconColor}08` : 'var(--bg-input)',
                                    borderRadius: '12px',
                                    border: `1px solid ${i === 0 ? `${panel.iconColor}20` : 'var(--border-primary)'}`,
                                    transition: 'all 0.25s',
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = `${panel.iconColor}40`;
                                        e.currentTarget.style.transform = 'translateX(4px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = i === 0 ? `${panel.iconColor}20` : 'var(--border-primary)';
                                        e.currentTarget.style.transform = 'translateX(0)';
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: isTop3 ? '34px' : '28px',
                                            height: isTop3 ? '34px' : '28px',
                                            borderRadius: isTop3 ? '10px' : '8px',
                                            background: isTop3 ? rankBg[i] : 'var(--bg-card-hover)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 900,
                                            fontSize: isTop3 ? '0.95rem' : '0.72rem',
                                            color: isTop3 ? rankColors[i] : 'var(--text-muted)',
                                            flexShrink: 0,
                                            boxShadow: isTop3 ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                                        }}>
                                            {isTop3 ? rankEmojis[i] : `#${i + 1}`}
                                        </div>
                                        <span style={{
                                            fontWeight: 600, color: 'var(--text-primary)',
                                            fontSize: isTop3 ? '0.92rem' : '0.85rem',
                                        }}>
                                            {u._id?.name || 'Anonymous'}
                                        </span>
                                    </div>
                                    <div style={{
                                        fontWeight: 800, color: panel.iconColor,
                                        fontSize: isTop3 ? '0.95rem' : '0.85rem',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {displayValue}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{
                                textAlign: 'center', color: 'var(--text-muted)',
                                padding: '32px 20px', background: 'var(--bg-input)',
                                borderRadius: '12px', border: '1px dashed var(--border-primary)',
                            }}>
                                <p style={{ fontSize: '0.88rem', fontWeight: 500 }}>No data yet.</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
