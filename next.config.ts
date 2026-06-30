import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // React Flow wymaga tego dla SSR
  transpilePackages: ['@xyflow/react'],

  async redirects() {
    return [
      {
        source: '/ad-generator',
        destination: 'https://ad-generator-webcolors.vercel.app',
        permanent: false,
      },
      {
        source: '/ad-generator/:path*',
        destination: 'https://ad-generator-webcolors.vercel.app/:path*',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
