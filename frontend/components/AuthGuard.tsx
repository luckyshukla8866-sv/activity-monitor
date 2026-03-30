'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearUserData } from '@/lib/auth-utils';

// Pages that do NOT require authentication
const PUBLIC_PATHS = ['/', '/login'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const handleUnauthorized = () => {
            clearUserData();  // clears token + all user-specific data
            router.replace('/login');
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);
        
        const token = localStorage.getItem('access_token');
        const isPublic = PUBLIC_PATHS.includes(pathname);

        if (!token && !isPublic) {
            // Not logged in → redirect to login
            router.replace('/login');
            return;
        }

        if (token && pathname === '/login') {
            // Already logged in → redirect away from login
            router.replace('/dashboard');
            return;
        }

        setChecked(true);

        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, [pathname, router]);

    // Don't render protected content until auth check is done
    const isPublic = PUBLIC_PATHS.includes(pathname);
    if (!checked && !isPublic) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[#070714]">
                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
