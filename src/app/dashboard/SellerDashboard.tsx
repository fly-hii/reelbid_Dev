'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    Loader2, PlusCircle, Store, Package, TrendingUp, DollarSign,
    Gavel, Clock, CheckCircle, XCircle, Eye, MoreVertical,
    ArrowUpRight, AlertCircle, Coins, Shield, Percent, Calendar,
    ChevronDown, Users, Award, Lock, LayoutDashboard, List
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SellerDashboard() {
    const { data: session } = useSession();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
    const [searchText, setSearchText] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        setSearchText('');
        setDateFrom('');
        setDateTo('');
    }, [activeTab]);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/items?sellerId=${(session?.user as any)?.id}`);
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch { }
        setLoading(false);
    };




    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" />
            </div>
        );
    }

    const activeItems = items.filter(i => i.status === 'Active' && new Date(i.endDate) > new Date());
    const completedItems = items.filter(i => i.status === 'Completed' || (i.status === 'Active' && new Date(i.endDate) <= new Date()));
    const totalRevenue = completedItems.reduce((sum, i) => {
        const shareObj = i.revenueShares?.find((r: any) => r.sellerId === (session?.user as any)?.id);
        const percent = shareObj ? parseFloat(shareObj.percentage) || 100 : (i.seller?._id === (session?.user as any)?.id ? 100 : 0);
        return sum + ((i.finalAmount || i.currentPrice || 0) * percent) / 100;
    }, 0);
    const totalBids = items.reduce((sum, i) => sum + (i.bidCount || 0), 0);

    const filteredItems = (activeTab === 'active' ? activeItems : activeTab === 'completed' ? completedItems : items)
        .filter(i => !searchText || i.title?.toLowerCase().includes(searchText.toLowerCase()) || i.description?.toLowerCase().includes(searchText.toLowerCase()))
        .filter(i => {
            const itemDate = new Date(i.createdAt || i.startDate).toISOString().split('T')[0];
            if (dateFrom && itemDate < dateFrom) return false;
            if (dateTo && itemDate > dateTo) return false;
            return true;
        });

    const formatDate = (d: string) => {
        const date = new Date(d);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) +
            ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const sidebarItems = [
        { key: 'active', label: `Active (${activeItems.length})`, icon: <Package size={18} />, color: 'var(--accent)' },
        { key: 'completed', label: `Completed (${completedItems.length})`, icon: <CheckCircle size={18} />, color: 'var(--success)' },
        { key: 'all', label: `All (${items.length})`, icon: <List size={18} />, color: 'var(--text-muted)' },
    ];

    return (
        <div style={{ display: 'flex', gap: '24px', minHeight: '70vh' }}>
            {/* Sidebar */}
            <div className="dash-sidebar" style={{
                width: '220px', flexShrink: 0,
                display: 'flex', flexDirection: 'column', gap: '4px',
            }}>
                <div style={{ marginBottom: '16px' }}>
                    <h1 style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Store size={22} style={{ color: 'var(--accent)' }} />
                        Seller Panel
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>Manage your auctions</p>
                </div>

                {sidebarItems.map(item => (
                    <button key={item.key}
                        onClick={() => setActiveTab(item.key as any)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 14px', borderRadius: '12px',
                            border: 'none', cursor: 'pointer',
                            fontWeight: activeTab === item.key ? 700 : 500,
                            fontSize: '0.85rem',
                            background: activeTab === item.key ? 'var(--accent)' : 'transparent',
                            color: activeTab === item.key ? '#fff' : 'var(--text-secondary)',
                            transition: 'all 0.2s',
                            textAlign: 'left' as const,
                            width: '100%',
                        }}>
                        {item.icon} {item.label}
                    </button>
                ))}

                <div style={{ height: '1px', background: 'var(--border-primary)', margin: '8px 0' }} />

                {/* Quick Stats in sidebar */}
                <div style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase' }}>Quick Stats</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Total Bids</span>
                            <strong>{totalBids}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Revenue</span>
                            <strong style={{ color: 'var(--success)' }}>₹{totalRevenue.toLocaleString()}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <h2 style={{ fontWeight: 700, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {activeTab === 'active' && <><Package size={20} style={{ color: 'var(--accent)' }} /> Active Auctions</>}
                        {activeTab === 'completed' && <><CheckCircle size={20} style={{ color: 'var(--success)' }} /> Completed Auctions</>}
                        {activeTab === 'all' && <><List size={20} style={{ color: 'var(--text-muted)' }} /> All Auctions</>}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            <input type="date" className="input-field" value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                style={{ width: '140px', fontSize: '0.8rem', padding: '7px 10px' }}
                                title="From date" />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>to</span>
                            <input type="date" className="input-field" value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                style={{ width: '140px', fontSize: '0.8rem', padding: '7px 10px' }}
                                title="To date" />
                            {(dateFrom || dateTo) && (
                                <button onClick={() => { setDateFrom(''); setDateTo(''); }}
                                    style={{ background: 'var(--danger-soft)', color: 'var(--danger)', border: 'none', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                                    Clear
                                </button>
                            )}
                        </div>
                        <div style={{ position: 'relative' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input className="input-field" placeholder="Search your auctions..."
                                value={searchText} onChange={e => setSearchText(e.target.value)}
                                style={{ paddingLeft: '36px', width: '220px' }} />
                        </div>
                    </div>
                </div>

                {/* Auction List */}
                {filteredItems.length === 0 ? (
                    <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                        <AlertCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                        <p style={{ color: 'var(--text-muted)' }}>No auctions found.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredItems.map((item: any) => {
                            const isActive = item.status === 'Active' && new Date(item.endDate) > new Date();
                            const isEnded = new Date(item.endDate) <= new Date() && item.status !== 'Completed';
                            const timeLeft = new Date(item.endDate).getTime() - Date.now();
                            const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
                            const minsLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));
                            const shareObj = item.revenueShares?.find((r: any) => r.sellerId === (session?.user as any)?.id);
                            const sellerPercent = shareObj ? parseFloat(shareObj.percentage) || 100 : (item.seller?._id === (session?.user as any)?.id ? 100 : 0);
                            const revAmount = ((item.finalAmount || item.currentPrice || 0) * sellerPercent) / 100;

                            return (
                                <div key={item._id} className="card" style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>

                                        {/* Thumbnail Image */}
                                        <div style={{ width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#0a0a0a', border: '1px solid var(--border-primary)' }}>
                                            {item.images && item.images.length > 0 ? (
                                                <Link href={`/auctions/${item._id}`}>
                                                    <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }} />
                                                </Link>
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                                    <Package size={24} />
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ flex: 1, minWidth: '200px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>{item.title}</h4>
                                                <span className={`badge ${item.status === 'Completed' ? 'badge-success' : isActive ? 'badge-accent' : 'badge-danger'}`}>
                                                    {item.status === 'Completed' ? '✓ Completed' : isActive ? '● Live' : '⏱ Ended'}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {item.description}
                                            </p>
                                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <DollarSign size={14} style={{ color: 'var(--accent)' }} />
                                                    Base: ₹{item.startingPrice?.toLocaleString()}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                                                    <TrendingUp size={14} style={{ color: 'var(--success)' }} />
                                                    Current: ₹{item.currentPrice?.toLocaleString()}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Lock size={14} style={{ color: 'var(--warning)' }} />
                                                    Deposit: {item.securityPercentage || 5}% (₹{Math.ceil(item.startingPrice * ((item.securityPercentage || 5) / 100)).toLocaleString()})
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Gavel size={14} />
                                                    {item.bidCount || 0} bids
                                                </span>
                                                {isActive && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: timeLeft < 3600000 ? 'var(--danger)' : 'var(--text-muted)' }}>
                                                        <Clock size={14} />
                                                        {hoursLeft}h {minsLeft}m left
                                                    </span>
                                                )}
                                            </div>

                                            {shareObj && (
                                                <div style={{ marginTop: '10px', fontSize: '0.82rem' }}>
                                                    <span style={{
                                                        background: 'var(--accent-soft)', color: 'var(--accent-text)',
                                                        padding: '4px 8px', borderRadius: '4px', fontWeight: 600,
                                                        display: 'inline-flex', alignItems: 'center', gap: '4px'
                                                    }}>
                                                        <DollarSign size={14} /> My Share: {sellerPercent}% (₹{revAmount.toLocaleString()})
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.8 }}> - {shareObj.professionalRole}</span>
                                                    </span>
                                                </div>
                                            )}

                                            {item.winner && (
                                                <div style={{
                                                    marginTop: '10px', padding: '8px 12px', borderRadius: '10px',
                                                    background: 'var(--success-soft)', display: 'flex', alignItems: 'center', gap: '8px',
                                                    fontSize: '0.82rem',
                                                }}>
                                                    <Award size={14} style={{ color: 'var(--success)' }} />
                                                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                                                        Winner: {item.winner?.name || 'N/A'} · Final: ₹{item.finalAmount?.toLocaleString() || item.currentPrice?.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <Link href={`/auctions/${item._id}`}>
                                                <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                                                    <Eye size={14} /> View
                                                </button>
                                            </Link>
                                            {item.status === 'Completed' && (
                                                <Link href={`/dashboard/auction/${item._id}`}>
                                                    <button className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                                                        <Users size={14} /> Manage
                                                    </button>
                                                </Link>
                                            )}

                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
