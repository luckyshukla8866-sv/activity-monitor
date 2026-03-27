'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Table as TableIcon,
    Brain,
    Activity,
    ChevronLeft,
    ChevronRight,
    Upload,
    Sparkles,
    LogOut,
    Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import GradientText from './GradientText';

const menuItems = [
    { icon: Upload, label: 'Upload', href: '/upload' },
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Brain, label: 'ML Insights', href: '/insights' },
    { icon: Activity, label: 'Forecast', href: '/forecast' },
    { icon: TableIcon, label: 'Sessions', href: '/sessions' },
    { icon: Sparkles, label: 'AI Coach', href: '/coach' },
    { icon: Shield, label: 'Admin', href: '/admin' },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        router.push('/login');
    };

    return (
        <motion.div
            initial={false}
            animate={{ width: collapsed ? 64 : 240 }}
            className="h-full bg-white/[0.02] border-r border-white/5 flex flex-col backdrop-blur-3xl shrink-0"
        >
            {/* Logo */}
            <div className="h-14 flex items-center px-4 overflow-hidden shrink-0 mt-4">
                <AnimatePresence mode="wait">
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex-1 whitespace-nowrap"
                        >
                            <h1 className="text-xl font-bold tracking-tight">
                                <GradientText>Activity Monitor</GradientText>
                            </h1>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                className={cn(
                                    'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                                    isActive
                                        ? 'bg-indigo-500/10 text-indigo-300'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                )}
                            >
                                {isActive && (
                                    <motion.div 
                                        layoutId="active-indicator"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-indigo-500 rounded-r-full"
                                    />
                                )}
                                <item.icon className="w-5 h-5 shrink-0" />
                                <AnimatePresence mode="wait">
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="font-medium whitespace-nowrap overflow-hidden"
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
            <div className="p-3 border-t border-white/5 space-y-1">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="font-medium whitespace-nowrap overflow-hidden text-sm"
                            >
                                Logout
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <ChevronLeft className="w-5 h-5" />
                    )}
                </button>
            </div>
        </motion.div>
    );
}
