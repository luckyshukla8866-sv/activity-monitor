'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import BackgroundSystem from '@/components/BackgroundSystem';
import { AnimatePresence, motion } from 'framer-motion';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // The root landing page (/) gets a full-screen layout — no sidebar or header
    const isLanding = pathname === '/' || pathname === '/upload';

    if (isLanding) {
        return (
            <>
                <BackgroundSystem />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="h-full w-full"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden text-white/90">
            <BackgroundSystem />
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 relative">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 md:p-10 relative z-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="max-w-[1600px] mx-auto w-full h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
