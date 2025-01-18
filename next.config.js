/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [];
    },
    poweredByHeader: false,
    compress: true,
    images: {
        domains: ['assets.coingecko.com'],
    },
}

module.exports = nextConfig