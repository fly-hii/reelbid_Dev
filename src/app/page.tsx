'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Wallet, Trophy, Users, TrendingUp, Film, Bike, Shirt, Clock, Star, Sparkles, Heart, Loader2 } from 'lucide-react';

const CATEGORIES = [
  { name: 'Hero Shirts', icon: <Shirt style={{ width: 28, height: 28 }} />, count: 42, color: 'var(--accent)' },
  { name: 'Movie Dresses', icon: <Sparkles style={{ width: 28, height: 28 }} />, count: 35, color: '#ec4899' },
  { name: 'Iconic Bikes', icon: <Bike style={{ width: 28, height: 28 }} />, count: 18, color: '#f59e0b' },
  { name: 'Accessories', icon: <Star style={{ width: 28, height: 28 }} />, count: 27, color: '#22c55e' },
];

const VISUALS = [
  { emoji: '🔥', gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)', category: 'Featured' },
  { emoji: '🎬', gradient: 'linear-gradient(135deg, #2d1b3d, #44203d)', category: 'Cinematic' },
  { emoji: '⭐', gradient: 'linear-gradient(135deg, #1b2838, #1a3a4a)', category: 'Rare' },
  { emoji: '✨', gradient: 'linear-gradient(135deg, #3d1b2f, #2d1b3d)', category: 'Exclusive' },
];

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Create Account & Profile',
    desc: 'Sign up securely. Complete your profile by adding your official shipping address and mobile number so sellers know precisely where to ship your winnings.',
    icon: <Users style={{ width: 24, height: 24 }} />,
  },
  {
    step: '02',
    title: 'Fund Wallet Tiers',
    desc: 'Deposit funds to unlock your maximum bidding limit. Add ₹100 for bids up to ₹10K, ₹500 for up to ₹1 Lakh, or ₹1,000 to bid up to ₹10 Lakhs.',
    icon: <Wallet style={{ width: 24, height: 24 }} />,
  },
  {
    step: '03',
    title: 'Bid on Live Auctions',
    desc: 'Place your bids in real-time. Bidding in the last 10 minutes activates our Anti-Sniper tech, instantly extending the auction by 1 hour for fair play.',
    icon: <Zap style={{ width: 24, height: 24 }} />,
  },
  {
    step: '04',
    title: 'Win & Receive',
    desc: 'If yours is the highest bid when the clock runs out, you win! Your shipping details are sent to the verified seller for immediate dispatch.',
    icon: <Trophy style={{ width: 24, height: 24 }} />,
  },
];

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    fetch('/api/items')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Grab up to 4 active items that haven't ended yet
          const active = data.filter(i => i.status === 'Active' && new Date(i.endDate) > new Date());
          setFeaturedItems(active.slice(0, 4));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingBottom: '60px' }}>

      {/* ━━━━ HERO SECTION ━━━━ */}
      <section className="animate-fade-in" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: '500px', height: '500px', background: 'var(--gradient-hero-1)', filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '60%', left: '25%', transform: 'translate(-50%, -50%)', width: '350px', height: '350px', background: 'var(--gradient-hero-2)', filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr', gap: '40px', alignItems: 'center' }} className="hero-grid">
          {/* Left: Text Content */}
          <div style={{ maxWidth: '600px' }}>
            <div className="badge-accent" style={{ display: 'inline-flex', marginBottom: '20px', fontSize: '0.8rem', padding: '6px 16px' }}>
              <Film style={{ width: 14, height: 14 }} />
              Movie Hero Memorabilia — Live Auctions
            </div>

            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '20px' }}>
              Own the Exact{' '}
              <span style={{ background: 'linear-gradient(135deg, var(--accent), #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Shirts, Dresses & Bikes
              </span>{' '}
              from Your Favorite Movies
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '28px', maxWidth: '520px' }}>
              ReelBid brings you authenticated costumes and vehicles used in blockbuster films. Fund your wallet, unlock bidding tiers, and compete for cinema history.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <Link href="/auctions" className="btn-primary" style={{ textDecoration: 'none', padding: '14px 28px', fontSize: '0.95rem', borderRadius: '14px' }}>
                Browse Live Auctions
                <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
              <Link href="/auth/register" className="btn-secondary" style={{ textDecoration: 'none', padding: '14px 28px', fontSize: '0.95rem', borderRadius: '14px' }}>
                Register as Buyer
              </Link>
            </div>

            {/* Trust strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '32px', flexWrap: 'wrap' }}>
              {[
                { icon: <ShieldCheck style={{ width: 16, height: 16 }} />, text: 'Verified Authentic' },
                { icon: <Zap style={{ width: 16, height: 16 }} />, text: 'Real-Time Bids' },
                { icon: <Clock style={{ width: 16, height: 16 }} />, text: 'Anti-Sniper Tech' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--success)' }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Featured Card Showcase */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gridColumn: '1 / -1', minHeight: '200px' }}>
                <Loader2 style={{ width: 32, height: 32, color: 'var(--accent)' }} className="animate-spin" />
              </div>
            ) : featuredItems.length > 0 ? (
              featuredItems.map((item, i) => {
                const vis = VISUALS[i % VISUALS.length];
                const endingSoon = (new Date(item.endDate).getTime() - Date.now()) < 86400000; // Less than 24h

                return (
                  <Link href={`/auctions/${item._id}`} key={item._id} style={{ textDecoration: 'none' }}>
                    <div
                      className="card"
                      style={{
                        padding: '20px',
                        cursor: 'pointer',
                        transition: 'transform 0.25s, box-shadow 0.25s',
                        position: 'relative',
                        overflow: 'hidden',
                        height: '100%'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      {/* Emoji visual */}
                      <div style={{
                        width: '100%',
                        height: '80px',
                        borderRadius: '12px',
                        background: vis.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.4rem',
                        marginBottom: '14px',
                      }}>
                        {vis.emoji}
                      </div>

                      {/* Badge */}
                      {endingSoon && (
                        <div className="badge-danger" style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.65rem' }}>
                          <Clock style={{ width: 10, height: 10 }} />
                          Ending Soon
                        </div>
                      )}

                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                        {vis.category}
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ₹{item.currentPrice.toLocaleString()}
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: 'var(--bg-card)', borderRadius: '24px', border: '1px dashed var(--border-primary)' }}>
                <Film style={{ width: 32, height: 32, color: 'var(--text-muted)', margin: '0 auto 10px' }} />
                <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No live auctions right now.</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Check back soon for new memorabilia!</p>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @media (min-width: 900px) {
            .hero-grid { grid-template-columns: 1fr 1fr !important; }
          }
        `}</style>
      </section>

      {/* ━━━━ CATEGORY BROWSING ━━━━ */}
      <section className="animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Browse by Category
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Find exactly what you're looking for
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {CATEGORIES.map((cat, i) => (
            <Link href="/auctions" key={i} style={{ textDecoration: 'none' }}>
              <div
                className="card"
                style={{
                  padding: '24px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = cat.color; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
              >
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: `${cat.color}15`,
                  color: cat.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                }}>
                  {cat.icon}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {cat.name}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {cat.count} items
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ━━━━ STATS ROW ━━━━ */}
      <section className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', maxWidth: '700px', margin: '0 auto', width: '100%' }}>
        {[
          { icon: <Users style={{ width: 22, height: 22 }} />, value: '2,400+', label: 'Active Bidders' },
          { icon: <Film style={{ width: 22, height: 22 }} />, value: '120+', label: 'Movie Items' },
          { icon: <Trophy style={{ width: 22, height: 22 }} />, value: '850+', label: 'Auctions Won' },
          { icon: <TrendingUp style={{ width: 22, height: 22 }} />, value: '₹12M+', label: 'Total Value Bid' },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              textAlign: 'center',
              padding: '24px 16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: '18px',
            }}
          >
            <div style={{ color: 'var(--accent-text)', marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* ━━━━ HOW IT WORKS (BUYER PROCESS) ━━━━ */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
            The Buyer's Journey
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
            A transparent, step-by-step guide to securing verified cinematic history.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '32px', alignItems: 'center' }} className="interactive-steps-grid">
          {/* Left Navigation Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {PROCESS_STEPS.map((item, i) => {
              const isActive = activeStep === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '20px 24px', borderRadius: '16px',
                    background: isActive ? 'var(--bg-card)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isActive ? '0 12px 30px rgba(0,0,0,0.1)' : 'none',
                    outline: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: isActive ? 'var(--accent)' : 'var(--text-muted)', opacity: isActive ? 1 : 0.4, transition: 'all 0.3s' }}>
                    {item.step}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em', transition: 'all 0.3s' }}>
                    {item.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Information Display Content */}
          <div style={{
            position: 'relative',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: '24px',
            padding: '48px 40px',
            overflow: 'hidden',
            minHeight: '380px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
          }}>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: '250px', height: '250px',
              background: 'linear-gradient(135deg, var(--accent), #ec4899)',
              opacity: 0.05, filter: 'blur(50px)', borderRadius: '50%',
              zIndex: 0, pointerEvents: 'none'
            }} />

            <div style={{
              position: 'absolute', top: '24px', right: '32px',
              fontSize: '10rem', fontWeight: 900,
              color: 'var(--text-primary)', opacity: 0.03,
              lineHeight: 0.8, userSelect: 'none', zIndex: 0,
              letterSpacing: '-0.05em'
            }}>
              {PROCESS_STEPS[activeStep].step}
            </div>

            <div className="animate-slide-up" key={activeStep} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                backdropFilter: 'blur(10px)',
                color: 'var(--accent)',
              }}>
                {PROCESS_STEPS[activeStep].icon}
              </div>

              <h3 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                {PROCESS_STEPS[activeStep].title}
              </h3>

              <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '95%' }}>
                {PROCESS_STEPS[activeStep].desc}
              </p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/working-process" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            fontSize: '1rem', fontWeight: 700, color: 'var(--accent-text)',
            textDecoration: 'none', background: 'var(--accent-soft)',
            padding: '12px 24px', borderRadius: '12px', transition: 'background 0.2s'
          }}>
            Explore Full Platform Roles & Ecosystem <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .interactive-steps-grid {
               grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>

      {/* ━━━━ TRUST / FEATURES ━━━━ */}
      <section className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {[
            {
              icon: <ShieldCheck style={{ width: 24, height: 24 }} />,
              title: 'Certificate of Authenticity',
              desc: 'Every item comes with verified documentation proving it was worn or used in the actual movie production.',
              color: 'var(--success)',
              bgColor: 'var(--success-soft)',
            },
            {
              icon: <Clock style={{ width: 24, height: 24 }} />,
              title: 'Anti-Sniper Protection',
              desc: 'Last-minute bids auto-extend the auction by 1 hour. Top 10 bidders get instant email alerts.',
              color: 'var(--danger)',
              bgColor: 'var(--danger-soft)',
            },
            {
              icon: <Wallet style={{ width: 24, height: 24 }} />,
              title: 'Secure Wallet System',
              desc: 'Your wallet balance is locked during active bids. Fair play is enforced — no withdrawals during live bids.',
              color: 'var(--accent)',
              bgColor: 'var(--accent-soft)',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="card"
              style={{ padding: '28px 24px', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: feature.bgColor, color: feature.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━━ CTA BANNER ━━━━ */}
      <section
        className="animate-fade-in cta-banner"
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
          background: 'linear-gradient(135deg, var(--accent), #ec4899)',
          borderRadius: '24px',
          padding: '48px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '250px', height: '250px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '180px', height: '180px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%', filter: 'blur(40px)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎬</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
            Own a Piece of Cinema History
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', marginBottom: '28px', maxWidth: '480px', margin: '0 auto 28px' }}>
            From Rajinikanth's jackets to Pushpa's iconic red shirt — register now and start bidding on exclusive movie memorabilia.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/auth/register"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#fff', color: 'var(--accent)', fontWeight: 700,
                padding: '14px 32px', borderRadius: '14px', textDecoration: 'none', fontSize: '1rem',
              }}
            >
              Register Now
              <ArrowRight style={{ width: 18, height: 18 }} />
            </Link>
            <Link
              href="/auctions"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700,
                padding: '14px 32px', borderRadius: '14px', textDecoration: 'none', fontSize: '1rem',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              View Auctions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
