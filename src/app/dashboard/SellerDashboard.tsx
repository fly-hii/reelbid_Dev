'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    Loader2, PlusCircle, Store, Package, TrendingUp, DollarSign,
    Gavel, Clock, CheckCircle, XCircle, Eye, MoreVertical,
    ArrowUpRight, AlertCircle, Coins
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SellerDashboard() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [sellerData, setSellerData] = useState<any>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Form states
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [price, setPrice] = useState('');
    const [days, setDays] = useState('7');
    const [creating, setCreating] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    const fetchData = () => {
        fetch('/api/seller/items')
            .then(r => r.json())
            .then(data => { if (!data.error) setSellerData(data); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description: desc,
                    startingPrice: parseInt(price, 10),
                    startDate: new Date(),
                    endDate: new Date(Date.now() + parseInt(days, 10) * 86400000),
                }),
            });
            if (res.ok) {
                toast.success('Auction created successfully!');
                setTitle(''); setDesc(''); setPrice(''); setDays('7');
                setShowCreateForm(false);
                fetchData();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to create auction');
            }
        } catch { toast.error('Error creating auction'); }
        setCreating(false);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" />
            </div>
        );
    }

    const stats = sellerData?.stats || { totalListings: 0, activeListings: 0, completedListings: 0, totalEarnings: 0, totalBidsOnItems: 0 };
    const items = sellerData?.items || [];

    const filteredItems = items.filter((item: any) => {
        const isActive = item.status === 'Active' && new Date(item.endDate) > new Date();
        if (filter === 'active') return isActive;
        if (filter === 'completed') return !isActive;
        return true;
    });

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
                    }}>
                        <Store style={{ width: 24, height: 24, color: '#fff' }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                            Seller Dashboard
                        </h1>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Welcome, {session?.user?.name || 'Seller'} — manage your auction listings
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="btn-primary"
                    style={{ padding: '10px 24px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                    <PlusCircle style={{ width: 16, height: 16 }} />
                    {showCreateForm ? 'Close' : 'New Auction'}
                </button>
            </div>

            {/* Stats Row */}
            <div className="dash-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {[
                    { label: 'Total Listings', value: stats.totalListings, icon: Package, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
                    { label: 'Active', value: stats.activeListings, icon: Clock, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
                    { label: 'Completed', value: stats.completedListings, icon: CheckCircle, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
                    { label: 'Bids Received', value: stats.totalBidsOnItems, icon: Gavel, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                    { label: 'Total Earnings', value: `₹${stats.totalEarnings.toLocaleString()}`, icon: DollarSign, color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
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

            {/* Create Auction Form */}
            {showCreateForm && (
                <div className="card" style={{ padding: '32px', animation: 'fadeSlideIn 0.3s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <PlusCircle style={{ width: 20, height: 20 }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Create New Auction</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>List a movie memorabilia item for bidding</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                Item Title
                            </label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                                className="input-field focus-ring" placeholder="Ex: Tom Cruise's jacket from Mission Impossible" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                Description
                            </label>
                            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} required rows={3}
                                className="input-field focus-ring" placeholder="Detailed description of the memorabilia..."
                                style={{ resize: 'vertical', minHeight: '80px' }} />
                        </div>
                        <div className="seller-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                    Starting Price (₹)
                                </label>
                                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min={1}
                                    className="input-field focus-ring" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                    Duration (Days)
                                </label>
                                <input type="number" value={days} onChange={(e) => setDays(e.target.value)} required min={1}
                                    className="input-field focus-ring" />
                            </div>
                        </div>
                        <button type="submit" disabled={creating} className="btn-primary" style={{ alignSelf: 'start', padding: '12px 32px' }}>
                            {creating ? <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" /> : 'Create Auction'}
                        </button>
                    </form>
                </div>
            )}

            {/* My Listings */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header + Filter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 0', flexWrap: 'wrap', gap: '12px' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Listings</h2>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {(['all', 'active', 'completed'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    padding: '6px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                    fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize',
                                    background: filter === f ? 'var(--accent-soft)' : 'transparent',
                                    color: filter === f ? 'var(--accent-text)' : 'var(--text-muted)',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ padding: '20px 24px 24px' }}>
                    {filteredItems.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {filteredItems.map((item: any) => {
                                const isActive = item.status === 'Active' && new Date(item.endDate) > new Date();
                                return (
                                    <div
                                        key={item._id}
                                        style={{
                                            display: 'flex', flexDirection: 'column',
                                            borderRadius: '14px',
                                            background: 'var(--bg-input)', border: '1px solid var(--border-primary)',
                                            transition: 'border-color 0.2s', overflow: 'hidden'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    width: '48px', height: '48px', borderRadius: '12px',
                                                    background: 'linear-gradient(135deg, var(--gradient-hero-1), var(--gradient-hero-2))',
                                                    flexShrink: 0,
                                                }} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {item.title}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                                                        <span className={isActive ? 'badge-success' : 'badge-danger'} style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
                                                            {isActive ? '● Live' : '● Ended'}
                                                        </span>
                                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                            {isActive ? `Ends ${new Date(item.endDate).toLocaleDateString()}` : `Ended ${new Date(item.endDate).toLocaleDateString()}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                                        {!isActive && item.highestBidder ? 'Winning Bid' : 'Current'}
                                                    </div>
                                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Coins style={{ width: 14, height: 14, color: 'var(--accent-text)' }} />
                                                        ₹{item.currentPrice.toLocaleString()}
                                                    </div>
                                                </div>
                                                <Link
                                                    href={`/auctions/${item._id}`}
                                                    style={{
                                                        width: '38px', height: '38px', borderRadius: '10px',
                                                        background: 'var(--accent-soft)', color: 'var(--accent-text)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        textDecoration: 'none', transition: 'background 0.2s',
                                                    }}
                                                >
                                                    <Eye style={{ width: 16, height: 16 }} />
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Winner Details Section */}
                                        {!isActive && item.highestBidder && (
                                            <div style={{
                                                padding: '16px 18px',
                                                borderTop: '1px solid var(--border-primary)',
                                                background: 'var(--bg-card-hover)',
                                                display: 'flex', flexDirection: 'column', gap: '12px'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <CheckCircle style={{ width: 16, height: 16, color: 'var(--success)' }} />
                                                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Winner Information</h4>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
                                                    <div>
                                                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontSize: '0.75rem' }}>Name</span>
                                                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.highestBidder.name || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontSize: '0.75rem' }}>Mobile</span>
                                                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.highestBidder.phone ? `+91 ${item.highestBidder.phone}` : 'N/A'}</span>
                                                    </div>
                                                    <div style={{ gridColumn: '1 / -1' }}>
                                                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontSize: '0.75rem' }}>Shipping Address</span>
                                                        <span style={{ color: 'var(--text-secondary)', lineHeight: '1.5', display: 'block' }}>
                                                            {item.highestBidder.address ? (
                                                                <>
                                                                    {item.highestBidder.address}<br />
                                                                    {item.highestBidder.city}, {item.highestBidder.state} - {item.highestBidder.pincode}
                                                                </>
                                                            ) : 'No address provided'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <Package style={{ width: 40, height: 40, color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                            <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                                {filter === 'all' ? 'No listings yet' : `No ${filter} listings`}
                            </p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Create your first auction to start selling!
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(-12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
