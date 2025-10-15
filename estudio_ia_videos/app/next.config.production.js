
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,
  
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
  
  // ESLint & TypeScript
  eslint: {
    ignoreDuringBuilds: false, // Bloquear build com erros de lint
  },
  typescript: {
    ignoreBuildErrors: false, // Bloquear build com erros de TS
  },
  
  // Images optimization
  images: {
    unoptimized: false, // Ativar otimização em produção
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [
      'treinx.abacusai.app',
      'staging.treinx.abacusai.app',
      'res.cloudinary.com',
      'images.unsplash.com',
      's3.amazonaws.com',
      process.env.AWS_BUCKET_NAME || '',
    ].filter(Boolean),
  },
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Production optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // Headers
  async headers() {
    return [
      // Static assets (immutable)
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Images
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      // Fonts
      {
        source: '/:all*(woff|woff2|eot|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
  
  // Webpack config
  webpack: (config, { isServer }) => {
    // Ignore noisy warnings that are safe in runtime but break strict builds
    const ignoreWarningFn = (warning) => {
      const msg = warning?.message || ''
      const mod = warning?.module?.resource || ''
      return /Critical dependency: the request of a dependency is an expression/.test(msg)
        || /require-in-the-middle/.test(mod)
        || /bullmq\/dist\/esm\/classes\/child-processor\.js/.test(mod)
    }
    config.ignoreWarnings = [...(config.ignoreWarnings || []), ignoreWarningFn]

    // Treat certain Node-only packages as externals so Webpack doesn't try to bundle them
    const externalPkgs = new Set(['bullmq', 'require-in-the-middle'])
    if (Array.isArray(config.externals)) {
      config.externals.push((context, request, callback) => {
        if (externalPkgs.has(request)) {
          return callback(null, 'commonjs ' + request)
        }
        callback()
      })
    } else if (config.externals) {
      // Preserve existing externals definition while adding our handler
      config.externals = [
        config.externals,
        (context, request, callback) => {
          if (externalPkgs.has(request)) {
            return callback(null, 'commonjs ' + request)
          }
          callback()
        }
      ]
    } else {
      config.externals = [
        (context, request, callback) => {
          if (externalPkgs.has(request)) {
            return callback(null, 'commonjs ' + request)
          }
          callback()
        }
      ]
    }

    // Ensure server can resolve these packages at runtime instead of bundling
    config.resolve = config.resolve || {}
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      // Do not polyfill or bundle these in the browser
      'bullmq': false,
      'require-in-the-middle': false,
    }

    // Optimization
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      }
    }
    
    return config
  },
}

// Sentry configuration
const { withSentryConfig } = require('@sentry/nextjs')

const sentryWebpackPluginOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
}

module.exports = process.env.NODE_ENV === 'production'
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig
