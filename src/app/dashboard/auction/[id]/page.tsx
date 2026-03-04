'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Loader2, Trophy, Award, Medal, Crown,
    Mail, Bell, Send, DollarSign, Users, Package,
    Clock, CheckCircle, XCircle, AlertTriangle,
    Eye, ChevronDown, ChevronUp, Percent, Phone,
    MapPin, User, Coins, Shield, Star, Sparkles, Megaphone,
    Banknote, CreditCard, Building
} from 'lucide-react';

export default function SellerAuctionDetail() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [notifying, setNotifying] = useState(false);
    const [sendingNotification, setSendingNotification] = useState(false);
    const [expandedBidder, setExpandedBidder] = useState<number | null>(null);
    const [markingPaid, setMarkingPaid] = useState(false);
    const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }
        if (status === 'authenticated') {
            fetchData();
        }
    }, [status]);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/seller/auction/${id}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            setData(json);
        } catch (err: any) {
            toast.error(err.message);
        }
        setLoading(false);
    };

    const handleSendReminder = async () => {
        if (!confirm('Send a payment reminder email to the winner?')) return;
        setNotifying(true);
        try {
            const res = await fetch(`/api/seller/auction/${id}/notify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'payment_reminder' }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            toast.success(json.message);
            fetchData();
        } catch (err: any) {
            toast.error(err.message);
        }
        setNotifying(false);
    };

    const handleMarkAsPaid = async (method: 'cash' | 'online' | 'bank_transfer') => {
        setMarkingPaid(true);
        try {
            const res = await fetch(`/api/seller/auction/${id}/payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            toast.success(json.message);
            setShowPaymentConfirm(false);
            fetchData();
        } catch (err: any) {
            toast.error(err.message);
        }
        setMarkingPaid(false);
    };

    const handleNotifyRunnerUps = async () => {
        if (!confirm('Notify the top 4 runner-up bidders that they can submit a second-chance offer? Each buyer will choose their own ±5% price from the winning bid amount.')) return;
        setSendingNotification(true);
        try {
            const res = await fetch(`/api/seller/auction/${id}/offer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            toast.success(json.message);
            fetchData();
        } catch (err: any) {
            toast.error(err.message);
        }
        setSendingNotification(false);
    };

    if (loading || status === 'loading') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <AlertTriangle size={40} style={{ color: 'var(--danger)', margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Auction Not Found</h2>
                <Link href="/dashboard" className="btn-secondary" style={{ marginTop: '20px', textDecoration: 'none', display: 'inline-flex' }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
            </div>
        );
    }

    const { auction, topBidders, remainingAmount } = data;
    const rankIcons = [
        { icon: <Crown size={22} />, color: '#fbbf24', bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)', label: '1st' },
        { icon: <Medal size={20} />, color: '#d1d5db', bg: 'linear-gradient(135deg, #d1d5db, #9ca3af)', label: '2nd' },
        { icon: <Medal size={20} />, color: '#d97706', bg: 'linear-gradient(135deg, #d97706, #b45309)', label: '3rd' },
        { icon: <Star size={18} />, color: '#7c3aed', bg: 'linear-gradient(135deg, #7c3aed, #6d28d9)', label: '4th' },
        { icon: <Star size={18} />, color: '#ec4899', bg: 'linear-gradient(135deg, #ec4899, #db2777)', label: '5th' },
    ];

    const formatDate = (d: string) => {
        const date = new Date(d);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const winningAmount = auction.finalAmount || auction.currentPrice;
    const pendingOffers = auction.secondChanceOffers?.filter((o: any) => o.status === 'pending') || [];

    return (
        <>
            <div className="animate-slide-up" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>

                {/* Back Navigation */}
                <Link href="/dashboard" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600,
                    textDecoration: 'none', transition: 'color 0.2s',
                }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>

                {/* Auction Header Card */}
                <div className="card" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                        background: auction.status === 'Completed' ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'linear-gradient(90deg, #7c3aed, #ec4899)',
                    }} />

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        {auction.images?.[0] && (
                            <div style={{
                                width: '120px', height: '120px', borderRadius: '16px',
                                overflow: 'hidden', flexShrink: 0, background: '#0a0a0a',
                                border: '1px solid var(--border-primary)',
                            }}>
                                <img src={auction.images[0]} alt={auction.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                        )}

                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{auction.title}</h1>
                                <span className={`badge ${auction.status === 'Completed' ? 'badge-success' : 'badge-danger'}`}>
                                    {auction.status === 'Completed' ? '✓ Completed' : auction.status}
                                </span>
                            </div>

                            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '14px', maxWidth: '500px' }}>
                                {auction.description}
                            </p>

                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <DollarSign size={15} style={{ color: 'var(--accent)' }} />
                                    <span style={{ color: 'var(--text-muted)' }}>Base:</span>
                                    <strong>₹{auction.startingPrice?.toLocaleString()}</strong>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Coins size={15} style={{ color: 'var(--success)' }} />
                                    <span style={{ color: 'var(--text-muted)' }}>Final:</span>
                                    <strong style={{ color: 'var(--success)' }}>
                                        ₹{winningAmount?.toLocaleString()}
                                    </strong>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Users size={15} />
                                    <span style={{ color: 'var(--text-muted)' }}>
                                        {auction.bidCount || 0} bids
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={15} />
                                    <span style={{ color: 'var(--text-muted)' }}>
                                        Ended: {formatDate(auction.endDate)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top 5 Bidders Section */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: 'rgba(245, 158, 11, 0.12)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Trophy size={22} style={{ color: '#f59e0b' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Top 5 Bidders</h2>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                                Manage post-auction payments and second-chance offers
                            </p>
                        </div>
                    </div>

                    {topBidders.length === 0 ? (
                        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                            <Users size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                            <p style={{ color: 'var(--text-muted)' }}>No bidders found for this auction.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {topBidders.map((bidder: any, index: number) => {
                                const rankStyle = rankIcons[index] || rankIcons[4];
                                const isExpanded = expandedBidder === index;
                                const isWinner = bidder.isWinner;

                                return (
                                    <div key={bidder.user._id} className="card" style={{
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                        border: isWinner ? '1px solid rgba(34, 197, 94, 0.3)' : undefined,
                                    }}>
                                        {/* Winner banner */}
                                        {isWinner && (
                                            <div style={{
                                                background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
                                                padding: '8px 20px',
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                fontSize: '0.78rem', fontWeight: 700, color: 'var(--success)',
                                                borderBottom: '1px solid rgba(34, 197, 94, 0.15)',
                                            }}>
                                                <Award size={14} />
                                                AUCTION WINNER
                                                {auction.winnerPaymentStatus === 'paid' ? (
                                                    <span style={{
                                                        marginLeft: 'auto', padding: '2px 10px',
                                                        borderRadius: '6px', background: 'var(--success-soft)',
                                                        color: 'var(--success)', fontSize: '0.7rem',
                                                    }}>
                                                        ✓ PAID
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        marginLeft: 'auto', padding: '2px 10px',
                                                        borderRadius: '6px', background: 'var(--warning-soft)',
                                                        color: 'var(--warning)', fontSize: '0.7rem',
                                                    }}>
                                                        ⏳ PAYMENT PENDING
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Main row */}
                                        <div
                                            style={{
                                                padding: '16px 20px',
                                                display: 'flex', alignItems: 'center', gap: '14px',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s',
                                            }}
                                            onClick={() => setExpandedBidder(isExpanded ? null : index)}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            {/* Rank badge */}
                                            <div style={{
                                                width: '44px', height: '44px', borderRadius: '12px',
                                                background: rankStyle.bg, display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                color: index === 2 ? '#fff' : (index < 2 ? '#92400e' : '#fff'),
                                                flexShrink: 0,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            }}>
                                                {rankStyle.icon}
                                            </div>

                                            {/* Name + bid info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontWeight: 700, fontSize: '1rem',
                                                    display: 'flex', alignItems: 'center', gap: '8px',
                                                    color: isWinner ? 'var(--success)' : 'var(--text-primary)',
                                                }}>
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {bidder.user.name || 'Anonymous'}
                                                    </span>
                                                    {isWinner && <Award size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />}
                                                </div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    {bidder.bidCount} bid{bidder.bidCount !== 1 ? 's' : ''} · Last: {formatDate(bidder.latestBid)}
                                                </div>
                                            </div>

                                            {/* Bid amount */}
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                fontWeight: 800, fontSize: '1.15rem',
                                                color: isWinner ? 'var(--success)' : 'var(--text-primary)',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                <Coins size={16} style={{ color: isWinner ? 'var(--success)' : 'var(--accent-text)' }} />
                                                ₹{bidder.highestBid.toLocaleString()}
                                            </div>

                                            {/* Expand arrow */}
                                            <div style={{ flexShrink: 0, color: 'var(--text-muted)' }}>
                                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </div>
                                        </div>

                                        {/* Expanded section */}
                                        {isExpanded && (
                                            <div style={{
                                                padding: '0 20px 20px',
                                                animation: 'fadeIn 0.3s ease',
                                            }}>
                                                <div style={{ height: '1px', background: 'var(--border-primary)', marginBottom: '16px' }} />

                                                {/* User details grid */}
                                                <div style={{
                                                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                    gap: '12px', marginBottom: '16px',
                                                }}>
                                                    <div style={{
                                                        padding: '14px', borderRadius: '12px',
                                                        background: 'var(--bg-input)', border: '1px solid var(--border-primary)',
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                                                            <User size={12} /> CONTACT INFO
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <Mail size={13} style={{ color: 'var(--accent)' }} />
                                                                <span>{bidder.user.email || 'N/A'}</span>
                                                            </div>
                                                            {bidder.user.phone && (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <Phone size={13} style={{ color: 'var(--success)' }} />
                                                                    <span>+91 {bidder.user.phone}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div style={{
                                                        padding: '14px', borderRadius: '12px',
                                                        background: 'var(--bg-input)', border: '1px solid var(--border-primary)',
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                                                            <MapPin size={12} /> ADDRESS
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                                            {bidder.user.address ? (
                                                                <>
                                                                    {bidder.user.address}<br />
                                                                    {bidder.user.city && `${bidder.user.city}, `}
                                                                    {bidder.user.state && `${bidder.user.state} `}
                                                                    {bidder.user.pincode}
                                                                </>
                                                            ) : (
                                                                <span style={{ color: 'var(--text-muted)' }}>Not provided</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div style={{
                                                        padding: '14px', borderRadius: '12px',
                                                        background: 'var(--bg-input)', border: '1px solid var(--border-primary)',
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                                                            <Shield size={12} /> BID DETAILS
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span style={{ color: 'var(--text-muted)' }}>Highest Bid</span>
                                                                <strong>₹{bidder.highestBid.toLocaleString()}</strong>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span style={{ color: 'var(--text-muted)' }}>Deposit Locked</span>
                                                                <span style={{ color: 'var(--warning)' }}>₹{bidder.lockedDeposit.toLocaleString()}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                                                                <span className={`badge ${bidder.status === 'won' ? 'badge-success' : bidder.status === 'refunded' ? 'badge-accent' : 'badge-danger'}`}
                                                                    style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                                                                    {bidder.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action: Send payment reminder (winner only) */}
                                                {isWinner && auction.winnerPaymentStatus !== 'paid' && (
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                        <button
                                                            className="btn-primary"
                                                            onClick={(e) => { e.stopPropagation(); handleSendReminder(); }}
                                                            disabled={notifying}
                                                            style={{
                                                                padding: '10px 20px', fontSize: '0.85rem',
                                                                background: 'var(--warning)',
                                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                            }}
                                                        >
                                                            {notifying ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
                                                            Send Payment Reminder
                                                        </button>
                                                        {auction.lastPaymentReminder && (
                                                            <div style={{
                                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                                fontSize: '0.78rem', color: 'var(--text-muted)',
                                                                padding: '0 12px',
                                                            }}>
                                                                <Clock size={12} />
                                                                Last: {formatDate(auction.lastPaymentReminder)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Remaining amount for winner */}
                                                {isWinner && auction.winnerPaymentStatus !== 'paid' && (
                                                    <div style={{
                                                        marginTop: '14px', padding: '16px', borderRadius: '12px',
                                                        background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)',
                                                    }}>
                                                        <div style={{
                                                            display: 'flex', alignItems: 'center', gap: '8px',
                                                            fontSize: '0.82rem', color: 'var(--warning)', fontWeight: 700,
                                                            marginBottom: '10px',
                                                        }}>
                                                            <AlertTriangle size={14} />
                                                            Remaining Payment Required
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem', marginBottom: '16px' }}>
                                                            <div>
                                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Winning Amount</p>
                                                                <p style={{ fontWeight: 700 }}>₹{bidder.highestBid.toLocaleString()}</p>
                                                            </div>
                                                            <div>
                                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Deposit Paid</p>
                                                                <p style={{ fontWeight: 700, color: 'var(--success)' }}>₹{bidder.lockedDeposit.toLocaleString()}</p>
                                                            </div>
                                                            <div>
                                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Remaining</p>
                                                                <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--warning)' }}>
                                                                    ₹{Math.max(0, bidder.highestBid - bidder.lockedDeposit).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Mark as Paid Section */}
                                                        <div style={{
                                                            borderTop: '1px solid rgba(245, 158, 11, 0.15)', paddingTop: '14px',
                                                        }}>
                                                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px' }}>
                                                                Mark payment as completed:
                                                            </p>
                                                            {!showPaymentConfirm ? (
                                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                                    <button
                                                                        className="btn-primary"
                                                                        onClick={(e) => { e.stopPropagation(); setShowPaymentConfirm(true); }}
                                                                        style={{
                                                                            padding: '10px 20px', fontSize: '0.85rem',
                                                                            background: 'var(--success)',
                                                                            display: 'flex', alignItems: 'center', gap: '6px',
                                                                        }}
                                                                    >
                                                                        <CheckCircle size={14} />
                                                                        Mark as Paid
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div style={{
                                                                    padding: '16px', borderRadius: '12px',
                                                                    background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
                                                                }}>
                                                                    <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                                                                        Select payment method:
                                                                    </p>
                                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                                        <button
                                                                            className="btn-primary"
                                                                            onClick={(e) => { e.stopPropagation(); handleMarkAsPaid('cash'); }}
                                                                            disabled={markingPaid}
                                                                            style={{
                                                                                padding: '12px 18px', fontSize: '0.85rem',
                                                                                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                                                flex: '1', justifyContent: 'center', minWidth: '120px',
                                                                            }}
                                                                        >
                                                                            {markingPaid ? <Loader2 size={16} className="animate-spin" /> : <Banknote size={16} />}
                                                                            Cash
                                                                        </button>
                                                                        <button
                                                                            className="btn-primary"
                                                                            onClick={(e) => { e.stopPropagation(); handleMarkAsPaid('bank_transfer'); }}
                                                                            disabled={markingPaid}
                                                                            style={{
                                                                                padding: '12px 18px', fontSize: '0.85rem',
                                                                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                                                flex: '1', justifyContent: 'center', minWidth: '120px',
                                                                            }}
                                                                        >
                                                                            {markingPaid ? <Loader2 size={16} className="animate-spin" /> : <Building size={16} />}
                                                                            Bank Transfer
                                                                        </button>
                                                                        <button
                                                                            className="btn-primary"
                                                                            onClick={(e) => { e.stopPropagation(); handleMarkAsPaid('online'); }}
                                                                            disabled={markingPaid}
                                                                            style={{
                                                                                padding: '12px 18px', fontSize: '0.85rem',
                                                                                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                                                flex: '1', justifyContent: 'center', minWidth: '120px',
                                                                            }}
                                                                        >
                                                                            {markingPaid ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                                                                            Online
                                                                        </button>
                                                                    </div>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setShowPaymentConfirm(false); }}
                                                                        style={{
                                                                            marginTop: '10px', width: '100%',
                                                                            padding: '8px', borderRadius: '8px',
                                                                            background: 'transparent', border: '1px solid var(--border-primary)',
                                                                            color: 'var(--text-muted)', fontSize: '0.8rem',
                                                                            cursor: 'pointer', transition: 'all 0.2s',
                                                                        }}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Payment completed badge */}
                                                {isWinner && auction.winnerPaymentStatus === 'paid' && (
                                                    <div style={{
                                                        marginTop: '14px', padding: '16px', borderRadius: '12px',
                                                        background: 'rgba(34, 197, 94, 0.06)', border: '1px solid rgba(34, 197, 94, 0.2)',
                                                        display: 'flex', alignItems: 'center', gap: '12px',
                                                    }}>
                                                        <div style={{
                                                            width: '40px', height: '40px', borderRadius: '12px',
                                                            background: 'rgba(34, 197, 94, 0.15)', display: 'flex',
                                                            alignItems: 'center', justifyContent: 'center',
                                                        }}>
                                                            <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                                                        </div>
                                                        <div>
                                                            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--success)', marginBottom: '2px' }}>
                                                                Payment Completed
                                                            </p>
                                                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                                ₹{bidder.highestBid.toLocaleString()} received via {auction.paymentMethod || 'cash'}
                                                                {auction.paymentCompletedAt && ` · ${formatDate(auction.paymentCompletedAt)}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Buyer's Shipping Address */}
                {auction.shippingAddress && auction.shippingAddress.fullName && (
                    <div className="card" style={{ padding: '24px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: 'rgba(34, 197, 94, 0.12)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Package size={22} style={{ color: 'var(--success)' }} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Buyer&apos;s Shipping Address</h3>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                                    Delivery address provided by the winner
                                </p>
                            </div>
                        </div>

                        <div style={{
                            padding: '18px', borderRadius: '14px',
                            background: 'var(--bg-input)', border: '1px solid var(--border-primary)',
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <User size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                    <div>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Full Name</p>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{auction.shippingAddress.fullName}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Phone size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                                    <div>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Phone</p>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>+91 {auction.shippingAddress.phone}</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ height: '1px', background: 'var(--border-primary)', margin: '12px 0' }} />
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <MapPin size={14} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Delivery Address</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.5 }}>
                                        {auction.shippingAddress.addressLine}<br />
                                        {auction.shippingAddress.city}, {auction.shippingAddress.state} — {auction.shippingAddress.pincode}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Second-Chance Notification Section */}
                {auction.winnerPaymentStatus !== 'paid' && (
                    <div className="card" style={{ padding: '24px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: 'rgba(124, 58, 237, 0.12)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Megaphone size={22} style={{ color: '#7c3aed' }} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Second-Chance Offers</h3>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                                    If the winner fails to pay, notify other bidders
                                </p>
                            </div>
                        </div>

                        {auction.secondChanceStatus === 'open' ? (
                            <div>
                                <div style={{
                                    padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
                                    background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', gap: '8px',
                                    fontSize: '0.82rem', color: 'var(--accent-text)',
                                }}>
                                    <CheckCircle size={14} />
                                    <span>
                                        Notifications sent to runner-up bidders
                                        {auction.secondChanceNotifiedAt && ` on ${formatDate(auction.secondChanceNotifiedAt)}`}
                                    </span>
                                </div>

                                {/* Show buyer offers received */}
                                {pendingOffers.length > 0 ? (
                                    <div>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Send size={14} style={{ color: 'var(--accent)' }} />
                                            Buyer Offers Received ({pendingOffers.length})
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {pendingOffers.map((offer: any, i: number) => (
                                                <div key={i} style={{
                                                    padding: '14px 16px', borderRadius: '12px',
                                                    background: 'var(--bg-input)', border: '1px solid var(--border-primary)',
                                                    display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                                                }}>
                                                    <div style={{ flex: 1, minWidth: '150px' }}>
                                                        <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{offer.userName}</p>
                                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{offer.userEmail}</p>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Offer Price</p>
                                                        <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)' }}>
                                                            ₹{offer.offerPrice?.toLocaleString()}
                                                        </p>
                                                        <p style={{ fontSize: '0.7rem', color: offer.percentageAdjustment >= 0 ? 'var(--success)' : 'var(--warning)' }}>
                                                            {offer.percentageAdjustment > 0 ? '+' : ''}{offer.percentageAdjustment}% of winning bid
                                                        </p>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem', background: 'var(--success)' }}>
                                                            Accept
                                                        </button>
                                                        <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.78rem' }}>
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        Waiting for buyers to submit their offers...
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.6 }}>
                                    This will email the top 4 runner-up bidders that the item is available again.
                                    Each buyer can log in and choose a price within <strong>±5%</strong> of the winning bid
                                    (₹{Math.round(winningAmount * 0.95).toLocaleString()} — ₹{Math.round(winningAmount * 1.05).toLocaleString()}).
                                    Their offer will be sent to you for approval.
                                </p>
                                <button
                                    className="btn-primary"
                                    onClick={handleNotifyRunnerUps}
                                    disabled={sendingNotification}
                                    style={{
                                        padding: '12px 24px', fontSize: '0.9rem',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                    }}
                                >
                                    {sendingNotification ? <Loader2 size={16} className="animate-spin" /> : <Megaphone size={16} />}
                                    Notify Runner-Up Bidders
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* How it Works Banner */}
                <div style={{
                    padding: '18px 20px', borderRadius: '14px',
                    background: 'var(--accent-soft)', border: '1px solid var(--accent-soft)',
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    fontSize: '0.85rem', color: 'var(--accent-text)',
                }}>
                    <Sparkles size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <strong>How Second-Chance Offers Work:</strong>
                        <p style={{ margin: '6px 0 0', opacity: 0.9, lineHeight: 1.6 }}>
                            1. If the winner fails to pay, click &quot;Notify Runner-Up Bidders&quot; above.<br />
                            2. The top 4 bidders receive an email notification.<br />
                            3. Each buyer logs in and chooses a price within ±5% of the winning bid (₹{winningAmount?.toLocaleString()}).<br />
                            4. You receive their offers here and can accept or reject them.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
