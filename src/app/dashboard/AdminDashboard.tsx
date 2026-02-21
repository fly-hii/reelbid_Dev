'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    Loader2, Shield, Users, Package, Gavel, DollarSign, TrendingUp,
    UserCheck, Store, ShoppingBag, Clock, CheckCircle, Trash2,
    ChevronDown, Eye, Coins, AlertTriangle, Crown, Search,
    PlusCircle, Edit3, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [adminData, setAdminData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'users' | 'auctions' | 'tiers'>('users');
    const [userSearch, setUserSearch] = useState('');
    const [auctionSearch, setAuctionSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'Admin' | 'Seller' | 'Buyer'>('all');
    const [changingRole, setChangingRole] = useState<string | null>(null);

    // Tier management state
    const [tiers, setTiers] = useState<any[]>([]);
    const [showTierForm, setShowTierForm] = useState(false);
    const [editingTier, setEditingTier] = useState<any>(null);
    const [tierForm, setTierForm] = useState({ name: '', minBalance: '', bidLimit: '', order: '' });
    const [savingTier, setSavingTier] = useState(false);

    const fetchData = () => {
        fetch('/api/admin/stats')
            .then(r => r.json())
            .then(data => { if (!data.error) setAdminData(data); setLoading(false); })
            .catch(() => setLoading(false));
    };

    const fetchTiers = () => {
        fetch('/api/admin/tiers')
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setTiers(data); })
            .catch(() => { });
    };

    useEffect(() => { fetchData(); fetchTiers(); }, []);

    const handleTierSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingTier(true);
        try {
            const body: any = {
                name: tierForm.name,
                minBalance: Number(tierForm.minBalance),
                bidLimit: Number(tierForm.bidLimit),
                order: Number(tierForm.order) || 0,
            };
            if (editingTier) body.tierId = editingTier._id;

            const res = await fetch('/api/admin/tiers', {
                method: editingTier ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(editingTier ? 'Tier updated!' : 'Tier created!');
                setShowTierForm(false);
                setEditingTier(null);
                setTierForm({ name: '', minBalance: '', bidLimit: '', order: '' });
                fetchTiers();
            } else {
                toast.error(data.error || 'Failed');
            }
        } catch { toast.error('Error saving tier'); }
        setSavingTier(false);
    };

    const handleDeleteTier = async (tierId: string, tierName: string) => {
        if (!confirm(`Delete tier "${tierName}"? This cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/admin/tiers?tierId=${tierId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Tier deleted');
                fetchTiers();
            } else toast.error(data.error || 'Failed');
        } catch { toast.error('Error deleting tier'); }
    };

    const startEditTier = (tier: any) => {
        setEditingTier(tier);
        setTierForm({
            name: tier.name,
            minBalance: String(tier.minBalance),
            bidLimit: String(tier.bidLimit),
            order: String(tier.order || 0),
        });
        setShowTierForm(true);
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        setChangingRole(userId);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Role updated to ${newRole}`);
                fetchData();
            } else toast.error(data.error || 'Failed to update role');
        } catch { toast.error('Error updating role'); }
        setChangingRole(null);
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('User deleted');
                fetchData();
            } else toast.error(data.error || 'Failed to delete user');
        } catch { toast.error('Error deleting user'); }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" />
            </div>
        );
    }

    const stats = adminData?.stats || {};
    const users = adminData?.users || [];
    const items = adminData?.items || [];

    const filteredUsers = users.filter((u: any) => {
        const matchSearch = u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const filteredAuctions = items.filter((i: any) =>
        i.title?.toLowerCase().includes(auctionSearch.toLowerCase())
    );

    const roleColors: Record<string, { bg: string; color: string }> = {
        Admin: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
        Seller: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
        Buyer: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* Page Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(239,68,68,0.3)',
                }}>
                    <Shield style={{ width: 24, height: 24, color: '#fff' }} />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        Admin Dashboard
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Platform overview & management — {session?.user?.name}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="admin-overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
                {[
                    { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
                    { label: 'Buyers', value: stats.buyers || 0, icon: ShoppingBag, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
                    { label: 'Sellers', value: stats.sellers || 0, icon: Store, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                    { label: 'Admins', value: stats.admins || 0, icon: Shield, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
                    { label: 'Total Auctions', value: stats.totalItems || 0, icon: Package, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
                    { label: 'Active', value: stats.activeAuctions || 0, icon: Clock, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
                    { label: 'Total Bids', value: stats.totalBids || 0, icon: Gavel, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                    { label: 'Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
                ].map((s, i) => (
                    <div key={i} className="card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <s.icon style={{ width: 20, height: 20, color: s.color }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {s.label}
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                {s.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs: Users / Auctions */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Tab bar */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-primary)' }}>
                    {[
                        { key: 'users' as const, label: 'Manage Users', icon: Users },
                        { key: 'auctions' as const, label: 'All Auctions', icon: Package },
                        { key: 'tiers' as const, label: 'Bidding Tiers', icon: Layers },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1, padding: '16px', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                fontSize: '0.9rem', fontWeight: 700,
                                background: activeTab === tab.key ? 'var(--accent-soft)' : 'transparent',
                                color: activeTab === tab.key ? 'var(--accent-text)' : 'var(--text-muted)',
                                borderBottom: activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
                                transition: 'all 0.2s',
                            }}
                        >
                            <tab.icon style={{ width: 16, height: 16 }} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'users' ? (
                    <div style={{ padding: '20px 24px 24px' }}>
                        {/* Search + Filter */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                    <Search style={{ width: 16, height: 16 }} />
                                </div>
                                <input
                                    type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                                    placeholder="Search users..." className="input-field focus-ring"
                                    style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {(['all', 'Admin', 'Seller', 'Buyer'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setRoleFilter(f)}
                                        style={{
                                            padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                            fontSize: '0.8rem', fontWeight: 700,
                                            background: roleFilter === f ? 'var(--accent-soft)' : 'transparent',
                                            color: roleFilter === f ? 'var(--accent-text)' : 'var(--text-muted)',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {f === 'all' ? 'All' : f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="table-wrap" style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
                                        {['Name', 'Email', 'Role', 'Wallet', 'Tier', 'Joined', 'Actions'].map((h) => (
                                            <th key={h} style={{
                                                textAlign: 'left', padding: '12px 14px', fontSize: '0.75rem',
                                                fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user: any) => {
                                        const rc = roleColors[user.role] || roleColors.Buyer;
                                        const isSelf = user._id === (session?.user as any)?.id;
                                        return (
                                            <tr key={user._id} style={{ borderBottom: '1px solid var(--border-primary)', transition: 'background 0.15s' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{
                                                            width: '32px', height: '32px', borderRadius: '8px',
                                                            background: rc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontWeight: 800, fontSize: '0.8rem', color: rc.color,
                                                        }}>
                                                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                        <span>{user.name}</span>
                                                        {isSelf && <span style={{ fontSize: '0.7rem', color: 'var(--accent-text)', fontWeight: 700 }}>(You)</span>}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>{user.email}</td>
                                                <td style={{ padding: '14px' }}>
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                        disabled={isSelf || changingRole === user._id}
                                                        style={{
                                                            padding: '5px 10px', borderRadius: '6px',
                                                            border: '1px solid var(--border-primary)',
                                                            background: rc.bg, color: rc.color,
                                                            fontWeight: 700, fontSize: '0.8rem', cursor: isSelf ? 'not-allowed' : 'pointer',
                                                            opacity: isSelf ? 0.5 : 1,
                                                        }}
                                                    >
                                                        <option value="Buyer">Buyer</option>
                                                        <option value="Seller">Seller</option>
                                                        <option value="Admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                    ₹{(user.walletBalance || 0).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '14px' }}>
                                                    <span style={{
                                                        padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                                                        background: user.tier !== 'None' ? 'rgba(139,92,246,0.1)' : 'var(--bg-input)',
                                                        color: user.tier !== 'None' ? '#8b5cf6' : 'var(--text-muted)',
                                                    }}>
                                                        {user.tier || 'None'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '14px' }}>
                                                    {!isSelf && (
                                                        <button
                                                            onClick={() => handleDeleteUser(user._id, user.name)}
                                                            style={{
                                                                width: '32px', height: '32px', borderRadius: '8px',
                                                                border: 'none', cursor: 'pointer',
                                                                background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                transition: 'background 0.2s',
                                                            }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                                                            title="Delete user"
                                                        >
                                                            <Trash2 style={{ width: 14, height: 14 }} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {filteredUsers.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <Users style={{ width: 40, height: 40, color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                                <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No users found</p>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'auctions' ? (
                    <div style={{ padding: '20px 24px 24px' }}>
                        {/* Auction search */}
                        <div style={{ position: 'relative', marginBottom: '16px', maxWidth: '400px' }}>
                            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <Search style={{ width: 16, height: 16 }} />
                            </div>
                            <input
                                type="text" value={auctionSearch} onChange={(e) => setAuctionSearch(e.target.value)}
                                placeholder="Search auctions..." className="input-field focus-ring"
                                style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
                            />
                        </div>

                        {/* Auctions Table */}
                        <div className="table-wrap" style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
                                        {['Item', 'Seller', 'Starting', 'Current', 'Status', 'End Date', 'View'].map((h) => (
                                            <th key={h} style={{
                                                textAlign: 'left', padding: '12px 14px', fontSize: '0.75rem',
                                                fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAuctions.map((item: any) => {
                                        const isActive = item.status === 'Active' && new Date(item.endDate) > new Date();
                                        return (
                                            <tr key={item._id} style={{ borderBottom: '1px solid var(--border-primary)', transition: 'background 0.15s' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {item.title}
                                                </td>
                                                <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                                                    {item.seller?.name || 'Unknown'}
                                                </td>
                                                <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>
                                                    ₹{item.startingPrice?.toLocaleString()}
                                                </td>
                                                <td style={{ padding: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Coins style={{ width: 14, height: 14, color: 'var(--accent-text)' }} />
                                                        ₹{item.currentPrice?.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px' }}>
                                                    <span className={isActive ? 'badge-success' : 'badge-danger'} style={{ fontSize: '0.72rem', padding: '3px 10px' }}>
                                                        {isActive ? '● Live' : '● Ended'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                                    {new Date(item.endDate).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '14px' }}>
                                                    <Link
                                                        href={`/auctions/${item._id}`}
                                                        style={{
                                                            width: '32px', height: '32px', borderRadius: '8px',
                                                            background: 'var(--accent-soft)', color: 'var(--accent-text)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            textDecoration: 'none',
                                                        }}
                                                    >
                                                        <Eye style={{ width: 14, height: 14 }} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {filteredAuctions.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <Package style={{ width: 40, height: 40, color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                                <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No auctions found</p>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'tiers' ? (
                    /* ═══ TIERS TAB ═══ */
                    <div style={{ padding: '20px 24px 24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Manage Bidding Tiers</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Control wallet requirements and bid limits for each tier</p>
                            </div>
                            <button
                                onClick={() => { setEditingTier(null); setTierForm({ name: '', minBalance: '', bidLimit: '', order: '' }); setShowTierForm(!showTierForm); }}
                                className="btn-primary"
                                style={{ padding: '8px 20px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                                <PlusCircle style={{ width: 15, height: 15 }} />
                                {showTierForm ? 'Cancel' : 'Add Tier'}
                            </button>
                        </div>

                        {/* Tier Form */}
                        {showTierForm && (
                            <form onSubmit={handleTierSubmit} className="card" style={{ padding: '24px', marginBottom: '20px', animation: 'fadeSlideIn 0.3s ease' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                                    {editingTier ? `Edit "${editingTier.name}"` : 'Create New Tier'}
                                </h4>
                                <div className="dash-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Tier Name</label>
                                        <input type="text" value={tierForm.name} onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })} required
                                            className="input-field focus-ring" placeholder="e.g. Tier A" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Min Balance (₹)</label>
                                        <input type="number" value={tierForm.minBalance} onChange={(e) => setTierForm({ ...tierForm, minBalance: e.target.value })} required min={0}
                                            className="input-field focus-ring" placeholder="100" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Bid Limit (₹)</label>
                                        <input type="number" value={tierForm.bidLimit} onChange={(e) => setTierForm({ ...tierForm, bidLimit: e.target.value })} required min={1}
                                            className="input-field focus-ring" placeholder="10000" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Order (priority)</label>
                                        <input type="number" value={tierForm.order} onChange={(e) => setTierForm({ ...tierForm, order: e.target.value })} min={0}
                                            className="input-field focus-ring" placeholder="1" />
                                    </div>
                                </div>
                                <button type="submit" disabled={savingTier} className="btn-primary" style={{ padding: '10px 28px', fontSize: '0.88rem' }}>
                                    {savingTier ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : (editingTier ? 'Update Tier' : 'Create Tier')}
                                </button>
                            </form>
                        )}

                        {/* Tier List */}
                        {tiers.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {tiers.map((tier: any) => (
                                    <div
                                        key={tier._id}
                                        style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '18px 20px', borderRadius: '14px',
                                            background: 'var(--bg-input)', border: '1px solid var(--border-primary)',
                                            transition: 'border-color 0.2s',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div style={{
                                                width: '44px', height: '44px', borderRadius: '12px',
                                                background: 'rgba(139,92,246,0.1)', color: '#8b5cf6',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 800, fontSize: '0.85rem',
                                            }}>
                                                <Crown style={{ width: 20, height: 20 }} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{tier.name}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                                    <span>Min Balance: <strong style={{ color: 'var(--text-secondary)' }}>₹{tier.minBalance.toLocaleString()}</strong></span>
                                                    <span>Bid Limit: <strong style={{ color: 'var(--accent-text)' }}>₹{tier.bidLimit.toLocaleString()}</strong></span>
                                                    <span>Order: <strong style={{ color: 'var(--text-secondary)' }}>{tier.order}</strong></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => startEditTier(tier)}
                                                style={{
                                                    width: '34px', height: '34px', borderRadius: '8px',
                                                    border: 'none', cursor: 'pointer',
                                                    background: 'rgba(59,130,246,0.1)', color: '#3b82f6',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'background 0.2s',
                                                }}
                                                title="Edit tier"
                                            >
                                                <Edit3 style={{ width: 14, height: 14 }} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTier(tier._id, tier.name)}
                                                style={{
                                                    width: '34px', height: '34px', borderRadius: '8px',
                                                    border: 'none', cursor: 'pointer',
                                                    background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'background 0.2s',
                                                }}
                                                title="Delete tier"
                                            >
                                                <Trash2 style={{ width: 14, height: 14 }} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <Layers style={{ width: 40, height: 40, color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                                <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No tiers configured</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Add your first tier to get started</p>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            <style jsx>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(-12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
