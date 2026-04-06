'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { clearUserData, isDemoUser } from '@/lib/auth-utils';
import axios from 'axios';

const baseMenuItems = [
    { icon: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { icon: 'psychology', label: 'ML Insights', href: '/insights' },
    { icon: 'monitoring', label: 'Forecasts', href: '/forecast' },
    { icon: 'table_chart', label: 'Sessions', href: '/sessions' },
    { icon: 'auto_awesome', label: 'AI Coach', href: '/coach' },
];

const adminMenuItem = { icon: 'shield', label: 'Admin', href: '/admin' };

export default function TopNav() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isDemo, setIsDemo] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

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
            .catch(() => setIsAdmin(false));
    }, []);

    // Build menu items based on role
    let menuItems = isDemo
        ? baseMenuItems
        : [{ icon: 'upload', label: 'Upload', href: '/upload' }, ...baseMenuItems];
    if (isAdmin) menuItems = [...menuItems, adminMenuItem];

    const handleLogout = () => {
        clearUserData();
        router.push('/login');
    };

    // Close mobile menu on navigation
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    return (
        <>
            <header className="sticky top-0 z-50 w-full">
                <div className="bg-white/60 backdrop-blur-2xl border-b border-white/40 shadow-sm shadow-black/[0.02]">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
                        <div className="flex items-center justify-between h-16">
                            {/* Left: Logo */}
                            <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#a855f7] flex items-center justify-center shadow-md shadow-[#4f46e5]/25">
                                    <span className="material-symbols-outlined text-[18px] text-white" style={{fontVariationSettings: "'FILL' 1"}}>monitoring</span>
                                </div>
                                <span className="text-lg font-bold tracking-tight text-[#1a1d21] hidden sm:block gradient-text" style={{fontFamily: 'Manrope, sans-serif'}}>
                                    Activity Monitor
                                </span>
                            </Link>

                            {/* Center: Navigation Pills */}
                            <nav className="hidden lg:flex items-center">
                                <div className="flex items-center gap-1 p-1.5 bg-white/40 backdrop-blur-xl rounded-full border border-white/50">
                                    {menuItems.map((item) => {
                                        const isActive = pathname === item.href || 
                                            (pathname.startsWith(item.href) && item.href !== '/');
                                        return (
                                            <Link key={item.href} href={item.href}>
                                                <motion.div
                                                    className={cn(
                                                        'relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer',
                                                        isActive
                                                            ? 'text-[#4f46e5]'
                                                            : 'text-[#6b7280] hover:text-[#1a1d21]'
                                                    )}
                                                >
                                                    {isActive && (
                                                        <motion.div
                                                            layoutId="nav-pill-bg"
                                                            className="absolute inset-0 bg-white rounded-full shadow-md"
                                                            style={{ boxShadow: '0 2px 8px rgba(79,70,229,0.1)' }}
                                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                                        />
                                                    )}
                                                    <span className={cn(
                                                        "material-symbols-outlined text-[18px] relative z-10 transition-colors",
                                                        isActive ? "text-[#4f46e5]" : "text-[#9ca3af]"
                                                    )} style={isActive ? {fontVariationSettings: "'FILL' 1"} : undefined}>
                                                        {item.icon}
                                                    </span>
                                                    <span className="relative z-10 whitespace-nowrap">
                                                        {item.label}
                                                    </span>
                                                </motion.div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </nav>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-3">
                                {/* User menu */}
                                <div className="relative">
                                    <button 
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c7d2fe]/30 to-[#4f46e5]/10 border border-[#c7d2fe]/40 flex items-center justify-center hover:shadow-md hover:scale-105 transition-all cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[20px] text-[#4f46e5]">person</span>
                                    </button>
                                    <AnimatePresence>
                                        {userMenuOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                                <motion.div
                                                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute right-0 top-14 w-56 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 z-50 overflow-hidden"
                                                >
                                                    <div className="p-2">
                                                        <button
                                                            onClick={handleLogout}
                                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#6b7280] hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">logout</span>
                                                            Sign Out
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Mobile hamburger */}
                                <button
                                    onClick={() => setMobileOpen(!mobileOpen)}
                                    className="lg:hidden w-10 h-10 rounded-xl bg-white/40 backdrop-blur-xl border border-white/50 flex items-center justify-center hover:bg-white/60 transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[22px] text-[#6b7280]">
                                        {mobileOpen ? 'close' : 'menu'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                <AnimatePresence>
                    {mobileOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                                onClick={() => setMobileOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="absolute top-full left-0 right-0 bg-white/90 backdrop-blur-2xl border-b border-white/40 shadow-2xl z-50 lg:hidden"
                            >
                                <nav className="max-w-[1600px] mx-auto px-4 py-4 space-y-1">
                                    {menuItems.map((item) => {
                                        const isActive = pathname === item.href || 
                                            (pathname.startsWith(item.href) && item.href !== '/');
                                        return (
                                            <Link key={item.href} href={item.href}>
                                                <div className={cn(
                                                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
                                                    isActive
                                                        ? 'bg-[#4f46e5]/5 text-[#4f46e5]'
                                                        : 'text-[#6b7280] hover:bg-[#f0f2f5] hover:text-[#1a1d21]'
                                                )}>
                                                    <span className={cn(
                                                        "material-symbols-outlined text-[20px]",
                                                        isActive ? "text-[#4f46e5]" : "text-[#9ca3af]"
                                                    )} style={isActive ? {fontVariationSettings: "'FILL' 1"} : undefined}>
                                                        {item.icon}
                                                    </span>
                                                    {item.label}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                    <div className="h-px bg-gradient-to-r from-transparent via-[#d4d8dd] to-transparent my-2" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#6b7280] hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">logout</span>
                                        Sign Out
                                    </button>
                                </nav>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </header>
        </>
    );
}
