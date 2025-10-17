/** @type {import('next').nextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.onrender.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  serverExternalPackages: ['sharp', 'pg'],
}

module.exports = nextConfig
