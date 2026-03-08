/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, // Disabled: StrictMode double-invokes effects in dev, causing double API calls

    // Only proxy /api/* to localhost in local development.
    // In production (Vercel), NEXT_PUBLIC_API_URL already points to the
    // Render backend, so no rewrite is needed.
    async rewrites() {
        const isProd = !!process.env.NEXT_PUBLIC_API_URL;
        if (isProd) return [];
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:8000/api/:path*',
            },
        ];
    },
};

module.exports = nextConfig;
