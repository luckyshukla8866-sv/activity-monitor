/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, // Disabled: StrictMode double-invokes effects in dev, causing double API calls

    // Proxy all /api/* requests to the backend.
    // In production (Vercel): proxies to the Render backend (NEXT_PUBLIC_API_URL).
    // In development: proxies to localhost:8000.
    // This eliminates CORS issues entirely — the browser only talks to
    // Vercel (same-origin), and Vercel forwards to Render server-to-server.
    async rewrites() {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`,
            },
            {
                source: '/auth/:path*',
                destination: `${backendUrl}/auth/:path*`,
            },
        ];
    },

    // Performance optimizations
    compiler: {
        // Remove console.log in production
        removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
    },

    // Optimize images 
    images: {
        formats: ['image/avif', 'image/webp'],
    },

    // Reduce the number of experimental features
    experimental: {
        optimizePackageImports: ['framer-motion', 'recharts', 'lucide-react', 'date-fns'],
    },
};

module.exports = nextConfig;
