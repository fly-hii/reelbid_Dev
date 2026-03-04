'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Wallet, Trophy, Users, TrendingUp, Film, Bike, Shirt, Clock, Star, Sparkles, Heart, Loader2, ArrowUpRight, Gavel, Eye } from 'lucide-react';

const CATEGORIES = [
  { name: 'Hero Shirts', icon: <Shirt style={{ width: 28, height: 28 }} />, count: 42, color: '#8b5cf6', gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))' },
  { name: 'Movie Dresses', icon: <Sparkles style={{ width: 28, height: 28 }} />, count: 35, color: '#ec4899', gradient: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.05))' },
  { name: 'Iconic Bikes', icon: <Bike style={{ width: 28, height: 28 }} />, count: 18, color: '#f59e0b', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))' },
  { name: 'Accessories', icon: <Star style={{ width: 28, height: 28 }} />, count: 27, color: '#10b981', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))' },
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
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  },
  {
    step: '02',
    title: 'Fund Wallet Tiers',
    desc: 'Deposit funds to unlock your maximum bidding limit. Add ₹100 for bids up to ₹10K, ₹500 for up to ₹1 Lakh, or ₹1,000 to bid up to ₹10 Lakhs.',
    icon: <Wallet style={{ width: 24, height: 24 }} />,
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  },
  {
    step: '03',
    title: 'Bid on Live Auctions',
    desc: 'Place your bids in real-time. Bidding in the last 10 minutes activates our Anti-Sniper tech, instantly extending the auction by 1 hour for fair play.',
    icon: <Zap style={{ width: 24, height: 24 }} />,
    gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
  },
  {
    step: '04',
    title: 'Win & Receive',
    desc: 'If yours is the highest bid when the clock runs out, you win! Your shipping details are sent to the verified seller for immediate dispatch.',
    icon: <Trophy style={{ width: 24, height: 24 }} />,
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
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
          const active = data.filter(i => i.status === 'Active' && new Date(i.endDate) > new Date());
          active.sort((a, b) => (b.bidCount || 0) - (a.bidCount || 0));
          setFeaturedItems(active.slice(0, 4));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Auto-rotate steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % PROCESS_STEPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '100px', paddingBottom: '60px' }}>

      {/* ━━━━ HERO SECTION ━━━━ */}
      <section className="animate-fade-in" style={{ position: 'relative', overflow: 'hidden', paddingTop: '20px' }}>
        {/* Background mesh gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'var(--gradient-mesh)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* Animated glow orbs */}
        <div className="animate-float" style={{
          position: 'absolute', top: '20%', left: '60%',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none', filter: 'blur(60px)',
          zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', top: '70%', left: '15%',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none', filter: 'blur(60px)',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr', gap: '48px', alignItems: 'center' }} className="hero-grid">
          {/* Left: Text Content */}
          <div style={{ maxWidth: '640px' }}>
            <div className="badge-accent" style={{
              display: 'inline-flex', marginBottom: '24px', fontSize: '0.78rem',
              padding: '7px 18px', gap: '8px', fontWeight: 700,
              border: '1px solid rgba(139,92,246,0.15)',
            }}>
              <Film style={{ width: 14, height: 14 }} />
              Movie Hero Memorabilia — Live Auctions
            </div>

            <h1 style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 900,
              lineHeight: 1.06,
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
              marginBottom: '24px',
            }}>
              Own the Exact{' '}
              <span className="gradient-text">
                Shirts, Dresses & Bikes
              </span>{' '}
              from Your Favorite Movies
            </h1>

            <p style={{
              fontSize: '1.08rem', color: 'var(--text-secondary)',
              lineHeight: 1.75, marginBottom: '36px', maxWidth: '520px',
            }}>
              ReelBid brings you authenticated costumes and vehicles used in blockbuster films. Fund your wallet, unlock bidding tiers, and compete for cinema history.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '40px' }}>
              <Link href="/auctions" className="btn-primary" style={{
                textDecoration: 'none', padding: '15px 32px',
                fontSize: '0.95rem',
              }}>
                Browse Live Auctions
                <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
              <Link href="/auth/register" className="btn-secondary" style={{
                textDecoration: 'none', padding: '15px 32px',
                fontSize: '0.95rem',
              }}>
                Register as Buyer
              </Link>
            </div>

            {/* Trust strip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
              padding: '16px 20px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
            }}>
              {[
                { icon: <ShieldCheck style={{ width: 16, height: 16 }} />, text: 'Verified Authentic' },
                { icon: <Zap style={{ width: 16, height: 16 }} />, text: 'Real-Time Bids' },
                { icon: <Clock style={{ width: 16, height: 16 }} />, text: 'Anti-Sniper Tech' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)',
                }}>
                  <span style={{ color: 'var(--success)' }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Featured Card Showcase */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {loading ? (
              <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                gridColumn: '1 / -1', minHeight: '240px',
              }}>
                <Loader2 style={{ width: 36, height: 36, color: 'var(--accent)' }} className="animate-spin" />
              </div>
            ) : featuredItems.length > 0 ? (
              featuredItems.map((item, i) => {
                const vis = VISUALS[i % VISUALS.length];
                const endingSoon = (new Date(item.endDate).getTime() - Date.now()) < 86400000;

                return (
                  <Link href={`/auctions/${item._id}`} key={item._id} style={{ textDecoration: 'none' }}>
                    <div
                      className="card card-glow"
                      style={{
                        padding: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      {/* Visual area */}
                      <div style={{
                        width: '100%',
                        height: '90px',
                        borderRadius: '12px',
                        background: vis.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.6rem',
                        marginBottom: '16px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(135deg, transparent 40%, rgba(139,92,246,0.1))',
                        }} />
                        {vis.emoji}
                      </div>

                      {/* Badge */}
                      {endingSoon && (
                        <div className="badge-danger" style={{
                          position: 'absolute', top: '12px', right: '12px',
                          fontSize: '0.62rem', padding: '3px 8px',
                        }}>
                          <Clock style={{ width: 10, height: 10 }} />
                          Ending Soon
                        </div>
                      )}

                      <div style={{
                        fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-text)',
                        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px',
                      }}>
                        {vis.category}
                      </div>
                      <div style={{
                        fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)',
                        marginBottom: '10px', lineHeight: 1.3,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical' as any,
                        flex: 1,
                      }}>
                        {item.title}
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <div style={{
                          fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)',
                          letterSpacing: '-0.02em',
                        }}>
                          ₹{item.currentPrice.toLocaleString()}
                        </div>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '8px',
                          background: 'var(--accent-soft)', color: 'var(--accent-text)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <ArrowUpRight style={{ width: 14, height: 14 }} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div style={{
                gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px',
                background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--border-primary)',
              }}>
                <Film style={{ width: 36, height: 36, color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No live auctions right now.</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>Check back soon for new memorabilia!</p>
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
        <div className="section-header">
          <h2 className="section-title">
            Browse by Category
          </h2>
          <p className="section-subtitle">
            Find exactly what you're looking for
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {CATEGORIES.map((cat, i) => (
            <Link href="/auctions" key={i} style={{ textDecoration: 'none' }}>
              <div
                className="card card-glow"
                style={{
                  padding: '28px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = `${cat.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                }}
              >
                <div style={{
                  width: '60px', height: '60px', borderRadius: 'var(--radius-md)',
                  background: cat.gradient,
                  color: cat.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  transition: 'transform 0.3s',
                  border: `1px solid ${cat.color}20`,
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
      <section className="animate-fade-in" style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px', maxWidth: '700px', margin: '0 auto', width: '100%',
      }}>
        {[
          { icon: <Users style={{ width: 22, height: 22 }} />, value: '2,400+', label: 'Active Bidders', color: '#8b5cf6' },
          { icon: <Film style={{ width: 22, height: 22 }} />, value: '120+', label: 'Movie Items', color: '#ec4899' },
          { icon: <Trophy style={{ width: 22, height: 22 }} />, value: '850+', label: 'Auctions Won', color: '#f59e0b' },
          { icon: <TrendingUp style={{ width: 22, height: 22 }} />, value: '₹12M+', label: 'Total Value Bid', color: '#10b981' },
        ].map((stat, i) => (
          <div
            key={i}
            className="card"
            style={{
              textAlign: 'center',
              padding: '28px 16px',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: `${stat.color}12`,
              color: stat.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              {stat.icon}
            </div>
            <div style={{
              fontSize: '1.7rem', fontWeight: 900, color: 'var(--text-primary)',
              letterSpacing: '-0.03em', lineHeight: 1,
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: '0.78rem', color: 'var(--text-muted)',
              fontWeight: 500, marginTop: '6px',
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* ━━━━ HOW IT WORKS ━━━━ */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
        <div className="section-header">
          <h2 className="section-title">
            The Buyer's Journey
          </h2>
          <p className="section-subtitle">
            A transparent, step-by-step guide to securing verified cinematic history.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr',
          gap: '32px', alignItems: 'center',
        }} className="interactive-steps-grid">
          {/* Left Navigation Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {PROCESS_STEPS.map((item, i) => {
              const isActive = activeStep === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '18px 22px', borderRadius: 'var(--radius-md)',
                    background: isActive ? 'var(--bg-card)' : 'transparent',
                    border: `1.5px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isActive ? 'var(--shadow-card), var(--shadow-glow)' : 'none',
                    outline: 'none',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.background = 'var(--bg-card-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {/* Active indicator line */}
                  {isActive && (
                    <div style={{
                      position: 'absolute', left: 0, top: '20%', bottom: '20%',
                      width: '3px', borderRadius: '0 4px 4px 0',
                      background: 'var(--gradient-primary)',
                    }} />
                  )}

                  <div style={{
                    fontSize: '1.3rem', fontWeight: 900,
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    opacity: isActive ? 1 : 0.4, transition: 'all 0.3s',
                    fontFamily: 'monospace',
                  }}>
                    {item.step}
                  </div>
                  <div style={{
                    fontWeight: 800, fontSize: '1.05rem',
                    letterSpacing: '-0.01em', transition: 'all 0.3s',
                  }}>
                    {item.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Information Display */}
          <div className="card" style={{
            padding: '48px 40px',
            minHeight: '380px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
          }}>
            {/* Background decorations */}
            <div style={{
              position: 'absolute', top: 0, right: 0, width: '200px', height: '200px',
              background: PROCESS_STEPS[activeStep].gradient,
              opacity: 0.06, filter: 'blur(60px)', borderRadius: '50%',
              zIndex: 0, pointerEvents: 'none',
            }} />

            <div style={{
              position: 'absolute', top: '24px', right: '32px',
              fontSize: '9rem', fontWeight: 900,
              color: 'var(--text-primary)', opacity: 0.03,
              lineHeight: 0.8, userSelect: 'none', zIndex: 0,
              letterSpacing: '-0.05em', fontFamily: 'monospace',
            }}>
              {PROCESS_STEPS[activeStep].step}
            </div>

            <div className="animate-slide-up" key={activeStep} style={{
              position: 'relative', zIndex: 1,
              display: 'flex', flexDirection: 'column', gap: '24px',
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: 'var(--radius-md)',
                background: PROCESS_STEPS[activeStep].gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                color: '#fff',
              }}>
                {PROCESS_STEPS[activeStep].icon}
              </div>

              <h3 style={{
                fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)',
                letterSpacing: '-0.03em', margin: 0, lineHeight: 1.15,
              }}>
                {PROCESS_STEPS[activeStep].title}
              </h3>

              <p style={{
                fontSize: '1.1rem', color: 'var(--text-secondary)',
                lineHeight: 1.75, maxWidth: '95%',
              }}>
                {PROCESS_STEPS[activeStep].desc}
              </p>

              {/* Progress dots */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                {PROCESS_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    style={{
                      width: activeStep === i ? '32px' : '8px',
                      height: '8px',
                      borderRadius: '999px',
                      background: activeStep === i ? 'var(--accent)' : 'var(--border-primary)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link href="/working-process" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-text)',
            textDecoration: 'none', background: 'var(--accent-soft)',
            padding: '13px 28px', borderRadius: 'var(--radius-md)',
            transition: 'all 0.3s', border: '1px solid rgba(139,92,246,0.15)',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139,92,246,0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent-soft)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
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
        <div className="section-header">
          <h2 className="section-title">Why Choose ReelBid?</h2>
          <p className="section-subtitle">Built with trust, transparency, and fairness at the core.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {[
            {
              icon: <ShieldCheck style={{ width: 24, height: 24 }} />,
              title: 'Certificate of Authenticity',
              desc: 'Every item comes with verified documentation proving it was worn or used in the actual movie production.',
              color: 'var(--success)',
              bgColor: 'var(--success-soft)',
              gradient: 'linear-gradient(135deg, rgba(16,185,129,0.1), transparent)',
            },
            {
              icon: <Clock style={{ width: 24, height: 24 }} />,
              title: 'Anti-Sniper Protection',
              desc: 'Last-minute bids auto-extend the auction by 1 hour. Top 10 bidders get instant email alerts.',
              color: 'var(--danger)',
              bgColor: 'var(--danger-soft)',
              gradient: 'linear-gradient(135deg, rgba(239,68,68,0.1), transparent)',
            },
            {
              icon: <Wallet style={{ width: 24, height: 24 }} />,
              title: 'Secure Wallet System',
              desc: 'Your wallet balance is locked during active bids. Fair play is enforced — no withdrawals during live bids.',
              color: 'var(--accent)',
              bgColor: 'var(--accent-soft)',
              gradient: 'linear-gradient(135deg, rgba(139,92,246,0.1), transparent)',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="card"
              style={{
                padding: '32px 28px',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                background: `${feature.gradient}, var(--bg-card)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-floating)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }}
            >
              <div style={{
                width: '52px', height: '52px', borderRadius: 'var(--radius-md)',
                background: feature.bgColor, color: feature.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px',
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)',
                marginBottom: '10px',
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '0.88rem', color: 'var(--text-secondary)',
                lineHeight: 1.75,
              }}>
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
          borderRadius: 'var(--radius-xl)',
          padding: '56px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--gradient-primary)',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 8s ease infinite',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '280px', height: '280px', background: 'rgba(255,255,255,0.06)',
          borderRadius: '50%', filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', left: '-40px',
          width: '200px', height: '200px', background: 'rgba(255,255,255,0.04)',
          borderRadius: '50%', filter: 'blur(30px)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: '1.8rem',
          }}>
            🎬
          </div>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900,
            color: '#fff', marginBottom: '14px', letterSpacing: '-0.02em',
          }}>
            Own a Piece of Cinema History
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.85)', fontSize: '1rem',
            marginBottom: '32px', maxWidth: '480px', margin: '0 auto 32px',
            lineHeight: 1.7,
          }}>
            From Rajinikanth's jackets to Pushpa's iconic red shirt — register now and start bidding on exclusive movie memorabilia.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              href="/auth/register"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#fff', color: '#7c3aed', fontWeight: 700,
                padding: '15px 36px', borderRadius: 'var(--radius-md)',
                textDecoration: 'none', fontSize: '0.95rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
              }}
            >
              Register Now
              <ArrowRight style={{ width: 18, height: 18 }} />
            </Link>
            <Link
              href="/auctions"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 700,
                padding: '15px 36px', borderRadius: 'var(--radius-md)',
                textDecoration: 'none', fontSize: '0.95rem',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              View Auctions
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━━ FOOTER ━━━━ */}
      <footer style={{
        borderTop: '1px solid var(--border-primary)',
        padding: '40px 0 0',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: '14px',
          }}>
            R
          </div>
          <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)' }}>
            Reel<span className="gradient-text">Bid</span>
          </span>
        </div>
        <div style={{
          display: 'flex', gap: '24px', flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <Link href="/auctions" className="footer-link">Auctions</Link>
          <Link href="/leaderboard" className="footer-link">Leaderboard</Link>
          <Link href="/working-process" className="footer-link">How It Works</Link>
          <Link href="/auth/register" className="footer-link">Register</Link>
        </div>
        <p style={{
          color: 'var(--text-muted)', fontSize: '0.78rem',
          textAlign: 'center', paddingBottom: '8px',
        }}>
          © {new Date().getFullYear()} ReelBid. All rights reserved. Movie memorabilia auction platform.
        </p>
      </footer>
    </div>
  );
}
