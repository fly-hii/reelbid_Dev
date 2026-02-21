'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Loader2, Coins, Clock, ShieldCheck, AlertCircle, ArrowLeft, Info, Trophy, Medal } from 'lucide-react';
import { differenceInSeconds } from 'date-fns';
import Link from 'next/link';

export default function AuctionDetails() {
    const { id } = useParams();
    const { data: session } = useSession();
    const [item, setItem] = useState<any>(null);
    const [bidAmount, setBidAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [bidding, setBidding] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, ended: false });
    const [topBidders, setTopBidders] = useState<any[]>([]);

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
                    return { ...prev, currentPrice: data.newPrice, endDate: data.endDate };
                });
                toast.success(`New bid: ₹${data.newPrice.toLocaleString()}`, { icon: '🔥' });
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

    useEffect(() => {
        fetch(`/api/items?id=${id}`)
            .then(res => res.json())
            .then(data => { setItem(data); setLoading(false); });
        fetchTopBidders();
    }, [id]);

    useEffect(() => {
        if (!item?.endDate) return;
        const interval = setInterval(() => {
            const now = new Date();
            const end = new Date(item.endDate);
            const diff = differenceInSeconds(end, now);
            if (diff <= 0) {
                setTimeLeft({ h: 0, m: 0, s: 0, ended: true });
                clearInterval(interval);
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

    const handleBid = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) { toast.error('Sign in to place bids.'); return; }
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
            if (!res.ok) toast.error(data.error || 'Bid failed');
            else { toast.success('Bid placed successfully! 🎯'); setBidAmount(''); fetchTopBidders(); }
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

    return (
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
                background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--gradient-hero-1), var(--gradient-hero-2))' }} />

                {/* Timer badge */}
                <div
                    className={timeLeft.ended ? 'badge-danger' : 'badge-success'}
                    style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, backdropFilter: 'blur(8px)' }}
                >
                    <Clock style={{ width: 16, height: 16 }} />
                    {timeLeft.ended ? 'Auction Ended' : `${pad(timeLeft.h)}:${pad(timeLeft.m)}:${pad(timeLeft.s)}`}
                </div>
            </div>

            {/* Title + Description */}
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
                    {item.title}
                </h1>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {item.description}
                </p>
            </div>

            {/* Sniper info */}
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

            {/* ===== Two-Column Grid: Left = Top 10 Bidders, Right = Bid Panel ===== */}
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
                                            {/* Rank badge */}
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

                                            {/* Name + timestamp */}
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
                                                    {new Date(bid.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Amount */}
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

                {/* RIGHT — Current Bid + Bid Panel (or Winner Info for Seller) */}
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

                    <div style={{ height: '1px', background: 'var(--border-primary)' }} />

                    {(() => {
                        const currentUserId = (session?.user as any)?.id;
                        const isSeller = currentUserId && item.seller && currentUserId === item.seller.toString();

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
                                                {item.highestBidder.address && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '4px' }}>
                                                        <span style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Shipping Address</span>
                                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.4' }}>
                                                            {item.highestBidder.address}<br />
                                                            {item.highestBidder.city}, {item.highestBidder.state} - {item.highestBidder.pincode}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        if (timeLeft.ended) {
                            return (
                                <div style={{
                                    padding: '20px',
                                    borderRadius: '14px',
                                    background: 'var(--bg-input)',
                                    textAlign: 'center',
                                    border: '1px solid var(--border-primary)',
                                }}>
                                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                        Auction Closed
                                    </span>
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
                                <button type="submit" disabled={bidding} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1rem' }}>
                                    {bidding ? <Loader2 style={{ width: 20, height: 20 }} className="animate-spin" /> : 'Place Bid'}
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    <Info style={{ width: 14, height: 14 }} />
                                    <span>Your wallet tier limits the maximum bid you can place.</span>
                                </div>
                            </form>
                        );
                    })()}
                </div>
            </div>

            <style>{`
        @media (min-width: 768px) {
          .auction-bid-grid {
            grid-template-columns: 1fr 360px !important;
          }
          .auction-bid-grid > *:first-child {
            order: 1 !important;
          }
          .auction-bid-grid > *:last-child {
            order: 2 !important;
          }
        }
      `}</style>
        </div>
    );
}
