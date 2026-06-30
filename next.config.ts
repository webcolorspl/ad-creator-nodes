import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // React Flow wymaga tego dla SSR
  transpilePackages: ['@xyflow/react'],

  async rewrites() {
    return [
      {
        source: '/ad-generator',
        destination: 'https://ad-generator-webcolors.vercel.app/',
      },
      {
        source: '/ad-generator/:path*',
        destination: 'https://ad-generator-webcolors.vercel.app/:path*',
      },
    ]
  },
}

export default nextConfig
