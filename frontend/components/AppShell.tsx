'use client';

import { usePathname } from 'next/navigation';
import TopNav from '@/components/TopNav';
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
            <div className="flex flex-col min-h-screen bg-[#f0f2f5] text-[#1a1d21]">
                <TopNav />
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-8">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            {children}
                        </motion.div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
