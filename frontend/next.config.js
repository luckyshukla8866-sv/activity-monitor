/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, // Disabled: StrictMode double-invokes effects in dev, causing double API calls
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:8000/api/:path*',
            },
        ];
    },
};

module.exports = nextConfig;
