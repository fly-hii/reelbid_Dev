'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
    Loader2, Star, Users, PlusCircle, Edit3, Trash2, MapPin,
    Image, Eye, Camera, Phone, Award, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function PresidentDashboard() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [association, setAssociation] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
    const [savingMember, setSavingMember] = useState(false);
    const [memberForm, setMemberForm] = useState({
        title: 'Sri', name: '', designation: '', phone: '', order: '0'
    });
    const [memberPhoto, setMemberPhoto] = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const userId = (session?.user as any)?.id;
            if (!userId) return;

            const assocRes = await fetch(`/api/fan-associations?presidentId=${userId}`);
            const assocData = await assocRes.json();
            const assoc = assocData.associations?.[0];

            if (assoc) {
                setAssociation(assoc);
                const membersRes = await fetch(`/api/fan-members?associationId=${assoc._id}`);
                const membersData = await membersRes.json();
                setMembers(membersData.members || []);
            }
        } catch { }
        setLoading(false);
    };

    const handleMemberSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!association) return;
        setSavingMember(true);

        try {
            if (editingMemberId) {
                const res = await fetch('/api/fan-members', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        memberId: editingMemberId,
                        title: memberForm.title,
                        name: memberForm.name,
                        designation: memberForm.designation,
                        phone: memberForm.phone,
                        photo: memberPhoto,
                        order: parseInt(memberForm.order) || 0,
                    })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                toast.success('Member updated!');
            } else {
                const res = await fetch('/api/fan-members', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        associationId: association._id,
                        title: memberForm.title,
                        name: memberForm.name,
                        designation: memberForm.designation,
                        phone: memberForm.phone,
                        photo: memberPhoto,
                        order: parseInt(memberForm.order) || 0,
                    })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                toast.success('Member added!');
            }
            setShowMemberForm(false);
            setEditingMemberId(null);
            setMemberForm({ title: 'Sri', name: '', designation: '', phone: '', order: '0' });
            setMemberPhoto('');
            fetchData();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSavingMember(false);
        }
    };

    const handleDeleteMember = async (id: string) => {
        if (!confirm('Delete this member?')) return;
        try {
            const res = await fetch(`/api/fan-members?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success('Member deleted');
            fetchData();
        } catch (err: any) { toast.error(err.message); }
    };

    const handleEditMember = (member: any) => {
        setEditingMemberId(member._id);
        setMemberForm({
            title: member.title || 'Sri',
            name: member.name || '',
            designation: member.designation || '',
            phone: member.phone || '',
            order: String(member.order || 0),
        });
        setMemberPhoto(member.photo || '');
        setShowMemberForm(true);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" />
            </div>
        );
    }

    if (!association) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Star size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>No Fan Association Found</h2>
                <p style={{ color: 'var(--text-muted)' }}>Contact the admin to assign you a fan association.</p>
            </div>
        );
    }

    const designationOptions = [
        'Vice President', 'Secretary', 'Joint Secretary', 'Treasurer',
        'General Secretary', 'Executive Member', 'Youth Wing President',
        'Youth Wing Secretary', 'Women Wing President', 'Social Media Head',
        'District Coordinator', 'Area Coordinator', 'Ward Leader', 'Member'
    ];

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header Card */}
            <div className="card" style={{ overflow: 'hidden', marginBottom: '24px' }}>
                <div style={{
                    height: '120px',
                    background: association.bannerImage
                        ? `url(${association.bannerImage}) center/cover`
                        : `linear-gradient(135deg, ${association.themeColor || 'var(--accent)'}, ${association.themeColor || 'var(--accent)'}88)`,
                    position: 'relative',
                }}>
                    {association.heroImage && (
                        <img src={association.heroImage} alt={association.heroName}
                            style={{
                                width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover',
                                border: '4px solid var(--bg-card)', position: 'absolute', bottom: '-40px', left: '32px',
                                boxShadow: 'var(--shadow-floating)',
                            }} />
                    )}
                </div>
                <div style={{ padding: '48px 32px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>
                                <span className="gradient-text">{association.heroName}</span> Fans Association
                            </h1>
                            <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                                <MapPin size={14} /> {association.areaName}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Link href={`/fans/${association.slug}`} target="_blank">
                                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px' }}>
                                    <Eye size={16} /> View Public Page
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '10px',
                                background: 'var(--accent-soft)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
                            }}><Users size={18} /></div>
                            <div>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>Members</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 800 }}>{members.length}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '10px',
                                background: 'var(--success-soft)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', color: 'var(--success)',
                            }}><Award size={18} /></div>
                            <div>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)' }}>Active</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Members Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={22} style={{ color: 'var(--accent)' }} />
                    Association Members
                </h2>
                <button onClick={() => {
                    if (showMemberForm) {
                        setShowMemberForm(false);
                        setEditingMemberId(null);
                        setMemberForm({ title: 'Sri', name: '', designation: '', phone: '', order: '0' });
                        setMemberPhoto('');
                    } else {
                        setShowMemberForm(true);
                        setEditingMemberId(null);
                    }
                }}
                    className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <PlusCircle size={16} />
                    {showMemberForm ? 'Cancel' : 'Add Member'}
                </button>
            </div>

            {/* Member Form */}
            {showMemberForm && (
                <div className="card animate-slide-up" style={{ padding: '24px', marginBottom: '20px' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {editingMemberId ? <Edit3 size={18} /> : <PlusCircle size={18} style={{ color: 'var(--accent)' }} />}
                        {editingMemberId ? 'Edit Member' : 'Add New Member'}
                    </h3>
                    <form onSubmit={handleMemberSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Title *</label>
                                <select className="input-field" value={memberForm.title} onChange={e => setMemberForm({ ...memberForm, title: e.target.value })}>
                                    <option value="Sri">Sri</option>
                                    <option value="Smt">Smt</option>
                                    <option value="Mr.">Mr.</option>
                                    <option value="Mrs.">Mrs.</option>
                                    <option value="Ms.">Ms.</option>
                                    <option value="Dr.">Dr.</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Full Name *</label>
                                <input className="input-field" value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} required placeholder="Enter full name" />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Designation *</label>
                                <select className="input-field" value={memberForm.designation} onChange={e => setMemberForm({ ...memberForm, designation: e.target.value })} required>
                                    <option value="">-- Select --</option>
                                    {designationOptions.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '14px', marginBottom: '14px' }}>
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Phone</label>
                                <input type="tel" className="input-field" value={memberForm.phone} onChange={e => setMemberForm({ ...memberForm, phone: e.target.value })} placeholder="Phone number" />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Photo</label>
                                <input type="file" accept="image/*" className="input-field" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => setMemberPhoto(reader.result as string);
                                        reader.readAsDataURL(file);
                                    }
                                }} />
                                {memberPhoto && <img src={memberPhoto} alt="preview" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginTop: '6px' }} />}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Order</label>
                                <input type="number" className="input-field" value={memberForm.order} onChange={e => setMemberForm({ ...memberForm, order: e.target.value })} min="0" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" className="btn-secondary" onClick={() => {
                                setShowMemberForm(false);
                                setEditingMemberId(null);
                                setMemberForm({ title: 'Sri', name: '', designation: '', phone: '', order: '0' });
                                setMemberPhoto('');
                            }}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={savingMember}>
                                {savingMember ? <Loader2 size={16} className="animate-spin" /> : (editingMemberId ? 'Update Member' : 'Add Member')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Members Grid */}
            {members.length === 0 ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                    <Users size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                    <p style={{ color: 'var(--text-muted)' }}>No members added yet. Click "Add Member" to get started!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                    {members.map((member: any) => (
                        <div key={member._id} className="card" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                            {member.photo ? (
                                <img src={member.photo} alt={member.name}
                                    style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border-primary)' }} />
                            ) : (
                                <div style={{
                                    width: '50px', height: '50px', borderRadius: '50%', flexShrink: 0,
                                    background: `linear-gradient(135deg, ${association.themeColor || 'var(--accent)'}44, ${association.themeColor || 'var(--accent)'}22)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.1rem', fontWeight: 800, color: association.themeColor || 'var(--accent)',
                                    border: '2px solid var(--border-primary)',
                                }}>{member.name?.[0]?.toUpperCase()}</div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 700, fontSize: '0.92rem' }}>{member.title} {member.name}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--accent-text)', fontWeight: 600 }}>{member.designation}</p>
                                {member.phone && (
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                        <Phone size={10} /> {member.phone}
                                    </p>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <button onClick={() => handleEditMember(member)}
                                    style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
                                    <Edit3 size={13} />
                                </button>
                                <button onClick={() => handleDeleteMember(member._id)}
                                    style={{ background: 'var(--danger-soft)', color: 'var(--danger)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
