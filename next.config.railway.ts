import type { NextConfig } from 'next';
import { resolve } from 'node:path';
import bundleAnalyzer from '@next/bundle-analyzer';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/libs/i18n.ts');

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  eslint: {
    dirs: ['.'],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ['@electric-sql/pglite'],

  // Cloudflare Pages 静态导出配置
  output: 'export',
  trailingSlash: true,

  // 实验性功能
  experimental: {
    // Railway 内存优化：减少并发构建进程
    // workerThreads: false,
    // cpus: 1,
    // 其他实验性功能可以在这里添加
  },

  // 图片优化配置
  images: {
    unoptimized: true, // Cloudflare Pages 需要
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1年缓存
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: 'default-src \'self\'; script-src \'none\'; sandbox;',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.rolitt.com',
        port: '',
        pathname: '/**',
      },
      // Notion 图片支持
      {
        protocol: 'https',
        hostname: 's3.us-west-2.amazonaws.com',
        port: '',
        pathname: '/secure.notion-static.com/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // 添加缓存头配置
  async headers() {
    return [
      // HTML页面缓存配置 - 允许bfcache
      {
        source: '/((?!_next|api|static).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)\\.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)\\.jpg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)\\.jpeg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)\\.gif',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)\\.webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)\\.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)\\.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/videos/:path*',
        destination: '/videos/:path*',
      },
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
      {
        source: '/ingest/decide',
        destination: 'https://us.i.posthog.com/decide',
      },
    ];
  },

  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,

  // Webpack配置 - 忽略OpenTelemetry警告和配置workspace包解析
  webpack: (config) => {
    // Cloudflare Workers 优化配置
    if (process.env.CLOUDFLARE_BUILD) {
      // 排除大型依赖以减少 Worker 体积
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push(
          // 排除 AMP 验证器（4MB）
          'amphtml-validator',
          // 排除大型 Babel 包
          '@babel/core',
          '@babel/preset-env',
          // 排除 Terser（1MB）
          'terser-webpack-plugin',
          'terser',
          // 排除其他大型依赖
          'uglify-js',
          'webpack',
        );
      }

      // 优化代码分割
      config.optimization = {
        ...config.optimization,
        minimize: true,
        usedExports: true,
        sideEffects: false,
        splitChunks: {
          chunks: 'all',
          maxSize: 244000, // 约 240KB 每个 chunk
          cacheGroups: {
            default: false,
            vendors: false,
            // 创建更小的 chunks
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test(module: any) {
                return module.size() > 160000 && /node_modules[/\\]/.test(module.identifier());
              },
              name(module: any) {
                const crypto = require('node:crypto');
                const hash = crypto.createHash('sha1');
                hash.update(module.identifier());
                return hash.digest('hex').substring(0, 8);
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
          },
        },
      };
    }

    // Railway 内存优化配置
    if (process.env.RAILWAY_ENVIRONMENT) {
      // 限制并行处理以减少内存使用
      config.parallelism = 1;
      // Railway 环境使用 filesystem 缓存，但限制缓存大小
      config.cache = {
        type: 'filesystem',
        maxMemoryGenerations: 1,
        cacheDirectory: '/tmp/webpack-cache',
      };
      // 优化性能配置
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
          },
        },
      };
    }

    // 忽略OpenTelemetry的动态导入警告
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules\/@opentelemetry\/instrumentation/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
      {
        module: /node_modules\/@prisma\/instrumentation/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    // 配置workspace包的模块解析
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      // Shopify 包解析
      '@rolitt/shopify': resolve(__dirname, 'packages/shopify/dist'),
      '@rolitt/shopify/next': resolve(__dirname, 'packages/shopify/dist/next'),
      // Admin 包解析 - 使用源代码而非编译后的代码
      '@rolitt/admin': resolve(__dirname, 'packages/admin/src'),
      '@rolitt/admin/components': resolve(__dirname, 'packages/admin/src/components'),
      '@rolitt/admin/features': resolve(__dirname, 'packages/admin/src/features'),
      '@rolitt/admin/stores': resolve(__dirname, 'packages/admin/src/stores'),
      '@rolitt/admin/types': resolve(__dirname, 'packages/admin/src/types'),
      // Shared 包解析
      '@rolitt/shared': resolve(__dirname, 'packages/shared/src'),
      '@rolitt/shared/ui': resolve(__dirname, 'packages/shared/src/ui'),
      '@rolitt/shared/utils': resolve(__dirname, 'packages/shared/src/utils'),
      '@rolitt/shared/types': resolve(__dirname, 'packages/shared/src/types'),
    };

    // 在服务器端排除 PostHog 客户端库
    if (!config.externals) {
      config.externals = [];
    }

    if (Array.isArray(config.externals)) {
      config.externals.push({
        'posthog-js': 'commonjs posthog-js',
        'posthog-js/react': 'commonjs posthog-js/react',
      });
    }

    return config;
  },
};

export default withNextIntl(withBundleAnalyzer(nextConfig));
