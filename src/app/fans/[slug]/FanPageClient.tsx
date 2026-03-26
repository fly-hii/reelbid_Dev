'use client';

import React, { useState } from 'react';
import { Star, MapPin, Users, Phone, Award, Crown, Heart, Mail, ChevronRight } from 'lucide-react';

interface FanPageClientProps {
    association: any;
    members: any[];
}

export default function FanPageClient({ association, members }: FanPageClientProps) {
    const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
    const themeColor = association.themeColor || '#8b5cf6';

    // Group members by designation for better display
    const leaderDesignations = ['Vice President', 'Secretary', 'General Secretary', 'Joint Secretary', 'Treasurer'];
    const leaders = members.filter(m => leaderDesignations.includes(m.designation));
    const otherMembers = members.filter(m => !leaderDesignations.includes(m.designation));

    return (
        <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '60px' }}>

            {/* Hero Banner */}
            <div className="animate-fade-in" style={{
                position: 'relative',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                marginBottom: '32px',
                boxShadow: `0 20px 60px ${themeColor}25, var(--shadow-floating)`,
            }}>
                {/* Banner Background */}
                <div style={{
                    height: '280px',
                    background: association.bannerImage
                        ? `url(${association.bannerImage}) center/cover no-repeat`
                        : `linear-gradient(135deg, ${themeColor}, ${themeColor}cc, ${themeColor}88)`,
                    position: 'relative',
                }}>
                    {/* Gradient Overlay */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: `linear-gradient(180deg, transparent 20%, rgba(0,0,0,0.7) 100%)`,
                    }} />

                    {/* Decorative Elements */}
                    <div style={{
                        position: 'absolute', top: '20px', right: '20px',
                        display: 'flex', gap: '6px',
                    }}>
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={themeColor} color={themeColor}
                                style={{ opacity: 0.6 + i * 0.1, animation: `float ${3 + i * 0.5}s ease-in-out infinite` }} />
                        ))}
                    </div>

                    {/* Hero Info on Banner */}
                    <div style={{
                        position: 'absolute', bottom: '0', left: '0', right: '0',
                        padding: '32px',
                        display: 'flex', alignItems: 'flex-end', gap: '24px',
                    }}>
                        {/* Hero Image */}
                        {association.heroImage ? (
                            <img src={association.heroImage} alt={association.heroName}
                                style={{
                                    width: '110px', height: '110px', borderRadius: '50%',
                                    objectFit: 'cover', border: `4px solid ${themeColor}`,
                                    boxShadow: `0 8px 32px ${themeColor}40`,
                                    flexShrink: 0,
                                }} />
                        ) : (
                            <div style={{
                                width: '110px', height: '110px', borderRadius: '50%',
                                background: `linear-gradient(135deg, ${themeColor}, ${themeColor}88)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '2.5rem', fontWeight: 900, color: '#fff',
                                border: `4px solid ${themeColor}`,
                                boxShadow: `0 8px 32px ${themeColor}40`,
                                flexShrink: 0,
                            }}>{association.heroName?.[0]}</div>
                        )}

                        <div style={{ flex: 1, paddingBottom: '4px' }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                background: `${themeColor}33`, backdropFilter: 'blur(10px)',
                                padding: '4px 14px', borderRadius: '999px',
                                fontSize: '0.72rem', fontWeight: 700, color: '#fff',
                                marginBottom: '8px', border: `1px solid ${themeColor}55`,
                            }}>
                                <Star size={11} fill="#fff" /> OFFICIAL FAN ASSOCIATION
                            </div>
                            <h1 style={{
                                fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                                fontWeight: 900, color: '#fff',
                                lineHeight: 1.15, letterSpacing: '-0.02em',
                                textShadow: '0 2px 12px rgba(0,0,0,0.4)',
                            }}>
                                {association.heroName} Fans Association
                            </h1>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '16px',
                                marginTop: '8px', flexWrap: 'wrap',
                            }}>
                                <span style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', fontWeight: 600,
                                }}>
                                    <MapPin size={15} /> {association.areaName}
                                </span>
                                <span style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem',
                                }}>
                                    <Users size={14} /> {members.length} Members
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            {association.description && (
                <div className="card animate-slide-up" style={{
                    padding: '24px 28px', marginBottom: '24px',
                    borderLeft: `4px solid ${themeColor}`,
                }}>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>
                        {association.description}
                    </p>
                </div>
            )}

            {/* President Card */}
            {association.president && (
                <div className="animate-slide-up" style={{
                    marginBottom: '32px', animationDelay: '0.1s',
                }}>
                    <h2 style={{
                        fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px',
                        display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        <Crown size={20} style={{ color: themeColor }} />
                        President
                    </h2>
                    <div className="card card-glow" style={{
                        padding: '24px', display: 'flex', alignItems: 'center', gap: '20px',
                        background: `linear-gradient(135deg, var(--bg-card), ${themeColor}08)`,
                        borderColor: `${themeColor}25`,
                    }}>
                        <div style={{
                            width: '70px', height: '70px', borderRadius: '50%',
                            background: `linear-gradient(135deg, ${themeColor}, ${themeColor}88)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.8rem', fontWeight: 900, color: '#fff',
                            boxShadow: `0 8px 24px ${themeColor}30`,
                            flexShrink: 0,
                        }}>{association.president.name?.[0]?.toUpperCase()}</div>
                        <div>
                            <p style={{ fontWeight: 800, fontSize: '1.15rem' }}>{association.president.name}</p>
                            <p style={{ fontSize: '0.8rem', color: themeColor, fontWeight: 700, marginBottom: '4px' }}>President</p>
                            {association.president.phone && (
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Phone size={12} /> {association.president.phone}
                                </p>
                            )}
                        </div>
                        <div style={{ marginLeft: 'auto' }}>
                            <div style={{
                                padding: '8px 16px', borderRadius: '999px',
                                background: `${themeColor}15`, color: themeColor,
                                fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
                                border: `1px solid ${themeColor}30`,
                            }}>
                                <Crown size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                                PRESIDENT
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Leaders Section */}
            {leaders.length > 0 && (
                <div className="animate-slide-up" style={{ marginBottom: '32px', animationDelay: '0.2s' }}>
                    <h2 style={{
                        fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px',
                        display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        <Award size={20} style={{ color: themeColor }} />
                        Leadership Team
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                        {leaders.map((member: any) => (
                            <div key={member._id} className="card" style={{
                                padding: '20px', display: 'flex', alignItems: 'center', gap: '16px',
                                transition: 'all 0.3s ease',
                            }}>
                                {member.photo ? (
                                    <img src={member.photo} alt={member.name}
                                        style={{
                                            width: '56px', height: '56px', borderRadius: '50%',
                                            objectFit: 'cover', flexShrink: 0,
                                            border: `2px solid ${themeColor}40`,
                                        }} />
                                ) : (
                                    <div style={{
                                        width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
                                        background: `linear-gradient(135deg, ${themeColor}30, ${themeColor}10)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.2rem', fontWeight: 800, color: themeColor,
                                        border: `2px solid ${themeColor}40`,
                                    }}>{member.name?.[0]?.toUpperCase()}</div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{member.title} {member.name}</p>
                                    <p style={{
                                        fontSize: '0.75rem', color: themeColor, fontWeight: 700,
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        background: `${themeColor}12`, padding: '2px 10px', borderRadius: '999px',
                                        marginTop: '3px',
                                    }}>{member.designation}</p>
                                    {member.phone && (
                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                            <Phone size={10} /> {member.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Other Members */}
            {otherMembers.length > 0 && (
                <div className="animate-slide-up" style={{ marginBottom: '32px', animationDelay: '0.3s' }}>
                    <h2 style={{
                        fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px',
                        display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        <Users size={20} style={{ color: themeColor }} />
                        Team Members
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                        {otherMembers.map((member: any) => (
                            <div key={member._id} className="card" style={{
                                padding: '16px', display: 'flex', alignItems: 'center', gap: '12px',
                            }}>
                                {member.photo ? (
                                    <img src={member.photo} alt={member.name}
                                        style={{
                                            width: '44px', height: '44px', borderRadius: '50%',
                                            objectFit: 'cover', flexShrink: 0,
                                            border: `2px solid ${themeColor}30`,
                                        }} />
                                ) : (
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                                        background: `${themeColor}15`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1rem', fontWeight: 700, color: themeColor,
                                        border: `2px solid ${themeColor}20`,
                                    }}>{member.name?.[0]?.toUpperCase()}</div>
                                )}
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{member.title} {member.name}</p>
                                    <p style={{ fontSize: '0.72rem', color: themeColor, fontWeight: 600 }}>{member.designation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Gallery */}
            {association.galleryImages && association.galleryImages.length > 0 && (
                <div className="animate-slide-up" style={{ marginBottom: '32px', animationDelay: '0.4s' }}>
                    <h2 style={{
                        fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px',
                        display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        <Heart size={20} style={{ color: themeColor }} />
                        Gallery
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                        {association.galleryImages.map((img: string, i: number) => (
                            <div key={i} className="card" style={{
                                overflow: 'hidden', cursor: 'pointer',
                                transition: 'transform 0.3s ease',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                                <img src={img} alt={`Gallery ${i + 1}`}
                                    style={{
                                        width: '100%', height: '180px',
                                        objectFit: 'cover', display: 'block',
                                    }} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Contact & Social */}
            {(association.contactPhone || association.contactEmail || association.socialLinks) && (
                <div className="card animate-slide-up" style={{
                    padding: '24px', marginBottom: '24px', animationDelay: '0.5s',
                }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail size={18} style={{ color: themeColor }} /> Contact
                    </h3>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        {association.contactPhone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                                <Phone size={14} /> {association.contactPhone}
                            </span>
                        )}
                        {association.contactEmail && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                                <Mail size={14} /> {association.contactEmail}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div style={{
                textAlign: 'center', padding: '32px 0',
                borderTop: '1px solid var(--border-primary)',
                marginTop: '16px',
            }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Star size={12} fill={themeColor} color={themeColor} />
                    Managed on <strong style={{ color: 'var(--accent-text)' }}>ReelBid</strong>
                    <Star size={12} fill={themeColor} color={themeColor} />
                </p>
            </div>
        </div>
    );
}
