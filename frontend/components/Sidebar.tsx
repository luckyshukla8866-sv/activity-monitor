'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Activity,
    Image as ImageIcon,
    Settings,
    ChevronLeft,
    ChevronRight,
    Radio,
    Mouse,
} from 'lucide-react';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Activity, label: 'Sessions', href: '/sessions' },
    { icon: ImageIcon, label: 'Screenshots', href: '/screenshots' },
    { icon: Mouse, label: 'Live Input', href: '/live-input' },
    { icon: Radio, label: 'Monitoring Control', href: '/monitoring' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <motion.div
            initial={false}
            animate={{ width: collapsed ? 80 : 256 }}
            className="glass border-r border-slate-700 flex flex-col"
        >
            {/* Logo */}
            <div className="p-6 flex items-center justify-between">
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <h1 className="text-xl font-bold gradient-text">Activity Monitor</h1>
                    </motion.div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <ChevronLeft className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                                    : 'hover:bg-slate-700 text-slate-300'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {!collapsed && (
                                    <span className="font-medium">{item.label}</span>
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* User Info */}
            {!collapsed && (
                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                            <span className="text-white font-semibold">U</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">User</p>
                            <p className="text-xs text-slate-400">Local Machine</p>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
