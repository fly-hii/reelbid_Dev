'use client';

import React, { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Loader2, Mail, Lock, User, Phone, Film, ArrowRight, ShieldCheck, KeyRound, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);

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

    // Reset OTP state when switching modes
    useEffect(() => {
        setOtpSent(false);
        setOtpVerified(false);
        setOtp(['', '', '', '', '', '']);
        setPassword('');
        setConfirmPassword('');
    }, [authMode]);

    // --- OTP Input Handlers ---
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        // Auto-focus next input
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
            const res = await fetch('/api/otp/send', {
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
            const res = await fetch('/api/otp/verify', {
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
            toast.success('Email verified successfully!');
            setOtpVerified(true);
        } catch {
            toast.error('Something went wrong verifying OTP');
        }
        setVerifyingOtp(false);
    };

    // --- Register ---
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (authMode === 'password') {
            if (password !== confirmPassword) {
                toast.error('Passwords do not match');
                return;
            }
            if (password.length < 6) {
                toast.error('Password must be at least 6 characters');
                return;
            }
        }

        if (authMode === 'otp' && !otpVerified) {
            toast.error('Please verify your OTP first');
            return;
        }

        if (!agreed) {
            toast.error('Please agree to the terms to continue');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    password: authMode === 'password' ? password : undefined,
                    method: authMode,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || 'Registration failed');
                setLoading(false);
                return;
            }

            toast.success('Account created successfully! Signing you in...');

            // Auto sign-in after successful registration
            await signIn('credentials', {
                email,
                password: authMode === 'password' ? password : 'otp-verified',
                redirect: true,
                callbackUrl: '/dashboard',
            });
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        }
        setLoading(false);
    };

    const handleGoogleRegister = () => {
        signIn('google', { callbackUrl: '/dashboard' });
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '75vh', padding: '20px 0' }}>
            <div
                className="animate-slide-up"
                style={{
                    width: '100%',
                    maxWidth: '480px',
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
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, var(--accent), #ec4899)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            margin: '0 auto 16px',
                            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)',
                        }}
                    >
                        <Film style={{ width: 28, height: 28 }} />
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        Create Your Account
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                        Join ReelBid and bid on exclusive movie memorabilia
                    </p>
                </div>

                {/* Google Register */}
                <button
                    onClick={handleGoogleRegister}
                    className="btn-secondary focus-ring"
                    style={{ width: '100%', padding: '13px', fontSize: '0.9rem', marginBottom: '20px' }}
                >
                    <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
                        />
                    </svg>
                    Sign Up with Google
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0 20px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-primary)' }} />
                    <span style={{ padding: '0 14px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Or register with email
                    </span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-primary)' }} />
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
                        OTP Verification
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
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Full Name */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                            Full Name
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <User style={{ width: 18, height: 18 }} />
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="input-field focus-ring"
                                style={{ paddingLeft: '42px' }}
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

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
                                        Verify OTP
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Phone */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                            Phone Number <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <Phone style={{ width: 18, height: 18 }} />
                            </div>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="input-field focus-ring"
                                style={{ paddingLeft: '42px' }}
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>

                    {/* Password fields — only for password mode */}
                    {authMode === 'password' && (
                        <div className="register-password-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', animation: 'fadeIn 0.3s ease' }}>
                            <div>
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
                                        required
                                        minLength={6}
                                        className="input-field focus-ring"
                                        style={{ paddingLeft: '42px' }}
                                        placeholder="Min. 6 chars"
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                    Confirm
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                        <Lock style={{ width: 18, height: 18 }} />
                                    </div>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="input-field focus-ring"
                                        style={{ paddingLeft: '42px' }}
                                        placeholder="Re-enter"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Terms Checkbox */}
                    <div style={{ display: 'flex', alignItems: 'start', gap: '10px', marginTop: '4px' }}>
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            id="terms"
                            style={{
                                width: '18px',
                                height: '18px',
                                accentColor: 'var(--accent)',
                                marginTop: '2px',
                                cursor: 'pointer',
                                flexShrink: 0,
                            }}
                        />
                        <label htmlFor="terms" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, cursor: 'pointer' }}>
                            I agree to the <span style={{ color: 'var(--accent-text)', fontWeight: 600 }}>Terms of Service</span> and <span style={{ color: 'var(--accent-text)', fontWeight: 600 }}>Privacy Policy</span>. I understand that only buyers can self-register.
                        </label>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || (authMode === 'otp' && !otpVerified)}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            padding: '14px',
                            fontSize: '0.95rem',
                            marginTop: '4px',
                            opacity: (authMode === 'otp' && !otpVerified) ? 0.5 : 1,
                            cursor: (loading || (authMode === 'otp' && !otpVerified)) ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? <Loader2 style={{ width: 20, height: 20 }} className="animate-spin" /> : (
                            <>
                                Create Account
                                <ArrowRight style={{ width: 18, height: 18 }} />
                            </>
                        )}
                    </button>
                </form>

                {/* Sign In link */}
                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Already have an account?{' '}
                    <Link href="/auth/signin" style={{ color: 'var(--accent-text)', fontWeight: 700, textDecoration: 'none' }}>
                        Sign In
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
