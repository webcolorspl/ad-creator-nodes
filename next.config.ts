import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // React Flow wymaga tego dla SSR
  transpilePackages: ['@xyflow/react'],

}

export default nextConfig
