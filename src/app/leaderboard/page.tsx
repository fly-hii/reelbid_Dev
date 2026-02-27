'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Crown, Activity, Coins, Loader2 } from 'lucide-react';

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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0', paddingBottom: '80px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{
                    width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 16px',
                    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)'
                }}>
                    <Trophy style={{ width: 32, height: 32, color: '#fff' }} />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                    Global Leaderboard
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '8px' }}>
                    Top collectors and most active bidders on ReelBid
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

                {/* Panel 1: Top Auction Winners */}
                <div className="card animate-slide-up" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', animationDelay: '0s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.12)' }}>
                            <Crown style={{ color: '#eab308', width: 22, height: 22 }} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Top Collectors</h2>
                    </div>
                    {data.winners?.length > 0 ? data.winners.map((u, i) => (
                        <div key={u._id?._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontWeight: 800, color: i < 3 ? '#eab308' : 'var(--text-muted)', width: '20px' }}>#{i + 1}</span>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u._id?.name || 'Anonymous'}</span>
                            </div>
                            <div style={{ fontWeight: 800, color: '#eab308' }}>{u.wins} wins</div>
                        </div>
                    )) : (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No completed auctions yet.</p>
                    )}
                </div>

                {/* Panel 2: Highest Bid Amount */}
                <div className="card animate-slide-up" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', animationDelay: '0.1s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.12)' }}>
                            <Coins style={{ color: '#22c55e', width: 22, height: 22 }} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Highest Pledges</h2>
                    </div>
                    {data.highestBids?.length > 0 ? data.highestBids.map((u, i) => (
                        <div key={u._id?._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontWeight: 800, color: i < 3 ? '#22c55e' : 'var(--text-muted)', width: '20px' }}>#{i + 1}</span>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u._id?.name || 'Anonymous'}</span>
                            </div>
                            <div style={{ fontWeight: 800, color: '#22c55e' }}>₹{u.highestBid?.toLocaleString()}</div>
                        </div>
                    )) : (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No bids placed yet.</p>
                    )}
                </div>

                {/* Panel 3: Most Active Bidders */}
                <div className="card animate-slide-up" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', animationDelay: '0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)' }}>
                            <Activity style={{ color: '#3b82f6', width: 22, height: 22 }} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Most Active Bidders</h2>
                    </div>
                    {data.activeBidders?.length > 0 ? data.activeBidders.map((u, i) => (
                        <div key={u._id?._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontWeight: 800, color: i < 3 ? '#3b82f6' : 'var(--text-muted)', width: '20px' }}>#{i + 1}</span>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u._id?.name || 'Anonymous'}</span>
                            </div>
                            <div style={{ fontWeight: 800, color: '#3b82f6' }}>{u.totalBids} bids</div>
                        </div>
                    )) : (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No bids placed yet.</p>
                    )}
                </div>

            </div>
        </div>
    );
}
