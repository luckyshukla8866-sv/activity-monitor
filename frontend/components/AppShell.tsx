'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import { motion } from 'framer-motion';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isFullScreen = pathname === '/' || pathname === '/login';

    if (isFullScreen) {
        return (
            <AuthGuard>
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="h-full w-full"
                >
                    {children}
                </motion.div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <div className="flex h-screen overflow-hidden bg-surface text-on-surface">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0 relative">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6 md:p-10 relative z-0">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="max-w-[1600px] mx-auto w-full h-full"
                        >
                            {children}
                        </motion.div>
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
