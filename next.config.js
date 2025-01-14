/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [];
    },
    poweredByHeader: false,
    compress: true,
    swcMinify: true,
}

module.exports = nextConfig