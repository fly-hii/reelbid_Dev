'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    Loader2, CreditCard, Crown, Check, ChevronRight, Wallet,
    ShoppingBag, Gavel, Trophy, TrendingUp, Clock, ArrowUpRight,
    Eye, Coins
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BuyerDashboard() {
    const { data: session } = useSession();
    const [wallet, setWallet] = useState({ balance: 0, tier: 'None' });
    const [loading, setLoading] = useState(true);
    const [topupAmount, setTopupAmount] = useState('');
    const [showTopup, setShowTopup] = useState(false);
    const [buyerData, setBuyerData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'bids' | 'won'>('bids');
    const [tiers, setTiers] = useState<any[]>([]);

    useEffect(() => {
        Promise.all([
            fetch('/api/wallet').then(r => r.json()),
            fetch('/api/buyer/bids').then(r => r.json()),
            fetch('/api/tiers').then(r => r.json()),
        ]).then(([walletData, bidData, tierData]) => {
            if (!walletData.error) setWallet(walletData);
            if (!bidData.error) setBuyerData(bidData);
            if (Array.isArray(tierData)) setTiers(tierData);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleTopup = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseInt(topupAmount, 10);
        if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
        try {
            const res = await fetch('/api/wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: amt }),
            });
            const data = await res.json();
            if (data.success) {
                setWallet({ balance: data.balance, tier: data.tier });
                toast.success(`Wallet funded! You are now in ${data.tier}.`);
                setTopupAmount('');
                setShowTopup(false);
            } else toast.error(data.error);
        } catch { toast.error('Topup failed'); }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" />
            </div>
        );
    }

    const stats = buyerData?.stats || { totalBidsPlaced: 0, totalWon: 0, totalSpent: 0, activeBidsCount: 0 };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
                    }}>
                        <ShoppingBag style={{ width: 24, height: 24, color: '#fff' }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                            Buyer Dashboard
                        </h1>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Welcome back, {session?.user?.name || 'Collector'} — manage your bids & wallet
                        </p>
                    </div>
                </div>
                <Link
                    href="/auctions"
                    className="btn-primary"
                    style={{ padding: '10px 24px', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                    <Gavel style={{ width: 16, height: 16 }} />
                    Browse Auctions
                </Link>
            </div>

            {/* Stats Row */}
            <div className="dash-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {[
                    { label: 'Bids Placed', value: stats.totalBidsPlaced, icon: Gavel, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
                    { label: 'Active Bids', value: stats.activeBidsCount, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                    { label: 'Items Won', value: stats.totalWon, icon: Trophy, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
                    { label: 'Total Spent', value: `₹${stats.totalSpent.toLocaleString()}`, icon: TrendingUp, color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
                ].map((s, i) => (
                    <div key={i} className="card" style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px',
                            background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <s.icon style={{ width: 22, height: 22, color: s.color }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {s.label}
                            </div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                {s.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Wallet + Tiers */}
            <div className="dash-two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {/* Wallet Card */}
                <div
                    className="card"
                    style={{
                        padding: '32px',
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, var(--accent-soft), var(--bg-card))',
                    }}
                >
                    <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'var(--accent-soft)', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.6 }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                            <Wallet style={{ width: 20, height: 20, color: 'var(--accent-text)' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Your Wallet
                            </span>
                        </div>
                        <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                            ₹{wallet.balance.toLocaleString()}
                        </div>
                        <div className="badge-success" style={{ marginTop: '16px' }}>
                            <Crown style={{ width: 14, height: 14 }} />
                            {wallet.tier}
                        </div>
                        <div style={{ marginTop: '24px' }}>
                            {!showTopup ? (
                                <button onClick={() => setShowTopup(true)} className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
                                    <CreditCard style={{ width: 16, height: 16 }} />
                                    Add Funds
                                </button>
                            ) : (
                                <form onSubmit={handleTopup} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="number" value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)}
                                        className="input-field focus-ring" placeholder="Amount (₹)" min={1}
                                        style={{ flex: 1, fontSize: '0.9rem' }} autoFocus
                                    />
                                    <button type="submit" className="btn-primary" style={{ padding: '12px 20px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Add</button>
                                    <button type="button" onClick={() => setShowTopup(false)} className="btn-secondary" style={{ padding: '12px 16px', fontSize: '0.85rem' }}>Cancel</button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tier Info */}
                <div className="card" style={{ padding: '32px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>
                        Bidding Tiers
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {tiers.map((tier: any) => {
                            const isActive = wallet.tier === tier.name;
                            const isUnlocked = wallet.balance >= tier.minBalance;
                            return (
                                <div
                                    key={tier._id || tier.name}
                                    style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '14px 16px', borderRadius: '12px',
                                        background: isActive ? 'var(--accent-soft)' : 'var(--bg-input)',
                                        border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-primary)'}`,
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '28px', height: '28px', borderRadius: '8px',
                                            background: isUnlocked ? 'var(--success-soft)' : 'var(--bg-card-hover)',
                                            color: isUnlocked ? 'var(--success)' : 'var(--text-muted)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {isUnlocked ? <Check style={{ width: 14, height: 14 }} /> : <ChevronRight style={{ width: 14, height: 14 }} />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isActive ? 'var(--accent-text)' : 'var(--text-primary)' }}>{tier.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>≥ ₹{tier.minBalance.toLocaleString()} wallet</div>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)' }}>
                                        ₹{tier.bidLimit.toLocaleString()} max
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bid History / Won Items Tabs */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Tab bar */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-primary)' }}>
                    {[
                        { key: 'bids' as const, label: 'My Bids', icon: Gavel },
                        { key: 'won' as const, label: 'Won Items', icon: Trophy },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1, padding: '16px', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                fontSize: '0.9rem', fontWeight: 700,
                                background: activeTab === tab.key ? 'var(--accent-soft)' : 'transparent',
                                color: activeTab === tab.key ? 'var(--accent-text)' : 'var(--text-muted)',
                                borderBottom: activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
                                transition: 'all 0.2s',
                            }}
                        >
                            <tab.icon style={{ width: 16, height: 16 }} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ padding: '24px' }}>
                    {activeTab === 'bids' ? (
                        buyerData?.bids?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {buyerData.bids.slice(0, 20).map((bid: any) => (
                                    <div
                                        key={bid._id}
                                        style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '16px', borderRadius: '12px',
                                            background: 'var(--bg-input)', border: '1px solid var(--border-primary)',
                                            transition: 'border-color 0.2s',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '10px',
                                                background: bid.isTopBid ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {bid.isTopBid
                                                    ? <Trophy style={{ width: 18, height: 18, color: '#22c55e' }} />
                                                    : <Gavel style={{ width: 18, height: 18, color: '#f59e0b' }} />
                                                }
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                                    {bid.item?.title || 'Unknown Item'}
                                                </div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    {bid.isTopBid ? '🏆 Highest Bid' : 'Outbid'} · {new Date(bid.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                                                    ₹{bid.amount.toLocaleString()}
                                                </div>
                                            </div>
                                            {bid.item && (
                                                <Link
                                                    href={`/auctions/${bid.item._id}`}
                                                    style={{
                                                        width: '36px', height: '36px', borderRadius: '10px',
                                                        background: 'var(--accent-soft)', color: 'var(--accent-text)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        textDecoration: 'none',
                                                    }}
                                                >
                                                    <Eye style={{ width: 16, height: 16 }} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <Gavel style={{ width: 40, height: 40, color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                                <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No bids yet</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    Start bidding on <Link href="/auctions" style={{ color: 'var(--accent-text)' }}>active auctions</Link>!
                                </p>
                            </div>
                        )
                    ) : (
                        buyerData?.wonItems?.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                {buyerData.wonItems.map((item: any) => (
                                    <div key={item._id} className="card" style={{ padding: '20px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100px', borderRadius: '12px', marginBottom: '16px',
                                            background: 'linear-gradient(135deg, var(--gradient-hero-1), var(--gradient-hero-2))',
                                            position: 'relative',
                                        }}>
                                            <div className="badge-success" style={{ position: 'absolute', bottom: '8px', left: '8px' }}>
                                                <Trophy style={{ width: 12, height: 12 }} /> Won
                                            </div>
                                        </div>
                                        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                                            {item.title}
                                        </h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Coins style={{ width: 16, height: 16, color: 'var(--accent-text)' }} />
                                                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                                                    ₹{item.currentPrice.toLocaleString()}
                                                </span>
                                            </div>
                                            <Link
                                                href={`/auctions/${item._id}`}
                                                style={{
                                                    width: '34px', height: '34px', borderRadius: '10px',
                                                    background: 'var(--accent-soft)', color: 'var(--accent-text)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                <ArrowUpRight style={{ width: 16, height: 16 }} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <Trophy style={{ width: 40, height: 40, color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                                <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No items won yet</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    Keep bidding to win exclusive memorabilia!
                                </p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
