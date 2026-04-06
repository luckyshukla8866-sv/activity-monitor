'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Users, Database, Activity, Trash2, UserPlus,
    RefreshCw, Crown, Monitor, Globe, Clock, HardDrive,
    AlertTriangle, CheckCircle, Eye, EyeOff, X
} from 'lucide-react';
import axios from 'axios';


const apiClient = axios.create({ baseURL: '' });
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

interface AdminUser {
    id: number;
    username: string;
    device_name: string | null;
    is_admin: boolean;
    created_at: string;
    session_count: number;
    total_duration_hours: number;
}

interface Stats {
    total_users: number;
    total_sessions: number;
    total_screenshots: number;
    desktop_sessions: number;
    browser_sessions: number;
    total_tracked_hours: number;
    active_users_7d: number;
    db_size_estimate: string;
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
    return (
        <div className="bg-surface extrusion rounded-[1.5rem] p-5 group hover:-translate-y-0.5 transition-transform interactive-card">
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
                    <Icon className={`w-5 h-5 text-${color}-400`} />
                </div>
            </div>
            <div className="text-2xl font-mono font-semibold text-white/90 tracking-tight">{value}</div>
            <div className="text-xs text-white/40 uppercase tracking-wider mt-1">{label}</div>
            {sub && <div className="text-[10px] text-white/25 mt-0.5">{sub}</div>}
        </div>
    );
}

export default function AdminPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    // New user form
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newIsAdmin, setNewIsAdmin] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [statsRes, usersRes] = await Promise.all([
                apiClient.get('/api/admin/stats'),
                apiClient.get('/api/admin/users'),
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
        } catch (err: any) {
            const detail = err?.response?.data?.detail;
            if (err?.response?.status === 403) {
                setError('Access denied. Admin privileges required.');
            } else if (err?.response?.status === 401) {
                setError('Not authenticated. Please log in.');
            } else {
                setError(detail || 'Failed to load admin data.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleDeleteUser = async (userId: number, username: string) => {
        if (!confirm(`Delete user "${username}" and ALL their data? This cannot be undone.`)) return;
        setActionLoading(`delete-${userId}`);
        try {
            await apiClient.delete(`/api/admin/users/${userId}`);
            showToast(`User "${username}" deleted`, 'success');
            loadData();
        } catch (err: any) {
            showToast(err?.response?.data?.detail || 'Failed to delete user', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleAdmin = async (userId: number, username: string, currentAdmin: boolean) => {
        setActionLoading(`admin-${userId}`);
        try {
            await apiClient.put(`/api/admin/users/${userId}`, { is_admin: !currentAdmin });
            showToast(`${username} is ${!currentAdmin ? 'now admin' : 'no longer admin'}`, 'success');
            loadData();
        } catch (err: any) {
            showToast(err?.response?.data?.detail || 'Failed to update user', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleClearSessions = async () => {
        if (!confirm('Delete ALL activity sessions across ALL users? This cannot be undone!')) return;
        setActionLoading('clear-sessions');
        try {
            const res = await apiClient.delete('/api/admin/sessions');
            showToast(`${res.data.sessions_deleted} sessions deleted`, 'success');
            loadData();
        } catch (err: any) {
            showToast(err?.response?.data?.detail || 'Failed to clear sessions', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUsername.trim() || !newPassword.trim()) return;
        setActionLoading('create-user');
        try {
            await apiClient.post('/api/admin/users', {
                username: newUsername.trim(),
                password: newPassword,
                is_admin: newIsAdmin,
            });
            showToast(`User "${newUsername}" created`, 'success');
            setShowCreateModal(false);
            setNewUsername('');
            setNewPassword('');
            setNewIsAdmin(false);
            loadData();
        } catch (err: any) {
            showToast(err?.response?.data?.detail || 'Failed to create user', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="bg-error-container/20 extrusion rounded-[2rem] p-8 text-center max-w-md border-error/20 interactive-card">
                    <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white/90 mb-2">Admin Access Required</h2>
                    <p className="text-white/50 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-10 font-sans space-y-6">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl border backdrop-blur-md flex items-center gap-2 text-sm font-medium shadow-xl ${
                            toast.type === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}
                    >
                        {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                            <Shield className="w-5 h-5 text-red-400" />
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight text-white/90">Admin Panel</h1>
                    </div>
                    <p className="text-sm text-white/40 ml-12">System management & user control</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={loadData}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all text-xs font-medium cursor-pointer"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 hover:bg-indigo-500/25 transition-all text-xs font-semibold cursor-pointer"
                    >
                        <UserPlus className="w-3.5 h-3.5" /> New User
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={Users} label="Total Users" value={stats.total_users} color="indigo" />
                    <StatCard icon={Database} label="Total Sessions" value={stats.total_sessions.toLocaleString()} sub={`${stats.desktop_sessions} desktop · ${stats.browser_sessions} browser`} color="sky" />
                    <StatCard icon={Clock} label="Tracked Hours" value={stats.total_tracked_hours} color="violet" />
                    <StatCard icon={HardDrive} label="Est. DB Size" value={stats.db_size_estimate} sub={`${stats.active_users_7d} active this week`} color="emerald" />
                </div>
            )}

            {/* Users Table */}
            <div className="bg-surface extrusion rounded-[2rem] p-0 overflow-hidden interactive-card">
                <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                    <h2 className="text-white/80 font-medium flex items-center gap-2">
                        <Users className="w-4 h-4 text-white/40" />
                        Users ({users.length})
                    </h2>
                    <button
                        onClick={handleClearSessions}
                        disabled={actionLoading === 'clear-sessions'}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium
                                   bg-red-500/10 border border-red-500/20 text-red-400
                                   hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                        <Trash2 className="w-3 h-3" />
                        Clear All Sessions
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-white/30 text-[11px] uppercase tracking-wider border-b border-white/[0.04]">
                                <th className="px-6 py-3 text-left font-medium">User</th>
                                <th className="px-4 py-3 text-left font-medium">Role</th>
                                <th className="px-4 py-3 text-center font-medium">Sessions</th>
                                <th className="px-4 py-3 text-center font-medium">Hours</th>
                                <th className="px-4 py-3 text-left font-medium">Joined</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                                user.is_admin ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'bg-white/[0.05] text-white/50 border border-white/[0.08]'
                                            }`}>
                                                {user.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-white/80 font-medium">{user.username}</div>
                                                <div className="text-[11px] text-white/30">{user.device_name || 'No device'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        {user.is_admin ? (
                                            <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                                                <Crown className="w-3 h-3" /> Admin
                                            </span>
                                        ) : (
                                            <span className="text-white/40 text-xs">User</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        <span className="font-mono text-white/60">{user.session_count.toLocaleString()}</span>
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        <span className="font-mono text-white/60">{user.total_duration_hours}h</span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className="text-white/40 text-xs">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => handleToggleAdmin(user.id, user.username, user.is_admin)}
                                                disabled={actionLoading === `admin-${user.id}`}
                                                className="p-1.5 rounded-lg hover:bg-amber-500/10 text-white/30 hover:text-amber-400 transition-all cursor-pointer disabled:opacity-50"
                                                title={user.is_admin ? 'Remove admin' : 'Make admin'}
                                            >
                                                <Crown className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id, user.username)}
                                                disabled={actionLoading === `delete-${user.id}`}
                                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all cursor-pointer disabled:opacity-50"
                                                title="Delete user"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                        onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-[400px] glass-card p-6 rounded-2xl border border-white/[0.08] space-y-5"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                                    <UserPlus className="w-5 h-5 text-indigo-400" />
                                    Create User
                                </h3>
                                <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 cursor-pointer">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-white/40 font-medium uppercase tracking-wider">Username</label>
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        placeholder="Enter username"
                                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-indigo-500/40 transition"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-white/40 font-medium uppercase tracking-wider">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPass ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter password"
                                            className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-indigo-500/40 transition"
                                        />
                                        <button type="button" onClick={() => setShowNewPass(!showNewPass)} tabIndex={-1}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 cursor-pointer">
                                            {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={newIsAdmin} onChange={(e) => setNewIsAdmin(e.target.checked)}
                                        className="w-4 h-4 rounded bg-white/5 border-white/20 accent-indigo-500" />
                                    <span className="text-sm text-white/60">Grant admin privileges</span>
                                </label>
                                <button
                                    type="submit"
                                    disabled={actionLoading === 'create-user'}
                                    className="w-full py-2.5 rounded-xl font-semibold text-sm bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {actionLoading === 'create-user' ? (
                                        <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                                    ) : (
                                        <UserPlus className="w-4 h-4" />
                                    )}
                                    Create User
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
