'use client';

import React, { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Loader2, Mail, Lock, Film, ShieldCheck, KeyRound, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Toggle: 'otp' | 'password'
    const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp');

    // OTP flow states
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpVerified, setOtpVerified] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpCountdown, setOtpCountdown] = useState(0);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer for resend
    useEffect(() => {
        if (otpCountdown <= 0) return;
        const timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [otpCountdown]);

    // Reset OTP state when email changes
    useEffect(() => {
        setOtpSent(false);
        setOtpVerified(false);
        setOtp(['', '', '', '', '', '']);
    }, [email]);

    // Reset state when switching modes
    useEffect(() => {
        setOtpSent(false);
        setOtpVerified(false);
        setOtp(['', '', '', '', '', '']);
        setPassword('');
    }, [authMode]);

    // --- OTP Input Handlers ---
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);
        const nextEmpty = Math.min(pastedData.length, 5);
        otpRefs.current[nextEmpty]?.focus();
    };

    // --- Send OTP ---
    const handleSendOtp = async () => {
        if (!email) {
            toast.error('Please enter your email first');
            return;
        }
        setSendingOtp(true);
        try {
            const res = await fetch('/api/otp/signin-send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || 'Failed to send OTP');
                setSendingOtp(false);
                return;
            }
            toast.success('OTP sent to your email!');
            setOtpSent(true);
            setOtpCountdown(60);
            setOtp(['', '', '', '', '', '']);
            setTimeout(() => otpRefs.current[0]?.focus(), 200);
        } catch {
            toast.error('Something went wrong sending OTP');
        }
        setSendingOtp(false);
    };

    // --- Verify OTP ---
    const handleVerifyOtp = async () => {
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            toast.error('Please enter the full 6-digit OTP');
            return;
        }
        setVerifyingOtp(true);
        try {
            const res = await fetch('/api/otp/signin-verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpValue }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || 'Invalid OTP');
                setVerifyingOtp(false);
                return;
            }
            toast.success('OTP verified! Signing you in...');
            setOtpVerified(true);
            // Auto sign-in after OTP verification
            await signIn('credentials', {
                email,
                password: 'otp-verified',
                redirect: true,
                callbackUrl: '/dashboard',
            });
        } catch {
            toast.error('Something went wrong verifying OTP');
        }
        setVerifyingOtp(false);
    };

    // --- Password Sign In ---
    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (authMode === 'otp') {
            // OTP mode: user should verify via the OTP flow, not the form submit
            return;
        }
        setLoading(true);
        const res = await signIn('credentials', {
            email,
            password,
            redirect: true,
            callbackUrl: '/dashboard',
        });
        setLoading(false);
        if (res?.error) {
            toast.error('Invalid credentials');
        }
    };

    const handleGoogleLogin = () => {
        signIn('google', { callbackUrl: '/dashboard' });
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '20px 0' }}>
            <div
                className="animate-slide-up"
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '24px',
                    padding: '40px 32px',
                    boxShadow: 'var(--shadow-floating)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Top accent line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--accent), #ec4899)' }} />

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div
                        style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, var(--accent), #ec4899)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            margin: '0 auto 16px',
                            boxShadow: '0 4px 16px rgba(124, 58, 237, 0.25)',
                        }}
                    >
                        <Film style={{ width: 24, height: 24 }} />
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        Welcome Back
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                        Sign in to bid on movie memorabilia
                    </p>
                </div>

                {/* ═══ Toggle: OTP / Password ═══ */}
                <div
                    style={{
                        display: 'flex',
                        background: 'var(--bg-secondary, rgba(255,255,255,0.04))',
                        borderRadius: '14px',
                        padding: '4px',
                        marginBottom: '20px',
                        border: '1px solid var(--border-primary)',
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setAuthMode('otp')}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            borderRadius: '11px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
                            background: authMode === 'otp'
                                ? 'linear-gradient(135deg, var(--accent), #ec4899)'
                                : 'transparent',
                            color: authMode === 'otp' ? '#fff' : 'var(--text-muted)',
                            boxShadow: authMode === 'otp'
                                ? '0 4px 16px rgba(124, 58, 237, 0.3)'
                                : 'none',
                        }}
                    >
                        <ShieldCheck style={{ width: 16, height: 16 }} />
                        OTP Login
                    </button>
                    <button
                        type="button"
                        onClick={() => setAuthMode('password')}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            borderRadius: '11px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
                            background: authMode === 'password'
                                ? 'linear-gradient(135deg, var(--accent), #ec4899)'
                                : 'transparent',
                            color: authMode === 'password' ? '#fff' : 'var(--text-muted)',
                            boxShadow: authMode === 'password'
                                ? '0 4px 16px rgba(124, 58, 237, 0.3)'
                                : 'none',
                        }}
                    >
                        <KeyRound style={{ width: 16, height: 16 }} />
                        Password
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleCredentialsLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Email */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <Mail style={{ width: 18, height: 18 }} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input-field focus-ring"
                                style={{ paddingLeft: '42px', paddingRight: authMode === 'otp' && !otpVerified ? '120px' : '14px' }}
                                placeholder="you@example.com"
                            />
                            {/* Send OTP button inline */}
                            {authMode === 'otp' && !otpVerified && (
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={sendingOtp || otpCountdown > 0 || !email}
                                    style={{
                                        position: 'absolute',
                                        right: '6px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        padding: '6px 14px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        cursor: sendingOtp || otpCountdown > 0 ? 'not-allowed' : 'pointer',
                                        background: 'linear-gradient(135deg, var(--accent), #ec4899)',
                                        color: '#fff',
                                        opacity: sendingOtp || otpCountdown > 0 || !email ? 0.6 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        transition: 'opacity 0.2s',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {sendingOtp ? (
                                        <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
                                    ) : (
                                        <Send style={{ width: 13, height: 13 }} />
                                    )}
                                    {otpCountdown > 0 ? `${otpCountdown}s` : otpSent ? 'Resend' : 'Send OTP'}
                                </button>
                            )}
                            {/* Verified badge */}
                            {authMode === 'otp' && otpVerified && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        color: '#22c55e',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                    }}
                                >
                                    <ShieldCheck style={{ width: 16, height: 16 }} />
                                    Verified
                                </div>
                            )}
                        </div>
                    </div>

                    {/* OTP Input — 6 boxes */}
                    {authMode === 'otp' && otpSent && !otpVerified && (
                        <div
                            style={{
                                background: 'var(--bg-secondary, rgba(255,255,255,0.02))',
                                border: '1px solid var(--border-primary)',
                                borderRadius: '14px',
                                padding: '20px',
                                animation: 'fadeIn 0.3s ease',
                            }}
                        >
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', textAlign: 'center' }}>
                                Enter the 6-digit OTP sent to your email
                            </label>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '14px' }}>
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { otpRefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        onPaste={i === 0 ? handleOtpPaste : undefined}
                                        style={{
                                            width: '48px',
                                            height: '52px',
                                            textAlign: 'center',
                                            fontSize: '1.3rem',
                                            fontWeight: 800,
                                            borderRadius: '12px',
                                            border: `2px solid ${digit ? 'var(--accent)' : 'var(--border-primary)'}`,
                                            background: 'var(--bg-card)',
                                            color: 'var(--text-primary)',
                                            outline: 'none',
                                            transition: 'border-color 0.2s, box-shadow 0.2s',
                                            boxShadow: digit ? '0 0 0 3px rgba(124, 58, 237, 0.12)' : 'none',
                                            letterSpacing: '0',
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = 'var(--accent)';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.15)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = digit ? 'var(--accent)' : 'var(--border-primary)';
                                            e.target.style.boxShadow = digit ? '0 0 0 3px rgba(124, 58, 237, 0.12)' : 'none';
                                        }}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={verifyingOtp || otp.join('').length !== 6}
                                style={{
                                    width: '100%',
                                    padding: '11px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    cursor: verifyingOtp ? 'not-allowed' : 'pointer',
                                    fontSize: '0.88rem',
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: otp.join('').length !== 6 ? 0.5 : 1,
                                    transition: 'opacity 0.2s',
                                    boxShadow: '0 4px 14px rgba(34, 197, 94, 0.25)',
                                }}
                            >
                                {verifyingOtp ? (
                                    <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" />
                                ) : (
                                    <>
                                        <ShieldCheck style={{ width: 17, height: 17 }} />
                                        Verify & Sign In
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Password field — only for password mode */}
                    {authMode === 'password' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                    <Lock style={{ width: 18, height: 18 }} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required={authMode === 'password'}
                                    className="input-field focus-ring"
                                    style={{ paddingLeft: '42px' }}
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit — only for password mode */}
                    {authMode === 'password' && (
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{ width: '100%', padding: '14px', fontSize: '0.95rem', marginTop: '4px' }}
                        >
                            {loading ? <Loader2 style={{ width: 20, height: 20 }} className="animate-spin" /> : 'Sign In'}
                        </button>
                    )}
                </form>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-primary)' }} />
                    <span style={{ padding: '0 14px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Or continue with
                    </span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-primary)' }} />
                </div>

                <button
                    onClick={handleGoogleLogin}
                    className="btn-secondary focus-ring"
                    style={{ width: '100%', padding: '14px', fontSize: '0.9rem' }}
                >
                    <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
                        />
                    </svg>
                    Sign In with Google
                </button>

                {/* Register link */}
                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/register" style={{ color: 'var(--accent-text)', fontWeight: 700, textDecoration: 'none' }}>
                        Register as Buyer
                    </Link>
                </p>
            </div>

            {/* Inline animation keyframes */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
