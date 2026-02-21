'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Zap, Wallet, Trophy, Users, ShoppingBag, ArrowRight } from 'lucide-react';

export default function WorkingProcess() {
    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '60px', paddingBottom: '80px', maxWidth: '1100px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', marginBottom: '20px', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}>
                    <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Home
                </Link>
                <div className="badge-accent" style={{ display: 'inline-flex', marginBottom: '16px', fontSize: '0.85rem', padding: '6px 16px' }}>
                    <ShieldCheck style={{ width: 14, height: 14 }} />
                    Platform Ecosystem
                </div>
                <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, lineHeight: 1.1, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '24px' }}>
                    How ReelBid Works
                    <br />
                    <span style={{ background: 'linear-gradient(135deg, var(--accent), #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        Role-by-Role Guide
                    </span>
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', lineHeight: 1.7 }}>
                    ReelBid operates on a secure, transparent, three-pillar ecosystem separating Buyers, Sellers, and Admins to guarantee authenticity and fair auctions.
                </p>
            </div>

            {/* Role 1: Buyer */}
            <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="role-grid">
                <div style={{
                    padding: '40px', background: 'var(--bg-card)', borderRadius: '24px',
                    border: '1px solid var(--border-primary)', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'rgba(59, 130, 246, 0.05)', filter: 'blur(50px)', borderRadius: '50%' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Wallet style={{ width: 32, height: 32 }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>The Buyer</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>Collect & Own Movie History</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div className="card" style={{ padding: '24px', background: 'var(--bg-input)' }}>
                            <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#3b82f6' }}>1.</span> Complete Profile
                            </h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                To bid on physical memorabilia, you must first complete your profile by providing your full shipping address, city, state, pin code, and authenticated mobile number.
                            </p>
                        </div>
                        <div className="card" style={{ padding: '24px', background: 'var(--bg-input)' }}>
                            <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#3b82f6' }}>2.</span> Wallet Tiers
                            </h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                To ensure bidding intent, you deposit a small wallet minimum to unlock high bids. E.g., a ₹100 deposit unlocks bidding power up to ₹10K. ₹1,000 unlocks massive ₹10 Lakh bids.
                            </p>
                        </div>
                        <div className="card" style={{ padding: '24px', background: 'var(--bg-input)' }}>
                            <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#3b82f6' }}>3.</span> Bid & Win
                            </h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                Compete via real-time web sockets. If someone bids in the final 10 minutes, our Anti-Sniper tech extends the auction. When you win, sellers ship directly to your profile address!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Role 2: Seller */}
            <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="role-grid">
                <div style={{
                    padding: '40px', background: 'var(--bg-card)', borderRadius: '24px',
                    border: '1px solid var(--border-primary)', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'rgba(245, 158, 11, 0.05)', filter: 'blur(50px)', borderRadius: '50%' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingBag style={{ width: 32, height: 32 }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>The Seller</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>Provide Authentic Movie Memorabilia</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div className="card" style={{ padding: '24px', background: 'var(--bg-input)' }}>
                            <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#f59e0b' }}>1.</span> Admin Verification
                            </h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                Normal users cannot sell items. You must contact administration and provide proof of authenticity to have your account manually upgraded to the exclusive Seller role.
                            </p>
                        </div>
                        <div className="card" style={{ padding: '24px', background: 'var(--bg-input)' }}>
                            <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#f59e0b' }}>2.</span> List Auctions
                            </h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                As a verified seller, you can create new item listings, set their starting base price, configure the closing date, and provide high-quality cinematic descriptions.
                            </p>
                        </div>
                        <div className="card" style={{ padding: '24px', background: 'var(--bg-input)' }}>
                            <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#f59e0b' }}>3.</span> Secure Dashboard
                            </h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                You cannot fraudulently bid on your own active listings. Once an auction beautifully ends, your seller dashboard instantly reveals the highest bidder's private phone number and address so you can ship the item!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Role 3: Admin */}
            <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="role-grid">
                <div style={{
                    padding: '40px', background: 'var(--bg-card)', borderRadius: '24px',
                    border: '1px solid var(--border-primary)', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'rgba(236, 72, 153, 0.05)', filter: 'blur(50px)', borderRadius: '50%' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck style={{ width: 32, height: 32 }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>The Admin</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>Oversee Platform Trust & Safety</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div className="card" style={{ padding: '24px', background: 'var(--bg-input)' }}>
                            <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#ec4899' }}>1.</span> User Management
                            </h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                The ultimate authority. Admins can view the entire database of onboarded buyers and sellers. They process manual requests to elevate trustworthy individuals to the "Seller" role.
                            </p>
                        </div>
                        <div className="card" style={{ padding: '24px', background: 'var(--bg-input)' }}>
                            <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#ec4899' }}>2.</span> Financial Oversight
                            </h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                Monitor the flow of money. Validate incoming wallet deposit requests, process withdrawal requests from users, and maintain the integrity of user Tier structures.
                            </p>
                        </div>
                        <div className="card" style={{ padding: '24px', background: 'var(--bg-input)' }}>
                            <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#ec4899' }}>3.</span> Global System Control
                            </h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                Able to forcefully close dispute items, review overall platform statistics from their master dashboard, and act as an arbitrator in the event of missing or counterfeit item reports.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                @media (min-width: 900px) {
                  .role-grid { display: block !important; }
                }
            `}</style>
        </div>
    );
}
