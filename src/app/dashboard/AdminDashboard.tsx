'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
    Loader2, Shield, Users, Package, Gavel, DollarSign, TrendingUp,
    UserCheck, Store, ShoppingBag, Clock, CheckCircle, Trash2,
    ChevronDown, Eye, Coins, AlertTriangle, Crown, Search,
    PlusCircle, Edit3, Layers, Lock, Unlock, RefreshCcw,
    Wallet, History, ArrowDownLeft, ArrowUpFromLine
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [tiers, setTiers] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<'overview' | 'sellers' | 'buyers' | 'auctions' | 'wallet' | 'tiers'>('overview');
    const [searchText, setSearchText] = useState('');

    // Tier form
    const [tierForm, setTierForm] = useState({ name: '', minBalance: '', bidLimit: '', order: '' });
    const [editingTierId, setEditingTierId] = useState<string | null>(null);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const [statsRes, tiersRes, txRes] = await Promise.all([
                fetch('/api/admin/stats'),
                fetch('/api/admin/tiers'),
                fetch('/api/wallet/transactions?limit=50'),
            ]);
            const [statsData, tiersData, txData] = await Promise.all([
                statsRes.json(), tiersRes.json(), txRes.json(),
            ]);
            setStats(statsData.stats);
            setUsers(statsData.users || []);
            setItems(statsData.items || []);
            setTiers(Array.isArray(tiersData) ? tiersData : []);
            setTransactions(txData.transactions || []);
        } catch { }
        setLoading(false);
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(`Role updated to ${newRole}`);
            fetchAll();
        } catch (err: any) { toast.error(err.message); }
    };

    const handleDeleteUser = async (userId: string, name: string) => {
        if (!confirm(`Delete user "${name}"?`)) return;
        try {
            const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success('User deleted');
            fetchAll();
        } catch (err: any) { toast.error(err.message); }
    };

    const handleCloseAuction = async (itemId: string) => {
        if (!confirm('Close this auction? Winner will be declared and deposits processed.')) return;
        try {
            const res = await fetch('/api/auctions/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(data.message);
            fetchAll();
        } catch (err: any) { toast.error(err.message); }
    };

    const handleTierSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const body = {
                name: tierForm.name,
                minBalance: parseFloat(tierForm.minBalance),
                bidLimit: parseFloat(tierForm.bidLimit),
                order: parseInt(tierForm.order) || 0,
                ...(editingTierId && { id: editingTierId }),
            };
            const res = await fetch('/api/admin/tiers', {
                method: editingTierId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(editingTierId ? 'Tier updated' : 'Tier created');
            setTierForm({ name: '', minBalance: '', bidLimit: '', order: '' });
            setEditingTierId(null);
            fetchAll();
        } catch (err: any) { toast.error(err.message); }
    };

    const handleDeleteTier = async (tierId: string) => {
        if (!confirm('Delete this tier?')) return;
        try {
            const res = await fetch(`/api/admin/tiers?id=${tierId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed');
            toast.success('Tier deleted');
            fetchAll();
        } catch (err: any) { toast.error(err.message); }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" />
            </div>
        );
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'credit': case 'refund': case 'unlock': return 'var(--success)';
            case 'debit': case 'payment': return 'var(--danger)';
            case 'lock': return 'var(--warning)';
            default: return 'var(--text-muted)';
        }
    };

    const formatDate = (d: string) => {
        const date = new Date(d);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' +
            date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const sellers = users.filter(u => u.role === 'Seller');
    const buyers = users.filter(u => u.role === 'Buyer');
    const filteredUsers = (activeSection === 'sellers' ? sellers : activeSection === 'buyers' ? buyers : users)
        .filter(u => !searchText || u.name?.toLowerCase().includes(searchText.toLowerCase()) || u.email?.toLowerCase().includes(searchText.toLowerCase()));

    const sidebarItems = [
        { key: 'overview', label: 'Overview', icon: <TrendingUp size={18} /> },
        { key: 'sellers', label: `Sellers (${sellers.length})`, icon: <Store size={18} /> },
        { key: 'buyers', label: `Buyers (${buyers.length})`, icon: <ShoppingBag size={18} /> },
        { key: 'auctions', label: `Auctions (${items.length})`, icon: <Gavel size={18} /> },
        { key: 'wallet', label: 'Wallet Logs', icon: <Wallet size={18} /> },
        { key: 'tiers', label: 'Tier Rules', icon: <Crown size={18} /> },
    ];

    return (
        <div style={{ display: 'flex', gap: '24px', minHeight: '70vh' }}>
            {/* Sidebar */}
            <div style={{
                width: '220px', flexShrink: 0,
                display: 'flex', flexDirection: 'column', gap: '4px',
            }}>
                <div style={{ marginBottom: '16px' }}>
                    <h1 style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={22} style={{ color: 'var(--accent)' }} />
                        Admin Panel
                    </h1>
                </div>
                {sidebarItems.map(item => (
                    <button key={item.key}
                        onClick={() => setActiveSection(item.key as any)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 14px', borderRadius: '12px',
                            border: 'none', cursor: 'pointer',
                            fontWeight: activeSection === item.key ? 700 : 500,
                            fontSize: '0.85rem',
                            background: activeSection === item.key ? 'var(--accent)' : 'transparent',
                            color: activeSection === item.key ? '#fff' : 'var(--text-secondary)',
                            transition: 'all 0.2s',
                            textAlign: 'left',
                        }}>
                        {item.icon} {item.label}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* === OVERVIEW === */}
                {activeSection === 'overview' && (
                    <>
                        <h2 style={{ fontWeight: 700 }}>Platform Overview</h2>
                        <div className="admin-overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                            {[
                                { label: 'Total Users', value: stats?.totalUsers || 0, icon: <Users size={20} />, color: 'var(--accent)' },
                                { label: 'Active Auctions', value: stats?.activeAuctions || 0, icon: <Package size={20} />, color: 'var(--success)' },
                                { label: 'Total Bids', value: stats?.totalBids || 0, icon: <Gavel size={20} />, color: '#ec4899' },
                                { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <TrendingUp size={20} />, color: 'var(--warning)' },
                                { label: 'Sellers', value: stats?.sellers || 0, icon: <Store size={20} />, color: '#8b5cf6' },
                                { label: 'Buyers', value: stats?.buyers || 0, icon: <ShoppingBag size={20} />, color: '#06b6d4' },
                                { label: 'Locked Deposits', value: `₹${(stats?.totalLockedDeposits || 0).toLocaleString()}`, icon: <Lock size={20} />, color: 'var(--warning)' },
                                { label: 'Transactions', value: stats?.totalTransactions || 0, icon: <History size={20} />, color: '#f97316' },
                            ].map((s, i) => (
                                <div key={i} className="card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: '10px',
                                        background: `${s.color}18`, display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', color: s.color,
                                    }}>{s.icon}</div>
                                    <div>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</p>
                                        <p style={{ fontSize: '1.15rem', fontWeight: 800 }}>{s.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Wallet Flow Summary */}
                        {stats?.walletFlow && (
                            <div className="card" style={{ padding: '20px' }}>
                                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Wallet size={18} style={{ color: 'var(--accent)' }} />
                                    Wallet Flow Summary
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                                    {Object.entries(stats.walletFlow).map(([type, data]: any) => (
                                        <div key={type} style={{
                                            padding: '12px', borderRadius: '10px',
                                            background: 'var(--bg-secondary)',
                                        }}>
                                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                                                {type}
                                            </p>
                                            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: getTypeColor(type) }}>
                                                ₹{data.total?.toLocaleString()}
                                            </p>
                                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{data.count} txns</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* === SELLERS / BUYERS === */}
                {(activeSection === 'sellers' || activeSection === 'buyers') && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontWeight: 700 }}>
                                {activeSection === 'sellers' ? 'Seller Management' : 'Buyer Management'}
                            </h2>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="input-field" placeholder="Search..."
                                    value={searchText} onChange={e => setSearchText(e.target.value)}
                                    style={{ paddingLeft: '36px', width: '240px' }} />
                            </div>
                        </div>
                        <div className="table-wrap">
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Name</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Email</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Wallet</th>
                                        {activeSection === 'buyers' && (
                                            <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Locked</th>
                                        )}
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Tier</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Role</th>
                                        <th style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length === 0 ? (
                                        <tr><td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No users found</td></tr>
                                    ) : filteredUsers.map((u: any) => (
                                        <tr key={u._id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                            <td style={{ padding: '10px', fontWeight: 600 }}>{u.name}</td>
                                            <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{u.email}</td>
                                            <td style={{ padding: '10px', fontWeight: 700 }}>₹{(u.walletBalance || 0).toLocaleString()}</td>
                                            {activeSection === 'buyers' && (
                                                <td style={{ padding: '10px', fontWeight: 600, color: 'var(--warning)' }}>₹{(u.lockedBalance || 0).toLocaleString()}</td>
                                            )}
                                            <td style={{ padding: '10px' }}>
                                                <span className="badge badge-accent">{u.tier || 'None'}</span>
                                            </td>
                                            <td style={{ padding: '10px' }}>
                                                <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                                                    style={{
                                                        background: 'var(--bg-input)', color: 'var(--text-primary)',
                                                        border: '1px solid var(--border-primary)', borderRadius: '8px',
                                                        padding: '4px 8px', fontSize: '0.78rem',
                                                    }}>
                                                    <option value="Buyer">Buyer</option>
                                                    <option value="Seller">Seller</option>
                                                    <option value="Admin">Admin</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                                <button onClick={() => handleDeleteUser(u._id, u.name)}
                                                    style={{
                                                        background: 'var(--danger-soft)', color: 'var(--danger)',
                                                        border: 'none', borderRadius: '8px', padding: '6px 10px',
                                                        cursor: 'pointer', fontSize: '0.78rem',
                                                    }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* === AUCTIONS === */}
                {activeSection === 'auctions' && (
                    <>
                        <h2 style={{ fontWeight: 700 }}>All Auctions</h2>
                        <div className="table-wrap">
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Title</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Seller</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Base</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Current</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Deposit %</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Ends</th>
                                        <th style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item: any) => {
                                        const isActive = item.status === 'Active' && new Date(item.endDate) > new Date();
                                        return (
                                            <tr key={item._id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                                <td style={{ padding: '10px', fontWeight: 600 }}>{item.title}</td>
                                                <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{item.seller?.name || '—'}</td>
                                                <td style={{ padding: '10px' }}>₹{item.startingPrice?.toLocaleString()}</td>
                                                <td style={{ padding: '10px', fontWeight: 700, color: 'var(--accent)' }}>₹{item.currentPrice?.toLocaleString()}</td>
                                                <td style={{ padding: '10px', color: 'var(--warning)', fontWeight: 600 }}>{item.securityPercentage || 5}%</td>
                                                <td style={{ padding: '10px' }}>
                                                    <span className={`badge ${item.status === 'Completed' ? 'badge-success' : isActive ? 'badge-accent' : 'badge-danger'}`}>
                                                        {item.status === 'Completed' ? '✓ Done' : isActive ? '● Live' : '⏱ Ended'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                    {formatDate(item.endDate)}
                                                </td>
                                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                                    {item.status !== 'Completed' && (
                                                        <button onClick={() => handleCloseAuction(item._id)}
                                                            className="btn-primary" style={{ padding: '5px 10px', fontSize: '0.75rem', background: 'var(--success)' }}>
                                                            Close
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* === WALLET LOGS === */}
                {activeSection === 'wallet' && (
                    <>
                        <h2 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Wallet size={22} style={{ color: 'var(--accent)' }} />
                            Wallet Transaction Logs
                        </h2>
                        <div className="table-wrap card" style={{ padding: '20px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>User</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Type</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Amount</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Description</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Auction</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length === 0 ? (
                                        <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions</td></tr>
                                    ) : transactions.map((tx: any) => (
                                        <tr key={tx._id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                            <td style={{ padding: '10px', fontWeight: 600 }}>{tx.user?.name || '—'}</td>
                                            <td style={{ padding: '10px' }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    padding: '3px 10px', borderRadius: '8px', fontSize: '0.72rem',
                                                    fontWeight: 700, color: getTypeColor(tx.type),
                                                    background: `${getTypeColor(tx.type)}15`,
                                                    textTransform: 'uppercase',
                                                }}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td style={{
                                                padding: '10px', fontWeight: 700,
                                                color: ['credit', 'refund'].includes(tx.type) ? 'var(--success)' : 'var(--danger)',
                                            }}>
                                                {['credit', 'refund'].includes(tx.type) ? '+' : '-'}₹{tx.amount?.toLocaleString()}
                                            </td>
                                            <td style={{ padding: '10px', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {tx.description}
                                            </td>
                                            <td style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                                {tx.auction?.title || '—'}
                                            </td>
                                            <td style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                                {formatDate(tx.createdAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* === TIER RULES === */}
                {activeSection === 'tiers' && (
                    <>
                        <h2 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Crown size={22} style={{ color: 'var(--accent)' }} />
                            Tier / Security Deposit Rules
                        </h2>

                        {/* Create / Edit Tier Form */}
                        <div className="card" style={{ padding: '24px' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '14px' }}>
                                {editingTierId ? 'Edit Tier' : 'Add New Tier'}
                            </h3>
                            <form onSubmit={handleTierSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', alignItems: 'end' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Tier Name</label>
                                    <input className="input-field" value={tierForm.name}
                                        onChange={e => setTierForm({ ...tierForm, name: e.target.value })}
                                        placeholder="e.g. Gold" required />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Min Balance (₹)</label>
                                    <input type="number" className="input-field" value={tierForm.minBalance}
                                        onChange={e => setTierForm({ ...tierForm, minBalance: e.target.value })}
                                        placeholder="e.g. 500" required />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Bid Limit (₹)</label>
                                    <input type="number" className="input-field" value={tierForm.bidLimit}
                                        onChange={e => setTierForm({ ...tierForm, bidLimit: e.target.value })}
                                        placeholder="e.g. 100000" required />
                                </div>
                                <div>
                                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                                        {editingTierId ? 'Update' : 'Add Tier'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Existing Tiers */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '14px' }}>
                            {tiers.map((tier: any) => (
                                <div key={tier._id} className="card" style={{ padding: '18px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Crown size={16} style={{ color: 'var(--warning)' }} />
                                            {tier.name}
                                        </h4>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button onClick={() => {
                                                setEditingTierId(tier._id);
                                                setTierForm({ name: tier.name, minBalance: String(tier.minBalance), bidLimit: String(tier.bidLimit), order: String(tier.order || 0) });
                                            }}
                                                style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}>
                                                <Edit3 size={12} />
                                            </button>
                                            <button onClick={() => handleDeleteTier(tier._id)}
                                                style={{ background: 'var(--danger-soft)', color: 'var(--danger)', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}>
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Min Balance: ₹{tier.minBalance?.toLocaleString()}</p>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Bid Limit: ₹{tier.bidLimit?.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
