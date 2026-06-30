import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // React Flow wymaga tego dla SSR
  transpilePackages: ['@xyflow/react'],

  async redirects() {
    return [
      {
        source: '/creator',
        destination: 'https://ad-generator-webcolors.vercel.app',
        permanent: false,
      },
      {
        source: '/creator/:path*',
        destination: 'https://ad-generator-webcolors.vercel.app/:path*',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
