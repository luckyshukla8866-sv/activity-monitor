'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import GradientText from './GradientText';
import { clearUserData, isDemoUser } from '@/lib/auth-utils';
import axios from 'axios';

const baseMenuItems = [
    { icon: 'upload', label: 'Upload', href: '/upload' },
    { icon: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { icon: 'psychology', label: 'ML Insights', href: '/insights' },
    { icon: 'monitoring', label: 'Forecast', href: '/forecast' },
    { icon: 'table_chart', label: 'Sessions', href: '/sessions' },
    { icon: 'auto_awesome', label: 'AI Coach', href: '/coach' },
];

const adminMenuItem = { icon: 'shield', label: 'Admin', href: '/admin' };

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isDemo, setIsDemo] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Check role on mount
    useEffect(() => {
        setIsDemo(isDemoUser());

        const token = localStorage.getItem('access_token');
        if (!token) return;

        const client = axios.create();
        client.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        client.get('/auth/me')
            .then((res) => {
                setIsAdmin(res.data?.is_admin === true);
                setIsDemo(res.data?.is_demo === true);
            })
            .catch(() => {
                setIsAdmin(false);
            });
    }, []);

    // Build menu items based on role
    let menuItems = isDemo
        ? baseMenuItems.filter((item) => item.href !== '/upload')  // demo: no upload
        : baseMenuItems;
    if (isAdmin) menuItems = [...menuItems, adminMenuItem];

    const handleLogout = () => {
        clearUserData();  // clears token + all user-specific chat history
        router.push('/login');
    };

    return (
        <motion.div
            initial={false}
            animate={{ width: collapsed ? 72 : 240 }}
            className="h-full bg-white/40 backdrop-blur-xl border-r border-white/40 flex flex-col shrink-0 font-sans"
        >
            {/* Logo */}
            <div className="h-16 flex items-center px-4 overflow-hidden shrink-0 mt-2">
                <AnimatePresence mode="wait">
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex-1 whitespace-nowrap pl-2"
                        >
                            <h1 className="text-xl font-bold tracking-tight gradient-text">
                                Activity Monitor
                            </h1>
                        </motion.div>
                    )}
                    {collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-10 h-10 mx-auto bg-white/70 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm border border-white/50"
                        >
                            <span className="material-symbols-outlined text-[24px] text-[#4f46e5]">monitoring</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                className={cn(
                                    'group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer font-medium text-sm',
                                    isActive
                                        ? 'bg-white/70 backdrop-blur-sm text-[#4f46e5] font-bold shadow-md shadow-[#4f46e5]/5 border border-white/50'
                                        : 'text-[#6b7280] hover:text-[#1a1d21] hover:bg-white/40'
                                )}
                            >
                                {isActive && (
                                    <motion.div 
                                        layoutId="active-indicator"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{background: 'linear-gradient(180deg, #4f46e5, #a855f7)'}}
                                    />
                                )}
                                <span className={cn(
                                    "material-symbols-outlined text-[20px] shrink-0 transition-colors",
                                    isActive ? "text-[#4f46e5]" : "text-[#9ca3af] group-hover:text-[#6b7280]"
                                )}>
                                    {item.icon}
                                </span>
                                <AnimatePresence mode="wait">
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="whitespace-nowrap overflow-hidden"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom actions */}
            <div className="p-3 border-t border-white/40 space-y-1.5 bg-white/20 backdrop-blur-sm">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[#6b7280] hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer font-medium text-sm group"
                >
                    <span className="material-symbols-outlined text-[20px] shrink-0 group-hover:text-rose-500 transition-colors">logout</span>
                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="whitespace-nowrap overflow-hidden"
                            >
                                Logout
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center p-2 rounded-xl text-[#9ca3af] hover:text-[#4f46e5] hover:bg-[#4f46e5]/5 transition-all cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {collapsed ? 'chevron_right' : 'chevron_left'}
                    </span>
                </button>
            </div>
        </motion.div>
    );
}
