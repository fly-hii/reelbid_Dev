'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { signIn, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Loader2, Coins, Clock, ShieldCheck, AlertCircle, ArrowLeft, Info, Trophy, Medal, Lock, Wallet, Percent, X, Mail, KeyRound, Send, CreditCard, Film } from 'lucide-react';
import { differenceInSeconds } from 'date-fns';
import Link from 'next/link';
import LoginLightbox from '@/components/LoginLightbox';

export default function AuctionDetails() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session, update: updateSession } = useSession();
    const [item, setItem] = useState<any>(null);
    const [bidAmount, setBidAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [bidding, setBidding] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, ended: false });
    const [topBidders, setTopBidders] = useState<any[]>([]);
    const [walletData, setWalletData] = useState<any>(null);
    const [depositPreview, setDepositPreview] = useState<{ required: number; alreadyLocked: number; additional: number } | null>(null);

    // ===== SECOND-CHANCE OFFER STATE =====
    const [secondChance, setSecondChance] = useState<any>(null);
    const [scAdjustment, setScAdjustment] = useState(0);
    const [scSubmitting, setScSubmitting] = useState(false);

    // ===== RAZORPAY PAYMENT STATE =====
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [shippingAddress, setShippingAddress] = useState({ fullName: '', phone: '', addressLine: '', city: '', state: '', pincode: '' });

    // ===== LOGIN LIGHTBOX STATE =====
    const [showLoginModal, setShowLoginModal] = useState(false);

    // ===== WALLET TOPUP LIGHTBOX STATE =====
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [topupAmount, setTopupAmount] = useState('');
    const [topupLoading, setTopupLoading] = useState(false);
    const [walletShortfall, setWalletShortfall] = useState(0);
    const [pendingBidAmount, setPendingBidAmount] = useState(0);
    const [viewerOpen, setViewerOpen] = useState(false);

    useEffect(() => {
        if (viewerOpen || showLoginModal || showWalletModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [viewerOpen, showLoginModal, showWalletModal]);

    useEffect(() => {
        let socket: Socket;
        socket = io({ path: '/socket.io' });

        socket.on('connect', () => {
            socket.emit('joinRoom', id);
        });

        socket.on('bidUpdated', (data) => {
            if (data.itemId === id) {
                setItem((prev: any) => {
                    if (!prev) return prev;
                    return { ...prev, currentPrice: data.newPrice, endDate: data.endDate, bidCount: data.bidCount || prev.bidCount };
                });
                toast.success(`New bid: ₹${data.newPrice.toLocaleString()}`, { icon: '🔥' });
                fetchTopBidders();
            }
        });

        socket.on('auctionCompleted', (data) => {
            if (data.itemId === id) {
                setItem((prev: any) => prev ? { ...prev, status: 'Completed' } : prev);
                toast.success('Auction has been completed!', { icon: '🏆' });
            }
        });

        return () => {
            socket.emit('leaveRoom', id);
            socket.disconnect();
        };
    }, [id]);

    const fetchTopBidders = () => {
        fetch(`/api/bids?itemId=${id}&limit=10`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setTopBidders(data); })
            .catch(() => { });
    };

    const fetchWallet = () => {
        if (session) {
            fetch('/api/wallet')
                .then(res => res.json())
                .then(data => setWalletData(data))
                .catch(() => { });
        }
    };

    useEffect(() => {
        fetch(`/api/items?id=${id}`)
            .then(res => res.json())
            .then(data => { setItem(data); setLoading(false); });
        fetchTopBidders();
        fetchWallet();
    }, [id, session]);

    // Fetch second-chance data when auction is completed
    useEffect(() => {
        if (item && session && (item.status === 'Completed' || timeLeft.ended)) {
            fetch(`/api/auctions/${id}/second-chance`)
                .then(res => res.ok ? res.json() : null)
                .then(data => { if (data) setSecondChance(data); })
                .catch(() => { });
        }
    }, [item?.status, timeLeft.ended, session]);

    const handleSecondChanceSubmit = async () => {
        if (!confirm(`Submit your offer of ₹${Math.round(secondChance.winningAmount * (1 + scAdjustment / 100)).toLocaleString()} to the seller?`)) return;
        setScSubmitting(true);
        try {
            const res = await fetch(`/api/auctions/${id}/second-chance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ percentageAdjustment: scAdjustment }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(data.message);
            // Refresh second-chance data
            const refreshRes = await fetch(`/api/auctions/${id}/second-chance`);
            if (refreshRes.ok) { setSecondChance(await refreshRes.json()); }
        } catch (err: any) {
            toast.error(err.message);
        }
        setScSubmitting(false);
    };

    useEffect(() => {
        if (!item?.endDate) return;
        const interval = setInterval(() => {
            const now = new Date();
            const end = new Date(item.endDate);
            const diff = differenceInSeconds(end, now);
            if (diff <= 0) {
                setTimeLeft({ h: 0, m: 0, s: 0, ended: true });
                clearInterval(interval);

                // Auto-trigger the refund/resolution process if it hasn't been completed yet
                if (item.status !== 'Completed') {
                    fetch('/api/auctions/complete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ itemId: id }),
                    }).then(async (res) => {
                        if (res.ok) {
                            // Refresh the item data to show winner / completed stats
                            const refreshed = await fetch(`/api/items?id=${id}`).then(r => r.json());
                            setItem(refreshed);
                            if (typeof window !== 'undefined') {
                                // Reload page to fetch updated wallet limits automatically
                                window.location.reload();
                            }
                        }
                    }).catch(err => console.error("Auto resolve failed:", err));
                }
            } else {
                setTimeLeft({
                    h: Math.floor(diff / 3600),
                    m: Math.floor((diff % 3600) / 60),
                    s: diff % 60,
                    ended: false,
                });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [item?.endDate]);

    // Security deposit preview calculation
    useEffect(() => {
        if (!item || !bidAmount) {
            setDepositPreview(null);
            return;
        }
        const amt = parseInt(bidAmount, 10);
        if (isNaN(amt) || amt <= 0) {
            setDepositPreview(null);
            return;
        }
        const secPct = item.securityPercentage || 5;
        const LIMIT = 80000;
        const STEP = 10000;

        // Find already locked by this user on this auction
        const userId = (session?.user as any)?.id;
        const myBidsOnThis = topBidders
            .filter((b: any) => b.user?._id === userId || b.user === userId)
            .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        let required = 0;
        if (myBidsOnThis.length === 0) {
            if (amt <= LIMIT) {
                required = Math.ceil((amt * secPct) / 100);
            } else {
                const baseDeposit = Math.ceil((LIMIT * secPct) / 100);
                const extraAmount = amt - LIMIT;
                const extraSteps = Math.floor(extraAmount / STEP);
                const extraDeposit = Math.ceil((extraSteps * STEP * secPct) / 100);
                required = baseDeposit + extraDeposit;
            }
        } else {
            const firstBidAmount = myBidsOnThis[0].amount;
            const initialRequiredDeposit = Math.ceil((firstBidAmount * secPct) / 100);

            let baseRequired = 0;
            if (firstBidAmount <= LIMIT) {
                const limitForDoubling = Math.min(amt, LIMIT);
                const ratio = limitForDoubling / firstBidAmount;
                const power = Math.max(0, Math.floor(Math.log2(ratio)));
                baseRequired = initialRequiredDeposit * Math.pow(2, power);
            } else {
                baseRequired = Math.ceil((LIMIT * secPct) / 100);
            }

            let extraDeposit = 0;
            if (amt > LIMIT) {
                const extraAmount = amt - LIMIT;
                const extraSteps = Math.floor(extraAmount / STEP);
                extraDeposit = Math.ceil((extraSteps * STEP * secPct) / 100);
            }

            required = baseRequired + extraDeposit;
        }

        const alreadyLocked = myBidsOnThis.reduce((sum: number, b: any) => sum + (b.lockedDeposit || 0), 0);
        const additional = Math.max(0, required - alreadyLocked);

        setDepositPreview({ required, alreadyLocked, additional });
    }, [bidAmount, item, topBidders, session]);

    // ===== WALLET TOPUP HANDLER =====
    const handleWalletTopup = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(topupAmount);
        if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
        setTopupLoading(true);
        try {
            const res = await fetch('/api/wallet', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: amt }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setWalletData((prev: any) => ({ ...prev, ...data }));
            toast.success(`₹${amt.toLocaleString()} added to wallet!`);
            setTopupAmount('');
            setShowWalletModal(false);
            fetchWallet();
        } catch (err: any) { toast.error(err.message); }
        setTopupLoading(false);
    };

    // ===== BID HANDLER =====
    const handleBid = async (e: React.FormEvent) => {
        e.preventDefault();
        // If not logged in, show login lightbox
        if (!session) {
            setShowLoginModal(true);
            return;
        }
        const amt = parseInt(bidAmount, 10);
        if (isNaN(amt) || amt <= item.currentPrice) {
            toast.error('Bid must be higher than current price.');
            return;
        }
        setBidding(true);
        try {
            const res = await fetch('/api/bids', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: id, amount: amt }),
            });
            const data = await res.json();
            if (!res.ok) {
                // Check if error is about insufficient wallet balance
                if (data.error && data.error.includes('Insufficient balance')) {
                    // Calculate the shortfall from the preview state
                    const available = walletData?.availableBalance || 0;
                    const additionalNeeded = depositPreview?.additional || 0;
                    setWalletShortfall(Math.max(0, additionalNeeded - available));
                    setPendingBidAmount(amt);
                    setShowWalletModal(true);
                } else {
                    toast.error(data.error || 'Bid failed');
                }
            } else {
                const msg = data.additionalLocked > 0
                    ? `Bid placed! ₹${data.additionalLocked.toLocaleString()} locked as deposit.`
                    : 'Bid placed successfully! 🎯';
                toast.success(msg);
                setBidAmount('');
                fetchTopBidders();
                fetchWallet();
            }
        } catch { toast.error('Network error.'); }
        setBidding(false);
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" />
        </div>
    );

    if (!item || item.error) return (
        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '24px', marginTop: '20px' }}>
            <AlertCircle style={{ width: 40, height: 40, color: 'var(--danger)', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Auction Not Found</h2>
            <Link href="/auctions" className="btn-secondary" style={{ marginTop: '20px', textDecoration: 'none', display: 'inline-flex' }}>
                <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Auctions
            </Link>
        </div>
    );

    const pad = (n: number) => String(n).padStart(2, '0');
    const rankEmojis = ['🥇', '🥈', '🥉'];
    const secPct = item.securityPercentage || 5;

    return (
        <>
            {/* FULLSCREEN IMAGE VIEWER */}
            {viewerOpen && item.images?.[0] && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out'
                }} onClick={(e) => { e.stopPropagation(); setViewerOpen(false); }}>
                    <img
                        src={item.images[0]}
                        alt={item.title}
                        style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        onClick={(e) => { e.stopPropagation(); setViewerOpen(false); }}
                        style={{ position: 'absolute', top: '30px', right: '40px', background: 'transparent', border: 'none', color: '#fff', fontSize: '2.5rem', cursor: 'pointer', opacity: 0.8 }}
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="animate-slide-up" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '80px' }}>

                {/* Back */}
                <Link href="/auctions" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}>
                    <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Auctions
                </Link>

                {/* Image Banner */}
                <div style={{
                    position: 'relative', borderRadius: '20px', overflow: 'hidden', aspectRatio: '16/7',
                    background: '#0a0a0a', border: '1px solid var(--border-primary)', cursor: 'zoom-in',
                }} onClick={() => setViewerOpen(true)}>
                    {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--gradient-hero-1), var(--gradient-hero-2))' }} />
                    )}



                    {/* Timer badge */}
                    <div
                        className={timeLeft.ended ? 'badge-danger' : 'badge-success'}
                        style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, backdropFilter: 'blur(8px)' }}
                    >
                        <Clock style={{ width: 16, height: 16 }} />
                        {timeLeft.ended ? 'Auction Ended' : `${pad(timeLeft.h)}:${pad(timeLeft.m)}:${pad(timeLeft.s)}`}
                    </div>

                    {/* Security Deposit Badge */}
                    <div style={{
                        position: 'absolute', top: '16px', left: '16px',
                        padding: '8px 16px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 700,
                        background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b',
                        backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                        <Lock style={{ width: 14, height: 14 }} />
                        {secPct}% Security Deposit
                    </div>
                </div>

                {/* Title + Description + Stats */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                            {item.title}
                        </h1>
                        {item.category && item.category !== 'General' && (
                            <span className="badge badge-accent">{item.category}</span>
                        )}
                        {item.status === 'Completed' && (
                            <span className="badge badge-success">✓ Completed</span>
                        )}
                    </div>
                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        {item.description}
                    </p>

                    {/* Quick stats */}
                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <Coins size={15} style={{ color: 'var(--accent)' }} />
                            Base Price: <strong style={{ color: 'var(--text-primary)' }}>₹{item.startingPrice?.toLocaleString()}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <Lock size={15} style={{ color: 'var(--warning)' }} />
                            Deposit: <strong style={{ color: 'var(--warning)' }}>{secPct}%</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <Trophy size={15} />
                            {item.bidCount || 0} bids
                        </div>
                    </div>
                </div>

                {/* Info Banners */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Security Deposit Info */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b',
                        padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(245, 158, 11, 0.15)',
                    }}>
                        <Lock style={{ width: 20, height: 20, flexShrink: 0 }} />
                        <p style={{ fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.5 }}>
                            <strong>Security Deposit:</strong> {secPct}% of your bid amount is locked from your wallet. If you win, it's adjusted into payment. If you lose, it's refunded. Deposit automatically increases when you raise your bid.
                        </p>
                    </div>

                    {/* Sniper Protection */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: 'var(--accent-soft)', color: 'var(--accent-text)',
                        padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--accent-soft)',
                    }}>
                        <ShieldCheck style={{ width: 20, height: 20, flexShrink: 0 }} />
                        <p style={{ fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.5 }}>
                            <strong>Sniper Protection:</strong> Bids in the final 10 minutes auto-extend the auction by 1 hour.
                        </p>
                    </div>
                </div>

                {/* ===== Two-Column Grid ===== */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="auction-bid-grid">

                    {/* LEFT — Top 10 Bidders */}
                    <div
                        className="card"
                        style={{
                            padding: '28px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            order: 2,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Trophy style={{ width: 20, height: 20, color: '#f59e0b' }} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Top 10 Bidders</h2>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Highest bids on this auction</p>
                            </div>
                        </div>

                        {topBidders.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {topBidders.map((bid: any, index: number) => {
                                    const isTop3 = index < 3;
                                    return (
                                        <div
                                            key={bid._id}
                                            style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                padding: isTop3 ? '14px 16px' : '10px 16px',
                                                borderRadius: '12px',
                                                background: index === 0 ? 'rgba(245,158,11,0.06)' : 'var(--bg-input)',
                                                border: `1px solid ${index === 0 ? 'rgba(245,158,11,0.25)' : 'var(--border-primary)'}`,
                                                transition: 'border-color 0.2s',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = index === 0 ? 'rgba(245,158,11,0.25)' : 'var(--border-primary)'; }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                                                <div style={{
                                                    width: isTop3 ? '36px' : '30px',
                                                    height: isTop3 ? '36px' : '30px',
                                                    borderRadius: isTop3 ? '10px' : '8px',
                                                    background: index === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : index === 1 ? 'linear-gradient(135deg, #d1d5db, #9ca3af)' : index === 2 ? 'linear-gradient(135deg, #d97706, #b45309)' : 'var(--bg-card-hover)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 900,
                                                    fontSize: isTop3 ? '1rem' : '0.75rem',
                                                    color: index === 2 ? '#fff' : index < 2 ? '#92400e' : 'var(--text-muted)',
                                                    flexShrink: 0,
                                                    boxShadow: isTop3 ? '0 2px 10px rgba(0,0,0,0.12)' : 'none',
                                                }}>
                                                    {isTop3 ? rankEmojis[index] : `#${index + 1}`}
                                                </div>

                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <div style={{
                                                        fontWeight: 700, fontSize: isTop3 ? '0.95rem' : '0.85rem',
                                                        color: index === 0 ? '#f59e0b' : 'var(--text-primary)',
                                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                        display: 'flex', alignItems: 'center', gap: '8px',
                                                    }}>
                                                        {bid.user?.name || 'Anonymous'}
                                                        {index === 0 && (
                                                            <span style={{
                                                                fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px',
                                                                borderRadius: '6px', background: 'rgba(245,158,11,0.15)',
                                                                color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.04em',
                                                            }}>
                                                                Leading
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                        {new Date(bid.createdAt).toLocaleString()} · Deposit: ₹{(bid.lockedDeposit || 0).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                                fontWeight: 800, fontSize: isTop3 ? '1.1rem' : '0.92rem',
                                                color: index === 0 ? '#f59e0b' : 'var(--text-primary)',
                                                letterSpacing: '-0.02em',
                                                whiteSpace: 'nowrap',
                                                marginLeft: '12px',
                                            }}>
                                                <Coins style={{ width: 15, height: 15, color: index === 0 ? '#f59e0b' : 'var(--accent-text)' }} />
                                                ₹{bid.amount.toLocaleString()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center', padding: '40px 20px',
                                background: 'var(--bg-input)', borderRadius: '14px',
                                border: '1px dashed var(--border-primary)',
                            }}>
                                <Trophy style={{ width: 36, height: 36, color: 'var(--text-muted)', margin: '0 auto 10px' }} />
                                <p style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                    No bids yet
                                </p>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    Be the first to bid on this item!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT — Bid Panel */}
                    <div
                        className="card"
                        style={{
                            padding: '28px',
                            position: 'sticky',
                            top: '80px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px',
                            alignSelf: 'start',
                            order: 1,
                        }}
                    >
                        {/* Current High Bid */}
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                                Current High Bid
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Coins style={{ width: 28, height: 28, color: 'var(--accent-text)' }} />
                                <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                                    ₹{item.currentPrice.toLocaleString()}
                                </span>
                            </div>
                            {item.highestBidder?.name && (
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                                    by <strong>{item.highestBidder.name}</strong>
                                </p>
                            )}
                        </div>

                        {/* Wallet Status */}
                        {walletData && session && (
                            <div style={{
                                padding: '12px 14px', borderRadius: '12px',
                                background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                                display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem',
                            }}>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Your Wallet</p>
                                    <p style={{ fontWeight: 700 }}>₹{walletData.balance?.toLocaleString()}</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Locked</p>
                                    <p style={{ fontWeight: 700, color: 'var(--warning)' }}>₹{(walletData.lockedBalance || 0).toLocaleString()}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Available</p>
                                    <p style={{ fontWeight: 700, color: 'var(--success)' }}>₹{(walletData.availableBalance || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        )}

                        <div style={{ height: '1px', background: 'var(--border-primary)' }} />

                        {(() => {
                            const currentUserId = (session?.user as any)?.id;
                            const isSeller = currentUserId && item.seller && (currentUserId === item.seller.toString() || currentUserId === item.seller?._id?.toString());

                            if (isSeller) {
                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{
                                            padding: '16px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.1)',
                                            color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)',
                                            display: 'flex', alignItems: 'flex-start', gap: '12px'
                                        }}>
                                            <Info style={{ width: 20, height: 20, flexShrink: 0, marginTop: '2px' }} />
                                            <div>
                                                <h4 style={{ margin: '0 0 4px', fontSize: '0.9rem', fontWeight: 700 }}>Your Listing</h4>
                                                <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>You are the seller of this item. Sellers cannot bid on their own auctions.</p>
                                            </div>
                                        </div>
                                        {item.highestBidder && (
                                            <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--bg-input)', border: '1px solid var(--border-primary)' }}>
                                                <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Highest Bidder Details</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: 'var(--text-muted)' }}>Name</span>
                                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.highestBidder.name}</span>
                                                    </div>
                                                    {item.highestBidder.email && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span style={{ color: 'var(--text-muted)' }}>Email</span>
                                                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.highestBidder.email}</span>
                                                        </div>
                                                    )}
                                                    {item.highestBidder.phone && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span style={{ color: 'var(--text-muted)' }}>Mobile</span>
                                                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>+91 {item.highestBidder.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            if (timeLeft.ended || item.status === 'Completed') {
                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{
                                            padding: '20px',
                                            borderRadius: '14px',
                                            background: 'var(--bg-input)',
                                            textAlign: 'center',
                                            border: '1px solid var(--border-primary)',
                                        }}>
                                            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                                {item.status === 'Completed' ? '🏆 Auction Completed' : '⏱ Auction Closed'}
                                            </span>
                                            {item.winner && (
                                                <p style={{ fontSize: '0.85rem', color: 'var(--success)', marginTop: '8px', fontWeight: 600 }}>
                                                    Winner: {item.winner.name || 'Declared'}
                                                </p>
                                            )}
                                        </div>

                                        {/* Winner Payment Section — Pay with Razorpay */}
                                        {session && item.winner && (session.user as any)?.id === (item.winner._id || item.winner) && item.winnerPaymentStatus !== 'paid' && (() => {
                                            const currentUserId = (session.user as any)?.id;
                                            const winnerId = item.winner?._id?.toString?.() || item.winner?.toString?.();
                                            const isWinner = currentUserId === winnerId;
                                            if (!isWinner) return null;

                                            const winningAmt = item.finalAmount || item.currentPrice;
                                            const myBidsOnThis = topBidders.filter((b: any) => (b.user?._id === currentUserId || b.user === currentUserId));
                                            const myDeposit = myBidsOnThis.reduce((s: number, b: any) => s + (b.lockedDeposit || 0), 0);
                                            const remaining = Math.max(0, winningAmt - myDeposit);

                                            const handlePayNow = async () => {
                                                setPaymentLoading(true);
                                                try {
                                                    const res = await fetch('/api/payment', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ auctionId: id, shippingAddress }),
                                                    });
                                                    const data = await res.json();
                                                    if (!res.ok) throw new Error(data.error);

                                                    const options = {
                                                        key: data.keyId,
                                                        amount: data.amount * 100,
                                                        currency: data.currency,
                                                        name: 'ReelBid',
                                                        description: `Payment for "${data.auctionTitle}"`,
                                                        order_id: data.orderId,
                                                        handler: async function (response: any) {
                                                            try {
                                                                const verifyRes = await fetch('/api/payment/verify', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({
                                                                        razorpay_order_id: response.razorpay_order_id,
                                                                        razorpay_payment_id: response.razorpay_payment_id,
                                                                        razorpay_signature: response.razorpay_signature,
                                                                        auctionId: id,
                                                                    }),
                                                                });
                                                                const verifyData = await verifyRes.json();
                                                                if (!verifyRes.ok) throw new Error(verifyData.error);
                                                                toast.success('Payment successful! 🎉');
                                                                // Refresh item data
                                                                fetch(`/api/items?id=${id}`).then(r => r.json()).then(d => setItem(d));
                                                            } catch (err: any) {
                                                                toast.error(err.message || 'Payment verification failed');
                                                            }
                                                        },
                                                        prefill: {
                                                            name: (session.user as any)?.name || '',
                                                            email: (session.user as any)?.email || '',
                                                        },
                                                        theme: { color: '#7c3aed' },
                                                        modal: {
                                                            ondismiss: () => setPaymentLoading(false),
                                                        },
                                                    };

                                                    const rzp = new (window as any).Razorpay(options);
                                                    rzp.on('payment.failed', function (response: any) {
                                                        toast.error(`Payment failed: ${response.error.description}`);
                                                    });
                                                    rzp.open();
                                                } catch (err: any) {
                                                    toast.error(err.message || 'Failed to initiate payment');
                                                }
                                                setPaymentLoading(false);
                                            };

                                            return (
                                                <div style={{
                                                    padding: '24px', borderRadius: '16px',
                                                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(16, 185, 129, 0.04))',
                                                    border: '1px solid rgba(34, 197, 94, 0.2)',
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                                        <span style={{ fontSize: '1.3rem' }}>💰</span>
                                                        <div>
                                                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--success)' }}>Complete Your Payment</h3>
                                                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>You&apos;re the winner! Pay the remaining amount to claim your item.</p>
                                                        </div>
                                                    </div>

                                                    <div style={{
                                                        padding: '14px', borderRadius: '12px', marginBottom: '16px',
                                                        background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                                                            <span style={{ color: 'var(--text-muted)' }}>Winning Amount</span>
                                                            <strong>₹{winningAmt.toLocaleString()}</strong>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                                                            <span style={{ color: 'var(--text-muted)' }}>Security Deposit (Paid)</span>
                                                            <span style={{ fontWeight: 700, color: 'var(--success)' }}>− ₹{myDeposit.toLocaleString()}</span>
                                                        </div>
                                                        <div style={{ height: '1px', background: 'var(--border-primary)', margin: '8px 0' }} />
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                                                            <strong>Remaining to Pay</strong>
                                                            <strong style={{ color: 'var(--accent)', fontSize: '1.3rem' }}>₹{remaining.toLocaleString()}</strong>
                                                        </div>
                                                    </div>

                                                    {/* Shipping Address Form */}
                                                    <div style={{
                                                        padding: '16px', borderRadius: '12px', marginBottom: '16px',
                                                        background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                            📦 Shipping Address
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                                <input
                                                                    type="text" className="input-field" placeholder="Full Name *"
                                                                    value={shippingAddress.fullName}
                                                                    onChange={e => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                                                                    style={{ fontSize: '0.85rem', padding: '10px 12px' }}
                                                                />
                                                                <input
                                                                    type="tel" className="input-field" placeholder="Phone Number *"
                                                                    value={shippingAddress.phone}
                                                                    onChange={e => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                                                                    style={{ fontSize: '0.85rem', padding: '10px 12px' }}
                                                                />
                                                            </div>
                                                            <input
                                                                type="text" className="input-field" placeholder="Address (House No, Street, Landmark) *"
                                                                value={shippingAddress.addressLine}
                                                                onChange={e => setShippingAddress(prev => ({ ...prev, addressLine: e.target.value }))}
                                                                style={{ fontSize: '0.85rem', padding: '10px 12px' }}
                                                            />
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                                                <input
                                                                    type="text" className="input-field" placeholder="City *"
                                                                    value={shippingAddress.city}
                                                                    onChange={e => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                                                                    style={{ fontSize: '0.85rem', padding: '10px 12px' }}
                                                                />
                                                                <input
                                                                    type="text" className="input-field" placeholder="State *"
                                                                    value={shippingAddress.state}
                                                                    onChange={e => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                                                                    style={{ fontSize: '0.85rem', padding: '10px 12px' }}
                                                                />
                                                                <input
                                                                    type="text" className="input-field" placeholder="Pincode *"
                                                                    value={shippingAddress.pincode}
                                                                    onChange={e => setShippingAddress(prev => ({ ...prev, pincode: e.target.value }))}
                                                                    style={{ fontSize: '0.85rem', padding: '10px 12px' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
                                                                toast.error('Please fill in all shipping address fields');
                                                                return;
                                                            }
                                                            handlePayNow();
                                                        }}
                                                        disabled={paymentLoading || remaining <= 0}
                                                        className="btn-primary"
                                                        style={{
                                                            width: '100%', padding: '16px', fontSize: '1rem',
                                                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                        }}
                                                    >
                                                        {paymentLoading ? <Loader2 size={20} className="animate-spin" /> : (
                                                            <>💳 Pay ₹{remaining.toLocaleString()} with Razorpay</>
                                                        )}
                                                    </button>

                                                    <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                        Secured by Razorpay • UPI, Cards, Netbanking supported
                                                    </p>
                                                </div>
                                            );
                                        })()}

                                        {/* Second-Chance Offer Section for Buyers */}
                                        {secondChance && secondChance.isOpen && !secondChance.isWinner && !secondChance.existingOffer && (
                                            <div style={{
                                                padding: '24px', borderRadius: '16px',
                                                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(236, 72, 153, 0.06))',
                                                border: '1px solid rgba(124, 58, 237, 0.2)',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                                    <span style={{ fontSize: '1.3rem' }}>🎯</span>
                                                    <div>
                                                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Second Chance!</h3>
                                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>The winner failed to pay — you can buy this item</p>
                                                    </div>
                                                </div>

                                                <div style={{
                                                    padding: '14px', borderRadius: '12px', marginBottom: '16px',
                                                    background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                                                        <span style={{ color: 'var(--text-muted)' }}>Winning Bid</span>
                                                        <strong>₹{secondChance.winningAmount?.toLocaleString()}</strong>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                                                        <span style={{ color: 'var(--text-muted)' }}>Your Adjustment</span>
                                                        <span style={{
                                                            fontWeight: 700,
                                                            color: scAdjustment > 0 ? 'var(--success)' : scAdjustment < 0 ? 'var(--danger)' : 'var(--text-primary)',
                                                        }}>{scAdjustment > 0 ? '+' : ''}{scAdjustment}%</span>
                                                    </div>
                                                    <div style={{ height: '1px', background: 'var(--border-primary)', margin: '8px 0' }} />
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                                                        <strong>Your Offer</strong>
                                                        <strong style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>
                                                            ₹{Math.round(secondChance.winningAmount * (1 + scAdjustment / 100)).toLocaleString()}
                                                        </strong>
                                                    </div>
                                                </div>

                                                {/* ±5% buttons */}
                                                <div style={{ marginBottom: '12px' }}>
                                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>Select price adjustment (±5%)</p>
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                                        {[-5, -3, -2, -1, 0, 1, 2, 3, 5].map(val => (
                                                            <button key={val} type="button" onClick={() => setScAdjustment(val)}
                                                                style={{
                                                                    padding: '6px 12px', borderRadius: '8px',
                                                                    border: scAdjustment === val ? '2px solid var(--accent)' : '1px solid var(--border-primary)',
                                                                    background: scAdjustment === val ? 'var(--accent-soft)' : 'var(--bg-card)',
                                                                    color: scAdjustment === val ? 'var(--accent-text)' : 'var(--text-secondary)',
                                                                    fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                                                                    transition: 'all 0.2s',
                                                                }}>
                                                                {val > 0 ? `+${val}%` : val === 0 ? '0%' : `${val}%`}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                                                    <span>Min: ₹{secondChance.minPrice?.toLocaleString()}</span>
                                                    <span>Max: ₹{secondChance.maxPrice?.toLocaleString()}</span>
                                                </div>

                                                <button
                                                    onClick={handleSecondChanceSubmit}
                                                    disabled={scSubmitting}
                                                    className="btn-primary"
                                                    style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}
                                                >
                                                    {scSubmitting ? <Loader2 size={18} className="animate-spin" /> : (
                                                        <>✨ Submit Offer to Seller</>
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {/* Already submitted offer */}
                                        {secondChance?.existingOffer && (
                                            <div style={{
                                                padding: '18px', borderRadius: '14px',
                                                background: 'var(--accent-soft)', border: '1px solid var(--accent-soft)',
                                                textAlign: 'center',
                                            }}>
                                                <p style={{ fontWeight: 700, color: 'var(--accent-text)', marginBottom: '6px' }}>✅ Offer Submitted</p>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--accent-text)', opacity: 0.8 }}>
                                                    Your offer of <strong>₹{secondChance.existingOffer.offerPrice?.toLocaleString()}</strong> has been sent to the seller.
                                                    Status: <strong>{secondChance.existingOffer.status}</strong>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <form onSubmit={handleBid} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                            Your Bid Amount
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '1rem' }}>
                                                ₹
                                            </div>
                                            <input
                                                type="number"
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                                required
                                                min={item.currentPrice + 1}
                                                className="input-field focus-ring"
                                                style={{ paddingLeft: '36px', fontSize: '1.1rem', fontWeight: 700, padding: '16px 16px 16px 36px' }}
                                                placeholder={(item.currentPrice + 100).toString()}
                                            />
                                        </div>
                                    </div>

                                    {/* Deposit Preview */}
                                    {depositPreview && (
                                        <div style={{
                                            padding: '12px 14px', borderRadius: '12px',
                                            background: 'rgba(245, 158, 11, 0.06)',
                                            border: '1px solid rgba(245, 158, 11, 0.15)',
                                            fontSize: '0.82rem',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 700, color: '#f59e0b' }}>
                                                <Lock size={14} />
                                                Security Deposit Breakdown
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                                    <span>Required ({secPct}% of ₹{parseInt(bidAmount).toLocaleString()})</span>
                                                    <span style={{ fontWeight: 700 }}>₹{depositPreview.required.toLocaleString()}</span>
                                                </div>
                                                {depositPreview.alreadyLocked > 0 && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                                        <span>Already locked</span>
                                                        <span style={{ fontWeight: 600 }}>- ₹{depositPreview.alreadyLocked.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                <div style={{ height: '1px', background: 'var(--border-primary)', margin: '4px 0' }} />
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                                    <span style={{ color: depositPreview.additional > 0 ? 'var(--warning)' : 'var(--success)' }}>
                                                        {depositPreview.additional > 0 ? 'Additional to lock' : 'No additional needed'}
                                                    </span>
                                                    <span style={{ color: depositPreview.additional > 0 ? 'var(--warning)' : 'var(--success)' }}>
                                                        ₹{depositPreview.additional.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button type="submit" disabled={bidding} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1rem' }}>
                                        {bidding ? <Loader2 style={{ width: 20, height: 20 }} className="animate-spin" /> : 'Place Bid'}
                                    </button>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        <Info style={{ width: 14, height: 14 }} />
                                        <span>{secPct}% of your bid is locked as security deposit from your wallet.</span>
                                    </div>
                                </form>
                            );
                        })()}
                    </div>
                </div>

                <style>{`
        @media (min-width: 768px) {
          .auction-bid-grid {
            grid-template-columns: 1fr 380px !important;
          }
          .auction-bid-grid > *:first-child {
            order: 1 !important;
          }
          .auction-bid-grid > *:last-child {
            order: 2 !important;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
            </div>

            {/* ========== LOGIN LIGHTBOX MODAL ========== */}
            <LoginLightbox
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSuccess={() => {
                    fetchWallet();
                }}
            />

            {/* ========== WALLET TOPUP LIGHTBOX MODAL ========== */}
            {showWalletModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px', animation: 'fadeIn 0.2s ease',
                }} onClick={() => setShowWalletModal(false)}>
                    <div style={{
                        width: '100%', maxWidth: '420px',
                        maxHeight: 'calc(100vh - 40px)', overflowY: 'auto',
                        background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
                        borderRadius: '24px', padding: '36px 28px',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
                        position: 'relative',
                        animation: 'slideUp 0.3s ease',
                    }} onClick={e => e.stopPropagation()}>
                        {/* Top accent */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />

                        {/* Close */}
                        <button onClick={() => setShowWalletModal(false)} style={{
                            position: 'absolute', top: '14px', right: '14px',
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                            borderRadius: '10px', width: '32px', height: '32px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--text-muted)',
                        }}>
                            <X size={16} />
                        </button>

                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '14px',
                                background: 'rgba(245, 158, 11, 0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#f59e0b', margin: '0 auto 14px',
                            }}>
                                <Wallet size={24} />
                            </div>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Insufficient Balance</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                                Add funds to place your bid of ₹{pendingBidAmount.toLocaleString()}
                            </p>
                        </div>

                        {/* Balance Summary */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '18px',
                        }}>
                            <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--bg-secondary)', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Wallet</p>
                                <p style={{ fontSize: '1rem', fontWeight: 800 }}>₹{(walletData?.balance || 0).toLocaleString()}</p>
                            </div>
                            <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--bg-secondary)', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Locked</p>
                                <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--warning)' }}>₹{(walletData?.lockedBalance || 0).toLocaleString()}</p>
                            </div>
                            <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--bg-secondary)', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Available</p>
                                <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--success)' }}>₹{(walletData?.availableBalance || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Shortfall Info */}
                        <div style={{
                            padding: '12px 14px', borderRadius: '12px', marginBottom: '16px',
                            background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)',
                            display: 'flex', alignItems: 'center', gap: '10px',
                        }}>
                            <AlertCircle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                            <p style={{ fontSize: '0.82rem', color: 'var(--danger)', fontWeight: 600 }}>
                                You need at least ₹{walletShortfall.toLocaleString()} more for the security deposit
                            </p>
                        </div>

                        {/* Top-up Form */}
                        <form onSubmit={handleWalletTopup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input type="number" className="input-field" placeholder="Enter amount (₹)"
                                value={topupAmount} onChange={e => setTopupAmount(e.target.value)} min="1" required />

                            {/* Preset amounts */}
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {[walletShortfall, 500, 1000, 5000, 10000].filter((v, i, a) => v > 0 && a.indexOf(v) === i).map(amt => (
                                    <button key={amt} type="button" onClick={() => setTopupAmount(String(amt))}
                                        style={{
                                            padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700,
                                            border: topupAmount === String(amt) ? '2px solid var(--accent)' : '1px solid var(--border-primary)',
                                            background: topupAmount === String(amt) ? 'var(--accent-soft)' : 'var(--bg-secondary)',
                                            color: topupAmount === String(amt) ? 'var(--accent-text)' : 'var(--text-secondary)',
                                            cursor: 'pointer', transition: 'all 0.2s',
                                        }}>
                                        {amt === walletShortfall ? `₹${amt.toLocaleString()} (min)` : `₹${amt.toLocaleString()}`}
                                    </button>
                                ))}
                            </div>

                            <button type="submit" disabled={topupLoading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '0.92rem' }}>
                                {topupLoading ? <Loader2 size={18} className="animate-spin" /> : <><CreditCard size={16} /> Add ₹{topupAmount ? parseInt(topupAmount).toLocaleString() : '0'} to Wallet</>}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            After adding funds, try placing your bid again
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
