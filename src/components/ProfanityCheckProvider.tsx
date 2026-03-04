'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { containsProfanity } from '@/lib/profanityFilter';
import { ShieldAlert, X, AlertTriangle } from 'lucide-react';

/**
 * ProfanityCheckProvider — Global component that monitors ALL input fields 
 * on the page. When profanity is detected on blur or form submit, it shows
 * a warning popup and focuses back on the field to fix it.
 */
export default function ProfanityCheckProvider() {
    const [warning, setWarning] = useState<{ field: string; value: string; element: HTMLElement | null } | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const checkElement = useCallback((el: HTMLInputElement | HTMLTextAreaElement) => {
        const value = el.value;
        if (!value || value.trim().length < 2) return;

        // Skip numeric-only fields (phone, pincode, amount, price)
        const type = el.type?.toLowerCase();
        if (type === 'number' || type === 'tel' || type === 'password' || type === 'email' || type === 'hidden' || type === 'date' || type === 'datetime-local') return;

        // Skip if placeholder suggests numeric input
        const placeholder = (el.placeholder || '').toLowerCase();
        if (placeholder.includes('amount') || placeholder.includes('price') || placeholder.includes('₹') || placeholder.includes('pincode')) return;

        const badWord = containsProfanity(value);
        if (badWord) {
            const fieldName = el.placeholder || el.name || el.getAttribute('aria-label') || 'Input field';
            setWarning({ field: fieldName, value, element: el });

            // Add red border to the element
            el.style.borderColor = 'var(--danger)';
            el.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.2)';
        }
    }, []);

    useEffect(() => {
        // Listen for blur events on all inputs
        const handleBlur = (e: Event) => {
            const el = e.target as HTMLElement;
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                // Small delay to avoid interfering with other interactions
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => {
                    checkElement(el as HTMLInputElement);
                }, 200);
            }
        };

        // Listen for input events to clear warning when user fixes
        const handleInput = (e: Event) => {
            const el = e.target as HTMLInputElement;
            if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') return;

            const value = el.value;
            if (!value || !containsProfanity(value)) {
                // Clear red border
                el.style.borderColor = '';
                el.style.boxShadow = '';

                // If this is the element that triggered the warning, close it
                if (warning?.element === el) {
                    setWarning(null);
                }
            }
        };

        document.addEventListener('focusout', handleBlur, true);
        document.addEventListener('input', handleInput, true);

        return () => {
            document.removeEventListener('focusout', handleBlur, true);
            document.removeEventListener('input', handleInput, true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [checkElement, warning]);

    const handleGoToField = () => {
        if (warning?.element) {
            warning.element.focus();
            warning.element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Pulse animation on the field
            warning.element.style.animation = 'profanity-pulse 0.6s ease 2';
            setTimeout(() => {
                if (warning.element) warning.element.style.animation = '';
            }, 1200);
        }
        setWarning(null);
    };

    if (!warning) return (
        <style>{`
            @keyframes profanity-pulse {
                0%, 100% { box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2); }
                50% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.3); }
            }
        `}</style>
    );

    return (
        <>
            <style>{`
                @keyframes profanity-pulse {
                    0%, 100% { box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2); }
                    50% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.3); }
                }
                @keyframes profanity-slide-in {
                    from { transform: translateY(20px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
            `}</style>

            {/* Overlay */}
            <div
                style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px',
                }}
                onClick={handleGoToField}
            >
                {/* Popup Card */}
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '20px',
                        padding: '28px',
                        maxWidth: '420px',
                        width: '100%',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                        animation: 'profanity-slide-in 0.3s ease',
                    }}
                >
                    {/* Close button */}
                    <button
                        onClick={handleGoToField}
                        style={{
                            position: 'absolute', top: '12px', right: '12px',
                            background: 'transparent', border: 'none',
                            color: 'var(--text-muted)', cursor: 'pointer', padding: '4px',
                        }}
                    >
                        <X size={18} />
                    </button>

                    {/* Icon */}
                    <div style={{
                        width: '50px', height: '50px', borderRadius: '14px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                    }}>
                        <ShieldAlert size={26} style={{ color: 'var(--danger)' }} />
                    </div>

                    <h3 style={{
                        fontSize: '1.1rem', fontWeight: 800, textAlign: 'center',
                        color: 'var(--text-primary)', marginBottom: '8px',
                    }}>
                        Inappropriate Language Detected
                    </h3>

                    <p style={{
                        fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center',
                        lineHeight: 1.5, marginBottom: '16px',
                    }}>
                        The field below contains words that are not allowed on ReelBid.
                        Please edit the field to remove offensive language.
                    </p>

                    {/* Field info */}
                    <div style={{
                        padding: '12px 14px', borderRadius: '12px',
                        background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)',
                        marginBottom: '20px',
                        display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                        <AlertTriangle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: '0.72rem', color: 'var(--danger)', fontWeight: 600, marginBottom: '2px' }}>
                                {warning.field.replace(/\*/g, '')}
                            </p>
                            <p style={{
                                fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                                &quot;{warning.value}&quot;
                            </p>
                        </div>
                    </div>

                    {/* Action button */}
                    <button
                        onClick={handleGoToField}
                        className="btn-primary"
                        style={{
                            width: '100%', padding: '14px', fontSize: '0.9rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, var(--danger), #dc2626)',
                        }}
                    >
                        ✏️ Go to Field & Fix It
                    </button>

                    <p style={{
                        textAlign: 'center', marginTop: '10px',
                        fontSize: '0.7rem', color: 'var(--text-muted)',
                    }}>
                        ReelBid enforces a strict no-abuse policy on all content.
                    </p>
                </div>
            </div>
        </>
    );
}
