/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Drupal images
      {
        protocol: 'https',
        hostname: '**.decoupled.website',
        pathname: '/**',
      },
      // Shopify CDN images
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
      // Unsplash (for demo content)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async redirects() {
    return [
      {
        source: '/homepage',
        destination: '/',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      // Proxy Drupal file assets
      {
        source: '/sites/:path*',
        destination: '/api/proxy/sites/:path*',
      },
    ]
  },
}

module.exports = nextConfig
