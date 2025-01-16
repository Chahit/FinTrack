/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [];
    },
    poweredByHeader: false,
    compress: true
}

module.exports = nextConfig