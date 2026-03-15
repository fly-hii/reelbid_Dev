'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    Loader2, Shield, Users, Package, Gavel, DollarSign, TrendingUp,
    UserCheck, Store, ShoppingBag, Clock, CheckCircle, Trash2,
    ChevronDown, Eye, Coins, AlertTriangle, Crown, Search,
    PlusCircle, Edit3, Layers, Lock, Unlock, RefreshCcw,
    Wallet, History, ArrowDownLeft, ArrowUpFromLine, XCircle, X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [tiers, setTiers] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [withdrawRequests, setWithdrawRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<'overview' | 'sellers' | 'buyers' | 'auctions' | 'wallet' | 'withdrawals' | 'tiers'>('overview');
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        setSearchText('');
    }, [activeSection]);

    // Tier form
    const [tierForm, setTierForm] = useState({ name: '', minBalance: '', bidLimit: '', order: '' });
    const [editingTierId, setEditingTierId] = useState<string | null>(null);

    // Auction creation form
    const [showCreateAuction, setShowCreateAuction] = useState(false);
    const [auctionForm, setAuctionForm] = useState({ title: '', movieName: '', description: '', startingPrice: '', securityPercentage: '5', category: 'General', endDate: '', platformFeeType: 'percentage', platformFeeValue: '0' });
    const [auctionImages, setAuctionImages] = useState<string[]>([]);
    const [revenueShares, setRevenueShares] = useState<{ sellerId: string, percentage: string, professionalRole: string, name?: string }[]>([]);
    const [creatingAuction, setCreatingAuction] = useState(false);

    // Revenue Share input states
    const [sellerSearch, setSellerSearch] = useState('');
    const [selectedSellerId, setSelectedSellerId] = useState('');
    const [revPercentage, setRevPercentage] = useState('');
    const [revRole, setRevRole] = useState('');

    // Seller creation / editing
    const [showSellerForm, setShowSellerForm] = useState(false);
    const [editingSellerId, setEditingSellerId] = useState<string | null>(null);
    const [savingSeller, setSavingSeller] = useState(false);
    const [sellerForm, setSellerForm] = useState({ name: '', email: '', password: '', phone: '', address: '', city: '', state: '', pincode: '' });
    
    const handleAddRevenueShare = () => {
        if (!selectedSellerId || !revPercentage || !revRole) return toast.error('Fill all share details');
        
        if (revenueShares.some(s => s.sellerId === selectedSellerId)) {
            return toast.error('This seller has already been added. Remove them first if you want to change their details.');
        }

        let currentTotal = revenueShares.reduce((sum, s) => sum + parseFloat(s.percentage || '0'), 0);
        let platformPct = auctionForm.platformFeeType === 'percentage' ? parseFloat(auctionForm.platformFeeValue || '0') : 0;
        let tryingToAdd = parseFloat(revPercentage);
        
        if (currentTotal + platformPct + tryingToAdd > 100) {
            return toast.error(`Total percentage cannot exceed 100%. Remaining allowed: ${100 - currentTotal - platformPct}%`);
        }

        const seller = users.find(u => u._id === selectedSellerId);
        if (!seller) return;
        setRevenueShares(prev => [...prev, { sellerId: selectedSellerId, percentage: revPercentage, professionalRole: revRole, name: seller.name }]);
        setSelectedSellerId('');
        setSellerSearch('');
        setRevPercentage('');
        setRevRole('');
    };

    const handleAddAuction = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let currentTotal = revenueShares.reduce((sum, s) => sum + parseFloat(s.percentage || '0'), 0);
        let platformPct = auctionForm.platformFeeType === 'percentage' ? parseFloat(auctionForm.platformFeeValue || '0') : 0;
        
        if (currentTotal + platformPct > 100) {
            return toast.error(`Total shares + platform fee cannot exceed 100%. Please adjust. (Current: ${currentTotal + platformPct}%)`);
        }

        if (currentTotal + platformPct < 100) {
            return toast.error(`Total shares + platform fee must add up to exactly 100%. You still have ${100 - currentTotal - platformPct}% to assign!`);
        }

        if (!auctionForm.title || !auctionForm.description || !auctionForm.startingPrice || !auctionForm.endDate) {
            return toast.error('Fill all required fields including end date');
        }
        setCreatingAuction(true);
        try {
            const now = new Date();
            const endDate = new Date(auctionForm.endDate);
            
            if (endDate <= now) {
                setCreatingAuction(false);
                return toast.error('End date must be in the future');
            }

            const payload = {
                title: auctionForm.title,
                movieName: auctionForm.movieName,
                description: auctionForm.description,
                startingPrice: parseFloat(auctionForm.startingPrice),
                securityPercentage: parseFloat(auctionForm.securityPercentage),
                category: auctionForm.category,
                images: auctionImages,
                startDate: now.toISOString(),
                endDate: endDate.toISOString(),
                platformFeeType: auctionForm.platformFeeType,
                platformFeeValue: parseFloat(auctionForm.platformFeeValue || '0'),
                revenueShares: revenueShares.map(s => ({ ...s, percentage: parseFloat(s.percentage) }))
            };

            const res = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success('Auction created and is now Active!');
            setShowCreateAuction(false);
            setAuctionForm({ title: '', movieName: '', description: '', startingPrice: '', securityPercentage: '5', category: 'General', endDate: '', platformFeeType: 'percentage', platformFeeValue: '0' });
            setAuctionImages([]);
            setRevPercentage('');
            setRevRole('');
            setSellerSearch('');
            setRevenueShares([]);
            fetchAll();
        } catch (error: any) {
            toast.error(error.message);
        }
        setCreatingAuction(false);
    };

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const [statsRes, tiersRes, txRes, withdrawalsRes] = await Promise.all([
                fetch('/api/admin/stats'),
                fetch('/api/admin/tiers'),
                fetch('/api/wallet/transactions?limit=50'),
                fetch('/api/admin/withdrawals'),
            ]);
            const [statsData, tiersData, txData, withdrawalsData] = await Promise.all([
                statsRes.json(), tiersRes.json(), txRes.json(), withdrawalsRes.json()
            ]);
            setStats(statsData.stats);
            setUsers(statsData.users || []);
            setItems(statsData.items || []);
            setTiers(Array.isArray(tiersData) ? tiersData : []);
            setTransactions(txData.transactions || []);
            setWithdrawRequests(Array.isArray(withdrawalsData) ? withdrawalsData : []);
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
            toast.success(`User ${name} deleted`);
            fetchAll();
        } catch (err: any) { toast.error(err.message); }
    };

    const handleSellerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSeller(true);
        try {
            const url = '/api/admin/users';
            const method = editingSellerId ? 'PUT' : 'POST';
            const payload = editingSellerId 
                ? { userId: editingSellerId, ...sellerForm }
                : { ...sellerForm, role: 'Seller' };
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            
            toast.success(editingSellerId ? 'Seller updated successfully' : 'Seller created successfully');
            setShowSellerForm(false);
            setEditingSellerId(null);
            setSellerForm({ name: '', email: '', password: '', phone: '', address: '', city: '', state: '', pincode: '' });
            fetchAll();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSavingSeller(false);
        }
    };

    const handleEditSellerClick = (seller: any) => {
        setSellerForm({
            name: seller.name || '',
            email: seller.email || '',
            password: '', 
            phone: seller.phone || '',
            address: seller.address || '',
            city: seller.city || '',
            state: seller.state || '',
            pincode: seller.pincode || '',
        });
        setEditingSellerId(seller._id);
        setShowSellerForm(true);
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

    const handleApproveAuction = async (itemId: string) => {
        if (!confirm('Approve this auction? It will become visible and open for bidding.')) return;
        try {
            const res = await fetch('/api/items', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, status: 'Active' }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success('Auction approved and is now active.');
            fetchAll();
        } catch (err: any) { toast.error(err.message); }
    };

    const handleRejectAuction = async (itemId: string) => {
        if (!confirm('Reject this auction? It will be cancelled.')) return;
        try {
            const res = await fetch('/api/items', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, status: 'Cancelled' }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success('Auction rejected and cancelled.');
            fetchAll();
        } catch (err: any) { toast.error(err.message); }
    };

    const handleDeleteAuction = async (itemId: string) => {
        if (!confirm('Are you sure you want to delete this auction? This action cannot be undone.')) return;
        try {
            const res = await fetch(`/api/items?itemId=${itemId}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(data.message || 'Auction deleted successfully');
            fetchAll();
        } catch (err: any) {
            toast.error(err.message);
        }
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

    const handleWithdrawalAction = async (id: string, status: 'approved' | 'rejected') => {
        let adminNotes = '';
        if (status === 'rejected') {
            const reason = prompt('Reason for rejection:');
            if (reason === null) return; // user cancelled
            adminNotes = reason;
        } else {
            if (!confirm('Are you sure you want to change this withdrawal request status to Approved? Did you manually transfer the money outside of ReelBid?')) return;
        }

        try {
            const res = await fetch(`/api/admin/withdrawals/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, adminNotes }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(`Withdrawal ${status}`);
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

    const filteredItems = items.filter(item => !searchText || item.title?.toLowerCase().includes(searchText.toLowerCase()) || item.seller?.name?.toLowerCase().includes(searchText.toLowerCase()));

    const filteredTransactions = transactions.filter(tx => !searchText || tx.user?.name?.toLowerCase().includes(searchText.toLowerCase()) || tx.description?.toLowerCase().includes(searchText.toLowerCase()) || tx.type?.toLowerCase().includes(searchText.toLowerCase()));

    const filteredWithdrawRequests = withdrawRequests.filter(wr => !searchText || (wr.user?.name || '').toLowerCase().includes(searchText.toLowerCase()) || wr.bankName?.toLowerCase().includes(searchText.toLowerCase()));

    const sidebarItems = [
        { key: 'overview', label: 'Overview', icon: <TrendingUp size={18} /> },
        { key: 'sellers', label: `Sellers (${sellers.length})`, icon: <Store size={18} /> },
        { key: 'buyers', label: `Buyers (${buyers.length})`, icon: <ShoppingBag size={18} /> },
        { key: 'auctions', label: `Auctions (${items.length})`, icon: <Gavel size={18} /> },
        { key: 'wallet', label: 'Wallet Logs', icon: <Wallet size={18} /> },
        { key: 'withdrawals', label: 'Withdrawals', icon: <ArrowUpFromLine size={18} /> },
        { key: 'tiers', label: 'Tier Rules', icon: <Crown size={18} /> },
    ];

    return (
        <div style={{ display: 'flex', gap: '24px', minHeight: '70vh' }}>
            {/* Sidebar */}
            <div className="dash-sidebar" style={{
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
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                {activeSection === 'sellers' && (
                                    <button onClick={() => {
                                        if (showSellerForm) {
                                            setShowSellerForm(false);
                                            setEditingSellerId(null);
                                            setSellerForm({ name: '', email: '', password: '', phone: '', address: '', city: '', state: '', pincode: '' });
                                        } else {
                                            setShowSellerForm(true);
                                            setEditingSellerId(null);
                                            setSellerForm({ name: '', email: '', password: '', phone: '', address: '', city: '', state: '', pincode: '' });
                                        }
                                    }}
                                        className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <PlusCircle size={16} />
                                        {showSellerForm ? 'Cancel' : 'Add Seller'}
                                    </button>
                                )}
                                <div style={{ position: 'relative' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input className="input-field" placeholder="Search users..."
                                        value={searchText} onChange={e => setSearchText(e.target.value)}
                                        style={{ paddingLeft: '36px', width: '240px' }} />
                                </div>
                            </div>
                        </div>

                        {activeSection === 'sellers' && showSellerForm && (
                            <div className="card animate-slide-up" style={{ padding: '24px', marginTop: '16px', marginBottom: '24px', background: 'var(--bg-card)' }}>
                                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {editingSellerId ? <Edit3 size={18} /> : <PlusCircle size={18} />}
                                    {editingSellerId ? 'Edit Seller Details' : 'Create New Seller'}
                                </h3>
                                <form onSubmit={handleSellerSubmit}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Full Name *</label>
                                            <input className="input-field" value={sellerForm.name} onChange={e => setSellerForm({ ...sellerForm, name: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Email Address *</label>
                                            <input type="email" className="input-field" value={sellerForm.email} onChange={e => setSellerForm({ ...sellerForm, email: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                                Password {editingSellerId ? '(Leave blank to keep current)' : '*'}
                                            </label>
                                            <input type="password" className="input-field" value={sellerForm.password} onChange={e => setSellerForm({ ...sellerForm, password: e.target.value })} required={!editingSellerId} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Phone Number</label>
                                            <input type="tel" className="input-field" value={sellerForm.phone} onChange={e => setSellerForm({ ...sellerForm, phone: e.target.value })} />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Street Address</label>
                                            <input className="input-field" value={sellerForm.address} onChange={e => setSellerForm({ ...sellerForm, address: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>City, State</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <input className="input-field" value={sellerForm.city} onChange={e => setSellerForm({ ...sellerForm, city: e.target.value })} placeholder="City" style={{ flex: 1 }} />
                                                <input className="input-field" value={sellerForm.state} onChange={e => setSellerForm({ ...sellerForm, state: e.target.value })} placeholder="State" style={{ flex: 1 }} />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Pincode</label>
                                            <input className="input-field" value={sellerForm.pincode} onChange={e => setSellerForm({ ...sellerForm, pincode: e.target.value })} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                        <button type="button" className="btn-secondary" onClick={() => {
                                            setShowSellerForm(false);
                                            setEditingSellerId(null);
                                            setSellerForm({ name: '', email: '', password: '', phone: '', address: '', city: '', state: '', pincode: '' });
                                        }}>Cancel</button>
                                        <button type="submit" className="btn-primary" disabled={savingSeller}>
                                            {savingSeller ? <Loader2 size={16} className="animate-spin" /> : (editingSellerId ? 'Update Seller' : 'Save Seller')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

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
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    {activeSection === 'sellers' && (
                                                        <button onClick={() => handleEditSellerClick(u)}
                                                            style={{
                                                                background: 'var(--accent-soft)', color: 'var(--accent)',
                                                                border: 'none', borderRadius: '8px', padding: '6px 10px',
                                                                cursor: 'pointer', fontSize: '0.78rem',
                                                            }}>
                                                            <Edit3 size={14} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDeleteUser(u._id, u.name)}
                                                        style={{
                                                            background: 'var(--danger-soft)', color: 'var(--danger)',
                                                            border: 'none', borderRadius: '8px', padding: '6px 10px',
                                                            cursor: 'pointer', fontSize: '0.78rem',
                                                        }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontWeight: 700 }}>All Auctions</h2>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <button onClick={() => setShowCreateAuction(!showCreateAuction)}
                                    className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <PlusCircle size={16} />
                                    {showCreateAuction ? 'Cancel' : 'New Auction'}
                                </button>
                                <div style={{ position: 'relative' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input className="input-field" placeholder="Search auctions..."
                                        value={searchText} onChange={e => setSearchText(e.target.value)}
                                        style={{ paddingLeft: '36px', width: '240px' }} />
                                </div>
                            </div>
                        </div>

                        {showCreateAuction && (
                            <div className="card animate-slide-up" style={{ padding: '28px', marginTop: '16px', background: 'var(--bg-card)' }}>
                                <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <PlusCircle size={20} style={{ color: 'var(--accent)' }} /> Create New Auction
                                </h3>
                                <form onSubmit={handleAddAuction}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Title *</label>
                                            <input className="input-field" value={auctionForm.title} onChange={e => setAuctionForm({ ...auctionForm, title: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Movie Name</label>
                                            <input className="input-field" value={auctionForm.movieName} onChange={e => setAuctionForm({ ...auctionForm, movieName: e.target.value })} placeholder="e.g. Pushpa 2, RRR..." />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Category</label>
                                            <select className="input-field" value={auctionForm.category} onChange={e => setAuctionForm({ ...auctionForm, category: e.target.value })}>
                                                <option value="General">General</option>
                                                <option value="Clothing">Clothing</option>
                                                <option value="Vehicles">Vehicles</option>
                                                <option value="Props">Props</option>
                                            </select>
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Description *</label>
                                            <textarea className="input-field" rows={2} value={auctionForm.description} onChange={e => setAuctionForm({ ...auctionForm, description: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Base Price (₹) *</label>
                                            <input type="number" className="input-field" value={auctionForm.startingPrice} onChange={e => setAuctionForm({ ...auctionForm, startingPrice: e.target.value })} min="1" required />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Deposit (%) *</label>
                                            <input type="number" className="input-field" value={auctionForm.securityPercentage} onChange={e => setAuctionForm({ ...auctionForm, securityPercentage: e.target.value })} min="1" max="50" required />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>End Date & Time *</label>
                                            <input 
                                                type="datetime-local" 
                                                className="input-field" 
                                                value={auctionForm.endDate} 
                                                onChange={e => setAuctionForm({ ...auctionForm, endDate: e.target.value })} 
                                                min={new Date().toISOString().slice(0, 16)}
                                                required 
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Platform Fee Type</label>
                                            <select className="input-field" value={auctionForm.platformFeeType} onChange={e => setAuctionForm({ ...auctionForm, platformFeeType: e.target.value })}>
                                                <option value="percentage">Percentage (%)</option>
                                                <option value="fixed">Fixed Amount (₹)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                                Platform Fee Value {auctionForm.platformFeeType === 'percentage' ? '(%)' : '(₹)'}
                                            </label>
                                            <input type="number" className="input-field" value={auctionForm.platformFeeValue} onChange={e => setAuctionForm({ ...auctionForm, platformFeeValue: e.target.value })} min="0" required />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Upload Images</label>
                                            <input type="file" multiple accept="image/*" className="input-field" onChange={(e) => {
                                                const files = Array.from(e.target.files || []).slice(0, 3);
                                                const newImages: string[] = [];
                                                let count = 0;
                                                files.forEach(file => {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        newImages.push(reader.result as string);
                                                        count++;
                                                        if (count === files.length) {
                                                            setAuctionImages(prev => [...prev, ...newImages].slice(0, 3));
                                                        }
                                                    };
                                                    reader.readAsDataURL(file);
                                                });
                                            }} />
                                            {auctionImages.length > 0 && (
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                                    {auctionImages.map((img, i) => <img key={i} src={img} alt="preview" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '16px', marginBottom: '24px' }}>
                                        <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '12px' }}>Revenue Shares</h4>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'end', marginBottom: '12px', flexWrap: 'wrap' }}>
                                            <div style={{ flex: 1, minWidth: '220px' }}>
                                                <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                                                    <input type="text" className="input-field" style={{ padding: '6px 10px', fontSize: '0.75rem' }} placeholder="Search Seller Name..." value={sellerSearch} onChange={e => setSellerSearch(e.target.value)} />
                                                </div>
                                                <select className="input-field" value={selectedSellerId} onChange={e => setSelectedSellerId(e.target.value)}>
                                                    <option value="">-- Choose Seller --</option>
                                                    {users.filter(u => u.role === 'Seller' && (u.name.toLowerCase().includes(sellerSearch.toLowerCase()) || u.email.toLowerCase().includes(sellerSearch.toLowerCase()))).map(u => (
                                                        <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div style={{ width: '100px' }}>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Share (%)</label>
                                                <input type="number" className="input-field" value={revPercentage} onChange={e => setRevPercentage(e.target.value)} min="1" max="100" />
                                            </div>
                                            <div style={{ width: '130px' }}>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Profession / Role</label>
                                                <input type="text" list="professionsList" className="input-field" value={revRole} onChange={e => setRevRole(e.target.value)} placeholder="Search..." />
                                                <datalist id="professionsList">
                                                    <option value="Hero" />
                                                    <option value="Heroine" />
                                                    <option value="Producer" />
                                                    <option value="Director" />
                                                    <option value="Music Director" />
                                                    <option value="Supporting Actor" />
                                                    <option value="Comedian" />
                                                    <option value="Cinematographer" />
                                                    <option value="Editor" />
                                                </datalist>
                                            </div>
                                            <button type="button" onClick={handleAddRevenueShare} className="btn-secondary" style={{ padding: '10px 16px' }}>Add</button>
                                        </div>
                                        
                                        <div style={{ marginBottom: '12px', padding: '8px 12px', background: 'var(--accent-soft)', color: 'var(--accent-text)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-block' }}>
                                            Remaining share to assign: {100 - revenueShares.reduce((sum, s) => sum + parseFloat(s.percentage || '0'), 0) - (auctionForm.platformFeeType === 'percentage' ? parseFloat(auctionForm.platformFeeValue || '0') : 0)}%
                                        </div>

                                        {revenueShares.length > 0 && (
                                            <div style={{ background: 'var(--bg-page)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-primary)' }}>
                                                {revenueShares.map((rs, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: idx < revenueShares.length - 1 ? '1px solid var(--border-primary)' : 'none' }}>
                                                        <div><span style={{ fontWeight: 600 }}>{rs.name}</span> <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({rs.professionalRole})</span></div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <strong style={{ color: 'var(--success)' }}>{rs.percentage}%</strong>
                                                            <button type="button" onClick={() => setRevenueShares(prev => prev.filter((_, i) => i !== idx))}
                                                                style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div style={{ marginTop: '8px', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    Total assigned: <strong>{revenueShares.reduce((sum, s) => sum + parseFloat(s.percentage || '0'), 0)}%</strong>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                        <button type="button" onClick={() => setShowCreateAuction(false)} className="btn-secondary">Cancel</button>
                                        <button type="submit" className="btn-primary" disabled={creatingAuction}>
                                            {creatingAuction ? 'Creating...' : 'Create Auction & Publish'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="table-wrap" style={{ marginTop: '16px' }}>
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
                                    {filteredItems.length === 0 ? (
                                        <tr><td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No auctions found</td></tr>
                                    ) : filteredItems.map((item: any) => {
                                        const isActive = item.status === 'Active' && new Date(item.endDate) > new Date();
                                        return (
                                            <tr key={item._id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                                <td style={{ padding: '10px', fontWeight: 600 }}>{item.title}</td>
                                                <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{item.seller?.name || '—'}</td>
                                                <td style={{ padding: '10px' }}>₹{item.startingPrice?.toLocaleString()}</td>
                                                <td style={{ padding: '10px', fontWeight: 700, color: 'var(--accent)' }}>₹{item.currentPrice?.toLocaleString()}</td>
                                                <td style={{ padding: '10px', color: 'var(--warning)', fontWeight: 600 }}>{item.securityPercentage || 5}%</td>
                                                <td style={{ padding: '10px' }}>
                                                    <span className={`badge ${item.status === 'Completed' ? 'badge-success' : isActive ? 'badge-accent' : item.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                                                        {item.status === 'Completed' ? '✓ Done' : isActive ? '● Live' : item.status === 'Pending' ? 'Waiting Approval' : `⏱ ${item.status}`}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                    {formatDate(item.endDate)}
                                                </td>
                                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                        <Link href={`/auctions/${item._id}`}>
                                                            <button title="View Auction" className="btn-secondary" style={{ padding: '5px 8px', fontSize: '0.75rem' }}>
                                                                <Eye size={14} />
                                                            </button>
                                                        </Link>
                                                        
                                                        {item.status === 'Completed' && (
                                                            <Link href={`/dashboard/auction/${item._id}`}>
                                                                <button title="Manage Leads" className="btn-primary" style={{ padding: '5px 8px', fontSize: '0.75rem', background: 'var(--accent)' }}>
                                                                    <Users size={14} />
                                                                </button>
                                                            </Link>
                                                        )}

                                                        {item.status === 'Pending' && (
                                                            <>
                                                                <button onClick={() => handleApproveAuction(item._id)}
                                                                    title="Approve" className="btn-primary" style={{ padding: '5px 8px', fontSize: '0.75rem', background: 'var(--success)' }}>
                                                                    <CheckCircle size={14} />
                                                                </button>
                                                                <button onClick={() => handleRejectAuction(item._id)}
                                                                    title="Reject" className="btn-primary" style={{ padding: '5px 8px', fontSize: '0.75rem', background: 'var(--danger)' }}>
                                                                    <XCircle size={14} />
                                                                </button>
                                                            </>
                                                        )}
                                                        
                                                        {item.status === 'Active' && !isActive && (
                                                            <button onClick={() => handleCloseAuction(item._id)}
                                                                title="Close Auction" className="btn-primary" style={{ padding: '5px 8px', fontSize: '0.75rem', background: 'var(--success)' }}>
                                                                <CheckCircle size={14} />
                                                            </button>
                                                        )}

                                                        <button onClick={() => handleDeleteAuction(item._id)}
                                                            title="Delete Auction" className="btn-primary" style={{ padding: '5px 8px', fontSize: '0.75rem', background: 'var(--danger-soft)', color: 'var(--danger)' }}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Wallet size={22} style={{ color: 'var(--accent)' }} />
                                Wallet Transaction Logs
                            </h2>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="input-field" placeholder="Search logs..."
                                    value={searchText} onChange={e => setSearchText(e.target.value)}
                                    style={{ paddingLeft: '36px', width: '240px' }} />
                            </div>
                        </div>
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
                                    {filteredTransactions.length === 0 ? (
                                        <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found</td></tr>
                                    ) : filteredTransactions.map((tx: any) => (
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

                {/* === WITHDRAWALS === */}
                {activeSection === 'withdrawals' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ArrowUpFromLine size={22} style={{ color: 'var(--accent)' }} />
                                User Withdrawal Requests
                            </h2>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="input-field" placeholder="Search requests..."
                                    value={searchText} onChange={e => setSearchText(e.target.value)}
                                    style={{ paddingLeft: '36px', width: '240px' }} />
                            </div>
                        </div>
                        <div className="table-wrap card" style={{ padding: '20px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Date</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>User</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Amount</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Bank Details</th>
                                        <th style={{ padding: '10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                                        <th style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredWithdrawRequests.length === 0 ? (
                                        <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No withdraw requests found</td></tr>
                                    ) : filteredWithdrawRequests.map((wr: any) => (
                                        <tr key={wr._id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                            <td style={{ padding: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                {formatDate(wr.createdAt)}
                                            </td>
                                            <td style={{ padding: '10px', fontWeight: 600 }}>
                                                {wr.user?.name || '—'}<br />
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{wr.user?.phone || wr.user?.email || ''}</span>
                                            </td>
                                            <td style={{ padding: '10px', fontWeight: 700, fontSize: '0.9rem' }}>
                                                ₹{wr.amount?.toLocaleString()}
                                            </td>
                                            <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>
                                                <strong>{wr.bankName}</strong><br />
                                                Name: {wr.accountName}<br />
                                                A/c: {wr.accountNumber}<br />
                                                IFSC: {wr.ifscCode}
                                            </td>
                                            <td style={{ padding: '10px' }}>
                                                <span className={`badge ${wr.status === 'pending' ? 'badge-warning' : wr.status === 'approved' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                                                    {wr.status.toUpperCase()}
                                                </span>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{wr.adminNotes}</div>
                                            </td>
                                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                                {wr.status === 'pending' && (
                                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                        <button onClick={() => handleWithdrawalAction(wr._id, 'approved')}
                                                            className="btn-primary" style={{ padding: '5px 10px', fontSize: '0.75rem', background: 'var(--success)' }}>
                                                            Approve
                                                        </button>
                                                        <button onClick={() => handleWithdrawalAction(wr._id, 'rejected')}
                                                            className="btn-primary" style={{ padding: '5px 10px', fontSize: '0.75rem', background: 'var(--danger)' }}>
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
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
