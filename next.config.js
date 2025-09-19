/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export only for GitHub Pages deployment
  // Comment out for local development with multiplayer features
  // output: 'export',
  trailingSlash: true,
  basePath: '',
  assetPrefix: '',

  // Enable experimental features
  experimental: {
    // optimizeCss: true, // Disabled due to critters dependency issue
  },

  // Image optimization (disabled for static export)
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    domains: ['localhost'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compression
  compress: true,

  // PWA configuration (disabled for static export)
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         {
  //           key: 'X-Frame-Options',
  //           value: 'DENY',
  //         },
  //         {
  //           key: 'X-Content-Type-Options',
  //           value: 'nosniff',
  //         },
  //         {
  //           key: 'Referrer-Policy',
  //           value: 'origin-when-cross-origin',
  //         },
  //         {
  //           key: 'Cache-Control',
  //           value: 'public, max-age=31536000, immutable',
  //         },
  //       ],
  //     },
  //   ]
  // },

  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    // Handle Socket.IO client dependencies that are Node.js specific
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        bufferutil: false,
        'utf-8-validate': false,
      }
    }

    // Production optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }

    return config
  },

  // Environment variables
  env: {
    CUSTOM_KEY: 'portfolio-v2',
  },

  // Redirects disabled for static export
  // async redirects() {
  //   return [
  //     {
  //       source: '/home',
  //       destination: '/',
  //       permanent: true,
  //     },
  //   ]
  // },
}

module.exports = nextConfig
