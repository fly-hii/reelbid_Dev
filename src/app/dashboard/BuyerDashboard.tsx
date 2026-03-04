'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    Loader2, CreditCard, ChevronRight, Wallet,
    ShoppingBag, Gavel, Trophy, TrendingUp, Clock, ArrowUpRight,
    Eye, Coins, Lock, Unlock, RefreshCcw, ArrowDownLeft,
    ArrowUpFromLine, DollarSign, History, AlertCircle, CheckCircle, PlusCircle, LayoutDashboard,
    Calendar
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

    // Withdraw States
    const [withdrawRequests, setWithdrawRequests] = useState<any[]>([]);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawForm, setWithdrawForm] = useState({
        amount: '', bankName: '', accountName: '', accountNumber: '', ifscCode: ''
    });

    const [activeTab, setActiveTab] = useState<'overview' | 'wallet' | 'bids' | 'auctions'>('overview');
    const [searchText, setSearchText] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        setSearchText('');
        setDateFrom('');
        setDateTo('');
    }, [activeTab]);

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
            const [walletRes, bidsRes, auctionsRes, txRes, withdrawRes] = await Promise.all([
                fetch('/api/wallet?transactions=true&limit=10'),
                fetch(`/api/bids?userId=${(session?.user as any)?.id}`),
                fetch('/api/items'),
                fetch('/api/wallet/transactions?limit=20'),
                fetch('/api/wallet/withdraw')
            ]);
            const [wallet, bids, auctionsList, txData, withdrawals] = await Promise.all([
                walletRes.json(), bidsRes.json(), auctionsRes.json(), txRes.json(), withdrawRes.json()
            ]);
            setWalletData(wallet);
            setMyBids(Array.isArray(bids) ? bids : []);
            setAuctions(Array.isArray(auctionsList) ? auctionsList : []);
            setTransactions(txData.transactions || []);
            setWithdrawRequests(Array.isArray(withdrawals) ? withdrawals : []);

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
                    const freshWithdraws = await fetch('/api/wallet/withdraw').then(r => r.json());
                    setWithdrawRequests(Array.isArray(freshWithdraws) ? freshWithdraws : []);
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

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(withdrawForm.amount);
        if (!amt || amt < 100) return toast.error('Minimum withdrawal is ₹100');
        if (amt > (walletData?.availableBalance || 0)) return toast.error('Insufficient available balance');
        if (!withdrawForm.bankName || !withdrawForm.accountName || !withdrawForm.accountNumber || !withdrawForm.ifscCode) {
            return toast.error('Please fill all bank details');
        }

        setWithdrawLoading(true);
        try {
            const res = await fetch('/api/wallet/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amt,
                    bankName: withdrawForm.bankName,
                    accountName: withdrawForm.accountName,
                    accountNumber: withdrawForm.accountNumber,
                    ifscCode: withdrawForm.ifscCode
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setWithdrawForm({ amount: '', bankName: '', accountName: '', accountNumber: '', ifscCode: '' });
            toast.success(`Withdrawal request for ₹${amt} submitted!`);
            fetchData();
        } catch (err: any) {
            toast.error(err.message);
        }
        setWithdrawLoading(false);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" />
            </div>
        );
    }

    // Filter to get the latest unique bid per item to accurately know if they are winning or outbid
    // Also compute total locked deposit per auction across all bids
    const uniqueBids = myBids.reduce((acc: any[], bid: any) => {
        const existing = acc.find(b => b.item?._id === bid.item?._id);
        if (!existing) {
            acc.push({ ...bid, totalLockedOnAuction: bid.lockedDeposit || 0 });
        } else {
            existing.totalLockedOnAuction = (existing.totalLockedOnAuction || 0) + (bid.lockedDeposit || 0);
        }
        return acc;
    }, []);

    const nowTime = new Date();
    const activeBids = uniqueBids.filter(b => b.item && b.item.status !== 'Completed' && new Date(b.item.endDate) > nowTime);
    const wonBids = myBids.filter(b => b.status === 'won').reduce((acc: any[], bid: any) => {
        const existing = acc.find(b => b.item?._id === bid.item?._id);
        if (!existing) {
            acc.push(bid);
        } else if (bid.amount > existing.amount) {
            // Replace with higher bid amount
            const idx = acc.indexOf(existing);
            acc[idx] = bid;
        }
        return acc;
    }, []);
    const totalLocked = walletData?.lockedBalance || 0;

    const filteredUniqueBids = uniqueBids
        .filter(bid => !searchText || bid.item?.title?.toLowerCase().includes(searchText.toLowerCase()))
        .filter(bid => {
            const bidDate = new Date(bid.createdAt).toISOString().split('T')[0];
            if (dateFrom && bidDate < dateFrom) return false;
            if (dateTo && bidDate > dateTo) return false;
            return true;
        });
    const filteredTransactions = transactions.filter(tx => !searchText || tx.description?.toLowerCase().includes(searchText.toLowerCase()) || tx.type?.toLowerCase().includes(searchText.toLowerCase()) || tx.auction?.title?.toLowerCase().includes(searchText.toLowerCase()));
    const liveAuctions = auctions.filter((a: any) => a.status === 'Active' && new Date(a.endDate) > new Date() && (a.seller?._id || a.seller) !== (session?.user as any)?.id);
    const filteredLiveAuctions = liveAuctions
        .filter(a => !searchText || a.title?.toLowerCase().includes(searchText.toLowerCase()) || a.description?.toLowerCase().includes(searchText.toLowerCase()))
        .filter(a => {
            const auctionDate = new Date(a.createdAt || a.startDate).toISOString().split('T')[0];
            if (dateFrom && auctionDate < dateFrom) return false;
            if (dateTo && auctionDate > dateTo) return false;
            return true;
        });

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

    const sidebarItems = [
        { key: 'overview', label: 'Overview', icon: <TrendingUp size={18} /> },
        { key: 'wallet', label: 'Wallet', icon: <Wallet size={18} /> },
        { key: 'bids', label: `My Bids (${myBids.length})`, icon: <Gavel size={18} /> },
        { key: 'auctions', label: 'Live Auctions', icon: <Eye size={18} /> },
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
                        <ShoppingBag size={22} style={{ color: 'var(--accent)' }} />
                        Buyer Panel
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>
                        Welcome, {(session?.user as any)?.name?.split(' ')[0]}
                    </p>
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

                {/* Wallet Summary in Sidebar */}
                <div style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase' }}>Wallet</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Balance</span>
                            <strong>₹{(walletData?.balance || 0).toLocaleString()}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Locked</span>
                            <strong style={{ color: 'var(--warning)' }}>₹{totalLocked.toLocaleString()}</strong>
                        </div>
                        <div style={{ height: '1px', background: 'var(--border-primary)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Available</span>
                            <strong style={{ color: 'var(--success)' }}>₹{(walletData?.availableBalance || 0).toLocaleString()}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>

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
                                                padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-secondary)',
                                                border: `1px solid ${bid.item?.currentPrice > bid.amount ? 'var(--danger)' : 'var(--success)'}30`
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>{bid.item?.title || 'Auction'}</p>

                                                        {/* Latest Bid (Auction's current price) - prominent */}
                                                        <div style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                            padding: '4px 10px', borderRadius: '8px', marginBottom: '8px',
                                                            background: bid.item?.currentPrice > bid.amount ? 'var(--danger-soft, rgba(239,68,68,0.1))' : 'var(--success-soft, rgba(34,197,94,0.1))',
                                                            color: bid.item?.currentPrice > bid.amount ? 'var(--danger)' : 'var(--success)',
                                                            fontSize: '0.82rem', fontWeight: 700,
                                                        }}>
                                                            <TrendingUp size={13} />
                                                            Latest Bid: ₹{bid.item?.currentPrice?.toLocaleString()}
                                                            {bid.item?.currentPrice > bid.amount && (
                                                                <span style={{ fontSize: '0.72rem', fontWeight: 600, opacity: 0.85 }}>(Outbid)</span>
                                                            )}
                                                            {bid.item?.currentPrice <= bid.amount && (
                                                                <span style={{ fontSize: '0.72rem', fontWeight: 600, opacity: 0.85 }}>(Winning)</span>
                                                            )}
                                                        </div>

                                                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                                                <Gavel size={12} /> My Bid: ₹{bid.amount?.toLocaleString()}
                                                            </p>
                                                            <p style={{ color: 'var(--warning)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                                                <Trophy size={12} /> Position: #{bid.position || '?'}
                                                            </p>
                                                        </div>

                                                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                            <p style={{ color: 'var(--warning)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <Lock size={12} /> Total Locked: ₹{(bid.totalLockedOnAuction || bid.lockedDeposit || 0).toLocaleString()}
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
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Link href={`/auctions/${bid.item?._id}`}
                                                    className="btn-primary"
                                                    style={{
                                                        padding: '6px 14px', fontSize: '0.75rem',
                                                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                                        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
                                                    }}>
                                                    💳 Pay Now
                                                </Link>
                                                <span className="badge badge-success">🏆 Won</span>
                                            </div>
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
                        <div className="dash-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
                            {/* Left Side forms wrapper */}
                            <div>
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

                                {/* Withdraw Card */}
                                <div className="card" style={{ padding: '24px', marginTop: '20px' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ArrowUpFromLine size={18} style={{ color: 'var(--accent)' }} />
                                        Withdraw Balance
                                    </h3>
                                    <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Amount (₹) *</label>
                                            <input type="number" className="input-field" placeholder="Min ₹100"
                                                value={withdrawForm.amount} onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} min="100" />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bank Name *</label>
                                            <input type="text" className="input-field" placeholder="e.g. HDFC Bank"
                                                value={withdrawForm.bankName} onChange={e => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Account Holder Name *</label>
                                            <input type="text" className="input-field" placeholder="Name on account"
                                                value={withdrawForm.accountName} onChange={e => setWithdrawForm({ ...withdrawForm, accountName: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Account Number *</label>
                                            <input type="text" className="input-field" placeholder="Account Number"
                                                value={withdrawForm.accountNumber} onChange={e => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>IFSC Code *</label>
                                            <input type="text" className="input-field" placeholder="IFSC Code"
                                                value={withdrawForm.ifscCode} onChange={e => setWithdrawForm({ ...withdrawForm, ifscCode: e.target.value })} />
                                        </div>
                                        <button type="submit" className="btn-secondary" disabled={withdrawLoading} style={{ width: '100%', marginTop: '6px' }}>
                                            {withdrawLoading ? <Loader2 size={16} className="animate-spin" /> : 'Request Withdrawal'}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Right side wrapper for tables */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                {/* Transaction History */}
                                <div className="card" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <History size={18} style={{ color: 'var(--accent)' }} />
                                            Transaction History
                                        </h3>
                                        <div style={{ position: 'relative' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                                <circle cx="11" cy="11" r="8"></circle>
                                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                            </svg>
                                            <input className="input-field" placeholder="Search transactions..."
                                                value={searchText} onChange={e => setSearchText(e.target.value)}
                                                style={{ paddingLeft: '32px', width: '200px', fontSize: '0.8rem', padding: '8px 10px 8px 32px' }} />
                                        </div>
                                    </div>
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
                                                {filteredTransactions.length === 0 ? (
                                                    <tr><td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found</td></tr>
                                                ) : filteredTransactions.map((tx: any) => (
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

                                {/* Withdrawal Requests History */}
                                <div className="card" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <ArrowUpFromLine size={18} style={{ color: 'var(--accent)' }} />
                                            Withdrawal Requests
                                        </h3>
                                    </div>
                                    <div className="table-wrap">
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                                    <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Date</th>
                                                    <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Amount</th>
                                                    <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Bank Details</th>
                                                    <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                                                    <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Notes</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {withdrawRequests.length === 0 ? (
                                                    <tr><td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>No withdrawal requests found</td></tr>
                                                ) : withdrawRequests.map((wr: any) => (
                                                    <tr key={wr._id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                                        <td style={{ padding: '8px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                            {formatDate(wr.createdAt)}
                                                        </td>
                                                        <td style={{ padding: '8px', fontWeight: 700 }}>
                                                            ₹{wr.amount?.toLocaleString()}
                                                        </td>
                                                        <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>
                                                            {wr.bankName}<br />
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>A/c: {wr.accountNumber}</span>
                                                        </td>
                                                        <td style={{ padding: '8px' }}>
                                                            <span className={`badge ${wr.status === 'pending' ? 'badge-warning' : wr.status === 'approved' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                                                                {wr.status.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                                            {wr.adminNotes || '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* === BIDS TAB === */}
                {activeTab === 'bids' && (
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Gavel size={18} style={{ color: 'var(--accent)' }} />
                                All My Bids
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Calendar size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                    <input type="date" className="input-field" value={dateFrom}
                                        onChange={e => setDateFrom(e.target.value)}
                                        style={{ width: '130px', fontSize: '0.78rem', padding: '6px 8px' }}
                                        title="From date" />
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>to</span>
                                    <input type="date" className="input-field" value={dateTo}
                                        onChange={e => setDateTo(e.target.value)}
                                        style={{ width: '130px', fontSize: '0.78rem', padding: '6px 8px' }}
                                        title="To date" />
                                    {(dateFrom || dateTo) && (
                                        <button onClick={() => { setDateFrom(''); setDateTo(''); }}
                                            style={{ background: 'var(--danger-soft)', color: 'var(--danger)', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                    <input className="input-field" placeholder="Search bids..."
                                        value={searchText} onChange={e => setSearchText(e.target.value)}
                                        style={{ paddingLeft: '34px', width: '200px', fontSize: '0.85rem' }} />
                                </div>
                            </div>
                        </div>
                        <div className="table-wrap">
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Auction</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>My Bid</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Latest Bid</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Locked Deposit</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Position</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Ends</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Date Placed</th>
                                        <th style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>View</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUniqueBids.length === 0 ? (
                                        <tr><td colSpan={9} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No bids match your search.
                                        </td></tr>
                                    ) : filteredUniqueBids.map((bid: any) => (
                                        <tr key={bid._id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                            <td style={{ padding: '10px', fontWeight: 600 }}>{bid.item?.title || '—'}</td>
                                            <td style={{ padding: '10px', fontWeight: 700 }}>₹{bid.amount?.toLocaleString()}</td>
                                            <td style={{ padding: '10px', fontWeight: 700, color: bid.item?.currentPrice > bid.amount ? 'var(--danger)' : 'var(--success)' }}>
                                                ₹{bid.item?.currentPrice?.toLocaleString() || '—'}
                                            </td>
                                            <td style={{ padding: '10px', color: 'var(--warning)', fontWeight: 600 }}>₹{(bid.totalLockedOnAuction || bid.lockedDeposit || 0).toLocaleString()}</td>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Eye size={18} style={{ color: 'var(--accent)' }} />
                                Live Auctions
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Calendar size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                    <input type="date" className="input-field" value={dateFrom}
                                        onChange={e => setDateFrom(e.target.value)}
                                        style={{ width: '130px', fontSize: '0.78rem', padding: '6px 8px' }}
                                        title="From date" />
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>to</span>
                                    <input type="date" className="input-field" value={dateTo}
                                        onChange={e => setDateTo(e.target.value)}
                                        style={{ width: '130px', fontSize: '0.78rem', padding: '6px 8px' }}
                                        title="To date" />
                                    {(dateFrom || dateTo) && (
                                        <button onClick={() => { setDateFrom(''); setDateTo(''); }}
                                            style={{ background: 'var(--danger-soft)', color: 'var(--danger)', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                    <input className="input-field" placeholder="Search live auctions..."
                                        value={searchText} onChange={e => setSearchText(e.target.value)}
                                        style={{ paddingLeft: '36px', width: '220px' }} />
                                </div>
                            </div>
                        </div>
                        {liveAuctions.length === 0 ? (
                            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                                <AlertCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                                <p style={{ color: 'var(--text-muted)' }}>No live auctions found.</p>
                            </div>
                        ) : (
                            <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                                {filteredLiveAuctions.map((item: any) => {
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
        </div>
    );
}
