'use client';

import React, { useEffect, useState } from 'react';
import { Star, MapPin, Users, Search, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function FansListPage() {
    const [associations, setAssociations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        fetch('/api/fan-associations')
            .then(r => r.json())
            .then(data => {
                setAssociations((data.associations || []).filter((a: any) => a.isActive));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filtered = associations.filter(a =>
        !searchText ||
        a.heroName?.toLowerCase().includes(searchText.toLowerCase()) ||
        a.areaName?.toLowerCase().includes(searchText.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'var(--warning-soft)', color: 'var(--warning)',
                    padding: '6px 16px', borderRadius: '999px',
                    fontSize: '0.75rem', fontWeight: 700, marginBottom: '14px',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                    <Star size={12} fill="currentColor" /> Fan Associations
                </div>
                <h1 style={{
                    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                    fontWeight: 900, letterSpacing: '-0.03em',
                    lineHeight: 1.15, marginBottom: '12px',
                }}>
                    Movie Hero <span className="gradient-text">Fan Clubs</span>
                </h1>
                <p style={{
                    color: 'var(--text-muted)', fontSize: '1rem',
                    maxWidth: '500px', margin: '0 auto',
                }}>
                    Discover fan associations of your favorite Telugu movie heroes across different regions.
                </p>
            </div>

            {/* Search */}
            <div className="animate-slide-up" style={{ position: 'relative', maxWidth: '400px', margin: '0 auto 32px' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input-field" placeholder="Search by hero or area..."
                    value={searchText} onChange={e => setSearchText(e.target.value)}
                    style={{ paddingLeft: '44px', textAlign: 'center' }} />
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Star size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        {searchText ? 'No fan associations found matching your search.' : 'No fan associations available yet.'}
                    </p>
                </div>
            ) : (
                <div className="stagger-children" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px',
                }}>
                    {filtered.map((assoc: any) => {
                        const themeColor = assoc.themeColor || '#8b5cf6';
                        return (
                            <Link href={`/fans/${assoc.slug}`} key={assoc._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="card card-glow" style={{
                                    overflow: 'hidden', cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                                    {/* Mini Banner */}
                                    <div style={{
                                        height: '90px',
                                        background: assoc.bannerImage
                                            ? `url(${assoc.bannerImage}) center/cover`
                                            : `linear-gradient(135deg, ${themeColor}, ${themeColor}88)`,
                                        position: 'relative',
                                    }}>
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.5) 100%)',
                                        }} />
                                        {assoc.heroImage && (
                                            <img src={assoc.heroImage} alt={assoc.heroName}
                                                style={{
                                                    width: '52px', height: '52px', borderRadius: '50%',
                                                    objectFit: 'cover', border: '3px solid var(--bg-card)',
                                                    position: 'absolute', bottom: '-26px', left: '16px',
                                                    boxShadow: `0 4px 16px ${themeColor}30`,
                                                }} />
                                        )}
                                    </div>
                                    <div style={{ padding: '32px 16px 16px' }}>
                                        <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '4px' }}>
                                            {assoc.heroName} Fans
                                        </h3>
                                        <p style={{
                                            fontSize: '0.78rem', color: 'var(--text-muted)',
                                            display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px',
                                        }}>
                                            <MapPin size={12} /> {assoc.areaName}
                                        </p>
                                        {assoc.description && (
                                            <p style={{
                                                fontSize: '0.75rem', color: 'var(--text-secondary)',
                                                lineHeight: 1.5, marginBottom: '10px',
                                            }}>
                                                {assoc.description.slice(0, 80)}{assoc.description.length > 80 ? '...' : ''}
                                            </p>
                                        )}
                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            borderTop: '1px solid var(--border-primary)', paddingTop: '10px',
                                        }}>
                                            <span style={{
                                                fontSize: '0.72rem', color: 'var(--text-muted)',
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                            }}>
                                                <Users size={12} /> {assoc.president?.name || 'President'}
                                            </span>
                                            <span style={{
                                                fontSize: '0.72rem', color: themeColor, fontWeight: 700,
                                                display: 'flex', alignItems: 'center', gap: '2px',
                                            }}>
                                                View <ChevronRight size={12} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
