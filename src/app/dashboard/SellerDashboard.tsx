'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    Loader2, PlusCircle, Store, Package, TrendingUp, DollarSign,
    Gavel, Clock, CheckCircle, XCircle, Eye, MoreVertical,
    ArrowUpRight, AlertCircle, Coins, Shield, Percent, Calendar,
    ChevronDown, Users, Award, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SellerDashboard() {
    const { data: session } = useSession();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');

    // Form state
    const [form, setForm] = useState({
        title: '', description: '', startingPrice: '',
        securityPercentage: '5', category: 'General',
        duration: '24', // hours
    });
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/items?sellerId=${(session?.user as any)?.id}`);
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch { }
        setLoading(false);
    };

    const handleOpenCreateForm = () => {
        setForm({ title: '', description: '', startingPrice: '', securityPercentage: '5', category: 'General', duration: '24' });
        setUploadedImages([]);
        setEditingItemId(null);
        setShowCreateForm(!showCreateForm);
    };

    const handleEditClick = (item: any) => {
        setForm({
            title: item.title,
            description: item.description,
            startingPrice: item.startingPrice?.toString() || '',
            securityPercentage: item.securityPercentage?.toString() || '5',
            category: item.category || 'General',
            duration: '24' // Default for now
        });
        setUploadedImages(item.images || []);
        setEditingItemId(item._id);
        setShowCreateForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.description || !form.startingPrice) {
            return toast.error('Fill all required fields');
        }
        setCreating(true);
        try {
            const now = new Date();
            const endDate = new Date(now.getTime() + parseInt(form.duration) * 60 * 60 * 1000);

            const payload: any = {
                title: form.title,
                description: form.description,
                startingPrice: parseFloat(form.startingPrice),
                securityPercentage: parseFloat(form.securityPercentage),
                category: form.category,
                images: uploadedImages,
            };

            if (editingItemId) {
                payload.itemId = editingItemId;
                // Only send new dates if they explicitly want to change them, but for now we'll update it
                payload.endDate = endDate.toISOString();
            } else {
                payload.startDate = now.toISOString();
                payload.endDate = endDate.toISOString();
            }

            const res = await fetch('/api/items', {
                method: editingItemId ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(editingItemId ? 'Auction updated!' : 'Auction created!');
            setForm({ title: '', description: '', startingPrice: '', securityPercentage: '5', category: 'General', duration: '24' });
            setUploadedImages([]);
            setEditingItemId(null);
            setShowCreateForm(false);
            fetchData();
        } catch (err: any) {
            toast.error(err.message);
        }
        setCreating(false);
    };

    const handleCloseAuction = async (itemId: string) => {
        if (!confirm('Are you sure you want to close this auction? This will declare the winner and refund losing bidders.')) return;
        try {
            const res = await fetch('/api/auctions/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(`Auction completed! ${data.winner ? 'Winner declared.' : 'No winner (no bids).'}`);
            fetchData();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" />
            </div>
        );
    }

    const activeItems = items.filter(i => i.status === 'Active' && new Date(i.endDate) > new Date());
    const completedItems = items.filter(i => i.status === 'Completed' || (i.status === 'Active' && new Date(i.endDate) <= new Date()));
    const totalRevenue = completedItems.reduce((sum, i) => sum + (i.finalAmount || i.currentPrice || 0), 0);
    const totalBids = items.reduce((sum, i) => sum + (i.bidCount || 0), 0);

    const filteredItems = activeTab === 'active' ? activeItems : activeTab === 'completed' ? completedItems : items;

    const formatDate = (d: string) => {
        const date = new Date(d);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) +
            ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Store size={28} style={{ color: 'var(--accent)' }} />
                        Seller Dashboard
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage your auctions</p>
                </div>
                <button className="btn-primary" onClick={handleOpenCreateForm}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PlusCircle size={18} />
                    {showCreateForm ? 'Cancel' : 'Create Auction'}
                </button>
            </div>

            {/* Create Auction Form */}
            {showCreateForm && (
                <div className="card animate-slide-up" style={{ padding: '28px' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PlusCircle size={20} style={{ color: 'var(--accent)' }} />
                        {editingItemId ? 'Edit Auction' : 'New Auction'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="seller-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                    Product Name *
                                </label>
                                <input className="input-field" value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. Hero's Leather Jacket from Pushpa 2" required />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                    Category
                                </label>
                                <select className="input-field" value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}>
                                    <option value="General">General</option>
                                    <option value="Clothing">Clothing</option>
                                    <option value="Vehicles">Vehicles</option>
                                    <option value="Accessories">Accessories</option>
                                    <option value="Props">Props</option>
                                    <option value="Memorabilia">Memorabilia</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                    Description *
                                </label>
                                <textarea className="input-field" value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Describe the item in detail..."
                                    rows={3} required style={{ resize: 'vertical' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                    <DollarSign size={14} /> Base Price (₹) *
                                </label>
                                <input type="number" className="input-field" value={form.startingPrice}
                                    onChange={e => setForm({ ...form, startingPrice: e.target.value })}
                                    placeholder="e.g. 5000" min="1" required />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                    <Percent size={14} /> Security Deposit (%) *
                                </label>
                                <input type="number" className="input-field" value={form.securityPercentage}
                                    onChange={e => setForm({ ...form, securityPercentage: e.target.value })}
                                    placeholder="e.g. 5" min="1" max="50" required />
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    Base Deposit Amount: <strong style={{ color: 'var(--accent)' }}>₹{form.startingPrice ? Math.ceil(parseInt(form.startingPrice) * (parseInt(form.securityPercentage || '0') / 100)).toLocaleString() : '0'}</strong>
                                </p>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                    <Clock size={14} /> Duration (hours)
                                </label>
                                <select className="input-field" value={form.duration}
                                    onChange={e => setForm({ ...form, duration: e.target.value })}>
                                    <option value="1">1 Hour</option>
                                    <option value="6">6 Hours</option>
                                    <option value="12">12 Hours</option>
                                    <option value="24">24 Hours</option>
                                    <option value="48">2 Days</option>
                                    <option value="72">3 Days</option>
                                    <option value="168">7 Days</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                    Upload Images (Max 3)
                                </label>
                                <input type="file" multiple accept="image/*" className="input-field"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []).slice(0, 3);
                                        const newImages: string[] = [];
                                        let count = 0;
                                        files.forEach(file => {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                newImages.push(reader.result as string);
                                                count++;
                                                if (count === files.length) {
                                                    setUploadedImages(prev => [...prev, ...newImages].slice(0, 3));
                                                }
                                            };
                                            reader.readAsDataURL(file);
                                        });
                                    }} />
                                {uploadedImages.length > 0 && (
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        {uploadedImages.map((img, idx) => (
                                            <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                                <img src={img} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px', background: '#000' }} />
                                                <button type="button" onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                                                    style={{ position: 'absolute', top: -5, right: -5, background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', fontSize: '10px' }}>
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Preview */}
                        {form.startingPrice && form.securityPercentage && (
                            <div style={{
                                marginTop: '16px', padding: '14px', borderRadius: '12px',
                                background: 'var(--accent-soft)', display: 'flex', flexDirection: 'column', gap: '8px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-text)', fontSize: '0.82rem' }}>
                                    <Shield size={14} />
                                    <span><strong>Dynamic Deposit System Enabled:</strong></span>
                                </div>
                                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    <li>Initial Deposit (at Base Price): <strong>₹{Math.ceil(parseInt(form.startingPrice) * parseInt(form.securityPercentage) / 100).toLocaleString()}</strong></li>
                                    <li>Deposit required doubles dynamically as the winning bid crosses 2x thresholds up to ₹80,000.</li>
                                    <li>Above ₹80,000, it switches to a flat increase, adding <strong>{form.securityPercentage}%</strong> extra for every ₹10,000 stepped in the bid!</li>
                                </ul>
                            </div>
                        )}

                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={creating}>
                                {creating ? <Loader2 size={16} className="animate-spin" /> : editingItemId ? 'Update Auction' : 'Publish Auction'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Stats */}
            <div className="dash-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                    { label: 'Active Auctions', value: activeItems.length, icon: <Package size={20} />, color: 'var(--accent)' },
                    { label: 'Completed', value: completedItems.length, icon: <CheckCircle size={20} />, color: 'var(--success)' },
                    { label: 'Total Bids', value: totalBids, icon: <Gavel size={20} />, color: '#ec4899' },
                    { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: <TrendingUp size={20} />, color: 'var(--warning)' },
                ].map((stat, i) => (
                    <div key={i} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: '12px',
                            background: `${stat.color}18`, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: stat.color,
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tab Filters */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-primary)', paddingBottom: '12px' }}>
                {(['active', 'completed', 'all'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        fontWeight: 600, fontSize: '0.82rem',
                        background: activeTab === tab ? 'var(--accent)' : 'transparent',
                        color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                        transition: 'all 0.2s',
                    }}>
                        {tab === 'active' ? `Active (${activeItems.length})` :
                            tab === 'completed' ? `Completed (${completedItems.length})` :
                                `All (${items.length})`}
                    </button>
                ))}
            </div>

            {/* Auction List */}
            {filteredItems.length === 0 ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                    <AlertCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                    <p style={{ color: 'var(--text-muted)' }}>No auctions found.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredItems.map((item: any) => {
                        const isActive = item.status === 'Active' && new Date(item.endDate) > new Date();
                        const isEnded = new Date(item.endDate) <= new Date() && item.status !== 'Completed';
                        const timeLeft = new Date(item.endDate).getTime() - Date.now();
                        const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
                        const minsLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));

                        return (
                            <div key={item._id} className="card" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>

                                    {/* Thumbnail Image */}
                                    <div style={{ width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#0a0a0a', border: '1px solid var(--border-primary)' }}>
                                        {item.images && item.images.length > 0 ? (
                                            <Link href={`/auctions/${item._id}`}>
                                                <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }} />
                                            </Link>
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                                <Package size={24} />
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                            <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>{item.title}</h4>
                                            <span className={`badge ${item.status === 'Completed' ? 'badge-success' : isActive ? 'badge-accent' : 'badge-danger'}`}>
                                                {item.status === 'Completed' ? '✓ Completed' : isActive ? '● Live' : '⏱ Ended'}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {item.description}
                                        </p>
                                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <DollarSign size={14} style={{ color: 'var(--accent)' }} />
                                                Base: ₹{item.startingPrice?.toLocaleString()}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                                                <TrendingUp size={14} style={{ color: 'var(--success)' }} />
                                                Current: ₹{item.currentPrice?.toLocaleString()}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Lock size={14} style={{ color: 'var(--warning)' }} />
                                                Deposit: {item.securityPercentage || 5}% (₹{Math.ceil(item.startingPrice * ((item.securityPercentage || 5) / 100)).toLocaleString()})
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Gavel size={14} />
                                                {item.bidCount || 0} bids
                                            </span>
                                            {isActive && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: timeLeft < 3600000 ? 'var(--danger)' : 'var(--text-muted)' }}>
                                                    <Clock size={14} />
                                                    {hoursLeft}h {minsLeft}m left
                                                </span>
                                            )}
                                        </div>
                                        {item.winner && (
                                            <div style={{
                                                marginTop: '10px', padding: '8px 12px', borderRadius: '10px',
                                                background: 'var(--success-soft)', display: 'flex', alignItems: 'center', gap: '8px',
                                                fontSize: '0.82rem',
                                            }}>
                                                <Award size={14} style={{ color: 'var(--success)' }} />
                                                <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                                                    Winner: {item.winner?.name || 'N/A'} · Final: ₹{item.finalAmount?.toLocaleString() || item.currentPrice?.toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <Link href={`/auctions/${item._id}`}>
                                            <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                                                <Eye size={14} /> View
                                            </button>
                                        </Link>
                                        {isActive && item.bidCount === 0 && (
                                            <button className="btn-secondary" onClick={() => handleEditClick(item)}
                                                style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                                                Edit
                                            </button>
                                        )}
                                        {(isActive || isEnded) && item.status !== 'Completed' && (
                                            <button className="btn-primary" onClick={() => handleCloseAuction(item._id)}
                                                style={{ padding: '8px 14px', fontSize: '0.8rem', background: 'var(--success)' }}>
                                                <CheckCircle size={14} /> Close
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
