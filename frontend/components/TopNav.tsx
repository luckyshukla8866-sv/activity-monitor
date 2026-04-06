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
                <div className="bg-[#f5f7f9]/80 backdrop-blur-xl border-b border-[#e5e9eb]/60">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
                        <div className="flex items-center justify-between h-16">
                            {/* Left: Logo */}
                            <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2444eb] to-[#8999ff] flex items-center justify-center shadow-md shadow-[#2444eb]/20">
                                    <span className="material-symbols-outlined text-[18px] text-white" style={{fontVariationSettings: "'FILL' 1"}}>monitoring</span>
                                </div>
                                <span className="text-lg font-bold tracking-tight text-[#2c2f31] hidden sm:block" style={{fontFamily: 'Manrope, sans-serif'}}>
                                    Ethereal Analytics
                                </span>
                            </Link>

                            {/* Center: Navigation Pills */}
                            <nav className="hidden lg:flex items-center">
                                <div className="flex items-center gap-1 p-1.5 bg-[#e5e9eb]/60 rounded-full">
                                    {menuItems.map((item) => {
                                        const isActive = pathname === item.href || 
                                            (pathname.startsWith(item.href) && item.href !== '/');
                                        return (
                                            <Link key={item.href} href={item.href}>
                                                <motion.div
                                                    className={cn(
                                                        'relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer',
                                                        isActive
                                                            ? 'text-[#2444eb]'
                                                            : 'text-[#595c5e] hover:text-[#2c2f31]'
                                                    )}
                                                >
                                                    {isActive && (
                                                        <motion.div
                                                            layoutId="nav-pill-bg"
                                                            className="absolute inset-0 bg-white rounded-full shadow-sm"
                                                            style={{ boxShadow: '-4px -4px 8px #ffffff, 4px 4px 8px rgba(220, 227, 236, 0.5)' }}
                                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                                        />
                                                    )}
                                                    <span className={cn(
                                                        "material-symbols-outlined text-[18px] relative z-10 transition-colors",
                                                        isActive ? "text-[#2444eb]" : "text-[#747779]"
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
                                        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8999ff]/20 to-[#2444eb]/10 border border-[#8999ff]/30 flex items-center justify-center hover:shadow-md transition-all cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[20px] text-[#2444eb]">person</span>
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
                                                    className="absolute right-0 top-14 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#e5e9eb] z-50 overflow-hidden"
                                                >
                                                    <div className="p-2">
                                                        <button
                                                            onClick={handleLogout}
                                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#595c5e] hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
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
                                    className="lg:hidden w-10 h-10 rounded-xl bg-[#e5e9eb]/60 flex items-center justify-center hover:bg-[#dfe3e6] transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[22px] text-[#595c5e]">
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
                                className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-[#e5e9eb] shadow-2xl z-50 lg:hidden"
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
                                                        ? 'bg-[#2444eb]/5 text-[#2444eb]'
                                                        : 'text-[#595c5e] hover:bg-[#f5f7f9] hover:text-[#2c2f31]'
                                                )}>
                                                    <span className={cn(
                                                        "material-symbols-outlined text-[20px]",
                                                        isActive ? "text-[#2444eb]" : "text-[#747779]"
                                                    )} style={isActive ? {fontVariationSettings: "'FILL' 1"} : undefined}>
                                                        {item.icon}
                                                    </span>
                                                    {item.label}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                    <div className="h-px bg-[#e5e9eb] my-2" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#595c5e] hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
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
