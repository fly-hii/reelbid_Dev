'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    Loader2, CreditCard, ChevronRight, Wallet,
    ShoppingBag, Gavel, Trophy, TrendingUp, Clock, ArrowUpRight,
    Eye, Coins, Lock, Unlock, RefreshCcw, ArrowDownLeft,
    ArrowUpFromLine, DollarSign, History, AlertCircle, CheckCircle, PlusCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BuyerDashboard() {
    const { data: session } = useSession();
    const [walletData, setWalletData] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [myBids, setMyBids] = useState<any[]>([]);
    const [auctions, setAuctions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [topupAmount, setTopupAmount] = useState('');
    const [topupLoading, setTopupLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'wallet' | 'bids' | 'auctions'>('overview');

    // Quick Bid Modal State
    const [bidModalOpen, setBidModalOpen] = useState(false);
    const [bidItem, setBidItem] = useState<any>(null);
    const [quickBidAmount, setQuickBidAmount] = useState('');
    const [bidding, setBidding] = useState(false);

    useEffect(() => {
        if (bidModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [bidModalOpen]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [walletRes, bidsRes, auctionsRes, txRes] = await Promise.all([
                fetch('/api/wallet?transactions=true&limit=10'),
                fetch(`/api/bids?userId=${(session?.user as any)?.id}`),
                fetch('/api/items'),
                fetch('/api/wallet/transactions?limit=20'),
            ]);
            const [wallet, bids, auctionsList, txData] = await Promise.all([
                walletRes.json(), bidsRes.json(), auctionsRes.json(), txRes.json(),
            ]);
            setWalletData(wallet);
            setMyBids(Array.isArray(bids) ? bids : []);
            setAuctions(Array.isArray(auctionsList) ? auctionsList : []);
            setTransactions(txData.transactions || []);

            // Refund check: quietly execute completion on naturally ended auctions where user has active locks
            const now = new Date();
            if (Array.isArray(bids)) {
                let didTriggerRefund = false;
                for (const bid of bids) {
                    if (bid.item && bid.status === 'active' && bid.item.status !== 'Completed' && new Date(bid.item.endDate) <= now) {
                        try {
                            await fetch('/api/auctions/complete', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ itemId: bid.item._id }),
                            });
                            didTriggerRefund = true;
                        } catch { }
                    }
                }
                // If anything was unlocked, we quickly grab their new wallet data to reflect the returned cash
                if (didTriggerRefund) {
                    const freshWallet = await fetch('/api/wallet?transactions=true&limit=10').then(r => r.json());
                    setWalletData(freshWallet);
                    const freshBids = await fetch(`/api/bids?userId=${(session?.user as any)?.id}`).then(r => r.json());
                    setMyBids(Array.isArray(freshBids) ? freshBids : []);
                    const freshTx = await fetch('/api/wallet/transactions?limit=20').then(r => r.json());
                    setTransactions(freshTx.transactions || []);
                }
            }
        } catch { }
        setLoading(false);
    };

    const handleTopup = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(topupAmount);
        if (!amt || amt <= 0) return toast.error('Enter a valid amount');
        setTopupLoading(true);
        try {
            const res = await fetch('/api/wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: amt }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setWalletData((prev: any) => ({ ...prev, ...data }));
            setTopupAmount('');
            toast.success(`₹${amt} added to wallet!`);
            fetchData();
        } catch (err: any) {
            toast.error(err.message);
        }
        setTopupLoading(false);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" />
            </div>
        );
    }

    // Filter to get the latest unique bid per item to accurately know if they are winning or outbid
    const uniqueBids = myBids.reduce((acc: any[], bid: any) => {
        if (!acc.find(b => b.item?._id === bid.item?._id)) {
            acc.push(bid);
        }
        return acc;
    }, []);

    const nowTime = new Date();
    const activeBids = uniqueBids.filter(b => b.item && b.item.status !== 'Completed' && new Date(b.item.endDate) > nowTime);
    const wonBids = myBids.filter(b => b.status === 'won');
    const totalLocked = walletData?.lockedBalance || 0;

    const handleQuickBidSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bidItem) return;
        const amt = parseInt(quickBidAmount, 10);
        if (isNaN(amt) || amt <= bidItem.currentPrice) return toast.error('Bid must be higher than current price');
        setBidding(true);
        try {
            const res = await fetch('/api/bids', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: bidItem._id, amount: amt }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || 'Bid failed');
            } else {
                toast.success('Bid placed successfully! 🎯');
                setBidModalOpen(false);
                fetchData();
            }
        } catch { toast.error('Network error'); }
        setBidding(false);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'credit': return <ArrowDownLeft size={14} />;
            case 'debit': return <ArrowUpFromLine size={14} />;
            case 'lock': return <Lock size={14} />;
            case 'unlock': return <Unlock size={14} />;
            case 'refund': return <RefreshCcw size={14} />;
            case 'payment': return <DollarSign size={14} />;
            default: return <History size={14} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'credit': case 'refund': case 'unlock': return 'var(--success)';
            case 'debit': case 'payment': return 'var(--danger)';
            case 'lock': return 'var(--warning)';
            default: return 'var(--text-muted)';
        }
    };

    const formatDate = (d: string) => {
        const date = new Date(d);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) +
            ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const tabBtnStyle = (tab: string) => ({
        padding: '10px 20px',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600 as const,
        fontSize: '0.85rem',
        background: activeTab === tab ? 'var(--accent)' : 'var(--bg-card)',
        color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShoppingBag size={28} style={{ color: 'var(--accent)' }} />
                        Buyer Dashboard
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Welcome back, {(session?.user as any)?.name}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(['overview', 'wallet', 'bids', 'auctions'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={tabBtnStyle(tab)}>
                            {tab === 'overview' && <TrendingUp size={15} />}
                            {tab === 'wallet' && <Wallet size={15} />}
                            {tab === 'bids' && <Gavel size={15} />}
                            {tab === 'auctions' && <Eye size={15} />}
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* === OVERVIEW TAB === */}
            {activeTab === 'overview' && (
                <>
                    {/* Stat Cards */}
                    <div className="dash-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                        {[
                            { label: 'Wallet Balance', value: `₹${walletData?.balance?.toLocaleString() || 0}`, icon: <Wallet size={20} />, color: 'var(--accent)' },
                            { label: 'Locked Deposits', value: `₹${totalLocked.toLocaleString()}`, icon: <Lock size={20} />, color: 'var(--warning)' },
                            { label: 'Available Balance', value: `₹${(walletData?.availableBalance || 0).toLocaleString()}`, icon: <Coins size={20} />, color: 'var(--success)' },
                            { label: 'Active Bids', value: activeBids.length, icon: <Gavel size={20} />, color: '#ec4899' },
                        ].map((stat, i) => (
                            <div key={i} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: '12px',
                                    background: `${stat.color}18`, display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', color: stat.color,
                                }}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Two Column: Wallet + Active Bids */}
                    <div className="dash-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Quick Topup */}
                        <div className="card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <CreditCard size={18} style={{ color: 'var(--accent)' }} />
                                Quick Top-up
                            </h3>
                            <form onSubmit={handleTopup} style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="Amount (₹)"
                                    value={topupAmount}
                                    onChange={e => setTopupAmount(e.target.value)}
                                    min="1"
                                    style={{ flex: 1 }}
                                />
                                <button type="submit" className="btn-primary" disabled={topupLoading}>
                                    {topupLoading ? <Loader2 size={16} className="animate-spin" /> : 'Add'}
                                </button>
                            </form>
                            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {[100, 500, 1000, 5000].map(amt => (
                                    <button key={amt} onClick={() => setTopupAmount(String(amt))}
                                        className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                                        ₹{amt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recent Active Bids */}
                        <div className="card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <Gavel size={18} style={{ color: 'var(--accent)' }} />
                                Active Bids
                            </h3>
                            {activeBids.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active bids yet.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {activeBids.slice(0, 5).map((bid: any) => (
                                        <div key={bid._id} style={{
                                            display: 'flex', flexDirection: 'column', gap: '8px',
                                            padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>{bid.item?.title || 'Auction'}</p>

                                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <TrendingUp size={12} /> Current Bid: ₹{bid.item?.currentPrice?.toLocaleString()}
                                                        </p>
                                                        <p style={{ color: 'var(--warning)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                                            <Trophy size={12} /> Position: #{bid.position || '?'}
                                                        </p>
                                                    </div>

                                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Gavel size={12} /> My Bid: ₹{bid.amount?.toLocaleString()} (Locked: ₹{bid.lockedDeposit?.toLocaleString()})
                                                        </p>
                                                        {bid.item?.endDate && (
                                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <Clock size={12} /> Ends: {new Date(bid.item.endDate).toLocaleDateString()} {new Date(bid.item.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                                <button
                                                    className="btn-primary"
                                                    style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                                    onClick={() => {
                                                        setBidItem(bid.item);
                                                        setQuickBidAmount((bid.item.currentPrice + 100).toString());
                                                        setBidModalOpen(true);
                                                    }}
                                                >
                                                    <PlusCircle size={14} /> Bid Now
                                                </button>
                                                <Link href={`/auctions/${bid.item?._id}`} style={{ flex: 1 }}>
                                                    <button className="btn-secondary" style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem' }}>
                                                        View Auction
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Won Auctions */}
                    {wonBids.length > 0 && (
                        <div className="card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <Trophy size={18} style={{ color: 'var(--success)' }} />
                                Won Auctions
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {wonBids.map((bid: any) => (
                                    <div key={bid._id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '12px 14px', borderRadius: '12px', background: 'var(--success-soft)',
                                    }}>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{bid.item?.title || 'Auction'}</p>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                                Won at ₹{bid.amount?.toLocaleString()}
                                            </p>
                                        </div>
                                        <span className="badge badge-success">🏆 Won</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* === WALLET TAB === */}
            {activeTab === 'wallet' && (
                <>
                    {/* Wallet Cards */}
                    <div className="dash-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
                            <Wallet size={28} style={{ color: 'var(--accent)', marginBottom: '8px' }} />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Balance</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{(walletData?.balance || 0).toLocaleString()}</p>
                        </div>
                        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
                            <Lock size={28} style={{ color: 'var(--warning)', marginBottom: '8px' }} />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Locked (Security)</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--warning)' }}>₹{totalLocked.toLocaleString()}</p>
                        </div>
                        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
                            <Coins size={28} style={{ color: 'var(--success)', marginBottom: '8px' }} />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
                                ₹{(walletData?.availableBalance || 0).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Topup + Transactions */}
                    <div className="dash-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                        {/* Topup Card */}
                        <div className="card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Add Money</h3>
                            <form onSubmit={handleTopup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <input type="number" className="input-field" placeholder="Enter amount (₹)"
                                    value={topupAmount} onChange={e => setTopupAmount(e.target.value)} min="1" />
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {[100, 500, 1000, 5000, 10000].map(amt => (
                                        <button key={amt} type="button" onClick={() => setTopupAmount(String(amt))}
                                            className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                                            ₹{amt.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                                <button type="submit" className="btn-primary" disabled={topupLoading} style={{ width: '100%' }}>
                                    {topupLoading ? <Loader2 size={16} className="animate-spin" /> : 'Add to Wallet'}
                                </button>
                            </form>
                        </div>

                        {/* Transaction History */}
                        <div className="card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <History size={18} style={{ color: 'var(--accent)' }} />
                                Transaction History
                            </h3>
                            <div className="table-wrap">
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                            <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Type</th>
                                            <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Amount</th>
                                            <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Description</th>
                                            <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.length === 0 ? (
                                            <tr><td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions yet</td></tr>
                                        ) : transactions.map((tx: any) => (
                                            <tr key={tx._id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                                <td style={{ padding: '8px' }}>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                        padding: '3px 10px', borderRadius: '8px', fontSize: '0.75rem',
                                                        fontWeight: 700, color: getTypeColor(tx.type),
                                                        background: `${getTypeColor(tx.type)}15`,
                                                    }}>
                                                        {getTypeIcon(tx.type)} {tx.type.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '8px', fontWeight: 700, color: ['credit', 'refund'].includes(tx.type) ? 'var(--success)' : 'var(--danger)' }}>
                                                    {['credit', 'refund'].includes(tx.type) ? '+' : '-'}₹{tx.amount?.toLocaleString()}
                                                </td>
                                                <td style={{ padding: '8px', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {tx.description}
                                                </td>
                                                <td style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                                    {formatDate(tx.createdAt)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* === BIDS TAB === */}
            {activeTab === 'bids' && (
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Gavel size={18} style={{ color: 'var(--accent)' }} />
                        All My Bids
                    </h3>
                    <div className="table-wrap">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                    <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Auction</th>
                                    <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>My Bid</th>
                                    <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Locked Deposit</th>
                                    <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                                    <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Position</th>
                                    <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Ends</th>
                                    <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Date Placed</th>
                                    <th style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>View</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myBids.length === 0 ? (
                                    <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No bids placed yet. Browse auctions to start bidding!
                                    </td></tr>
                                ) : myBids.map((bid: any) => (
                                    <tr key={bid._id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                        <td style={{ padding: '10px', fontWeight: 600 }}>{bid.item?.title || '—'}</td>
                                        <td style={{ padding: '10px', fontWeight: 700 }}>₹{bid.amount?.toLocaleString()}</td>
                                        <td style={{ padding: '10px', color: 'var(--warning)', fontWeight: 600 }}>₹{bid.lockedDeposit?.toLocaleString()}</td>
                                        <td style={{ padding: '10px' }}>
                                            <span className={`badge ${bid.status === 'won' ? 'badge-success' :
                                                bid.isTopBid && bid.item?.status !== 'Completed' ? 'badge-accent' :
                                                    bid.status === 'refunded' ? 'badge-success' : 'badge-danger'
                                                }`}>
                                                {bid.status === 'won' ? '🏆 Won' :
                                                    bid.isTopBid && bid.item?.status !== 'Completed' ? '🥇 Highest Bidder' :
                                                        bid.status === 'refunded' ? '↩ Refunded' :
                                                            '❌ Outbid'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                            #{bid.position || '?'}
                                        </td>
                                        <td style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                            {bid.item?.endDate ? new Date(bid.item.endDate).toLocaleDateString() : '—'}
                                        </td>
                                        <td style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                            {formatDate(bid.createdAt)}
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            {bid.item?._id && (
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    {bid.item.status !== 'Completed' && new Date(bid.item.endDate) > new Date() && (
                                                        <button
                                                            onClick={() => {
                                                                setBidItem(bid.item);
                                                                setQuickBidAmount((bid.item.currentPrice + 100).toString());
                                                                setBidModalOpen(true);
                                                            }}
                                                            className="btn-primary"
                                                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                                        >
                                                            Bid Now
                                                        </button>
                                                    )}
                                                    <Link href={`/auctions/${bid.item._id}`}>
                                                        <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>View</button>
                                                    </Link>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* === AUCTIONS TAB === */}
            {activeTab === 'auctions' && (
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Eye size={18} style={{ color: 'var(--accent)' }} />
                        Live Auctions
                    </h3>
                    {auctions.filter((a: any) => a.status === 'Active' && new Date(a.endDate) > new Date()).length === 0 ? (
                        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                            <AlertCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                            <p style={{ color: 'var(--text-muted)' }}>No live auctions right now. Check back soon!</p>
                        </div>
                    ) : (
                        <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                            {auctions.filter((a: any) => a.status === 'Active' && new Date(a.endDate) > new Date()).map((item: any) => {
                                const timeLeft = new Date(item.endDate).getTime() - Date.now();
                                const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
                                const minsLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));

                                return (
                                    <Link href={`/auctions/${item._id}`} key={item._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="card" style={{ padding: '20px', cursor: 'pointer', transition: 'transform 0.2s' }}>
                                            {item.images?.[0] && (
                                                <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '12px', height: '160px', background: '#0a0a0a' }}>
                                                    <img src={item.images[0]} alt={item.title}
                                                        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
                                                </div>
                                            )}
                                            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>{item.title}</h4>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current Bid</p>
                                                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>
                                                        ₹{item.currentPrice?.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Deposit</p>
                                                    <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--warning)' }}>
                                                        {item.securityPercentage || 5}%
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                padding: '6px 10px', borderRadius: '8px',
                                                background: timeLeft < 3600000 ? 'var(--danger-soft)' : 'var(--bg-secondary)',
                                                color: timeLeft < 3600000 ? 'var(--danger)' : 'var(--text-muted)',
                                                fontSize: '0.78rem', fontWeight: 600,
                                            }}>
                                                <Clock size={13} />
                                                {hoursLeft}h {minsLeft}m left
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
            {/* === QUICK BID MODAL === */}
            {bidModalOpen && bidItem && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)'
                }}>
                    <div className="card animate-slide-up" style={{ width: '90%', maxWidth: '400px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Quick Bid</h3>
                            <button onClick={() => setBidModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
                            <strong>Item:</strong> {bidItem.title}
                        </p>
                        <p style={{ color: 'var(--success)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: 700 }}>
                            <strong>Current Price:</strong> ₹{bidItem.currentPrice?.toLocaleString()}
                        </p>

                        <form onSubmit={handleQuickBidSubmit}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                Your Bid Amount (₹)
                            </label>
                            <input
                                type="number"
                                className="input-field"
                                value={quickBidAmount}
                                onChange={(e) => setQuickBidAmount(e.target.value)}
                                min={bidItem.currentPrice + 1}
                                required
                                style={{ marginBottom: '20px', fontSize: '1.2rem', padding: '14px' }}
                            />
                            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }} disabled={bidding}>
                                {bidding ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Bid'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
