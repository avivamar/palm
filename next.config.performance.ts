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
  output: 'standalone',

  // 🚀 性能优化实验性功能
  experimental: {
    // 优化包导入
    optimizePackageImports: [
      '@radix-ui/react-*',
      'lucide-react',
      'framer-motion',
      '@tanstack/react-query',
      'react-hook-form',
      'sonner',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
    ],
    // 启用部分预渲染（如果适用）
    ppr: true,
    // 优化服务器组件
    serverComponentsExternalPackages: ['sharp'],
  },

  // 编译器优化
  compiler: {
    // 生产环境移除 console
    removeConsole: process.env.NODE_ENV === 'production'
      ? {
          exclude: ['error', 'warn'],
        }
      : false,
    // 移除调试属性
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  // 🖼️ 增强的图片优化
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1年
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: 'default-src \'self\'; script-src \'none\'; sandbox;',
    // 添加 Shopify CDN
    domains: ['cdn.shopify.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.rolitt.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/**',
      },
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

  // 🎯 增强的缓存头配置
  async headers() {
    return [
      // 预加载关键资源
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Link',
            value: '</assets/images/hero.webp>; rel=preload; as=image',
          },
        ],
      },
      // HTML 缓存配置
      {
        source: '/((?!_next|api|static).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      // 静态资源长期缓存
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // 字体资源
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      // WebP 图片
      {
        source: '/(.*)\\.webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Accept-CH',
            value: 'DPR, Viewport-Width, Width',
          },
        ],
      },
      // 其他图片格式
      {
        source: '/(.*)\\.(png|jpg|jpeg|gif|svg|ico)',
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

  skipTrailingSlashRedirect: true,

  // 🔧 增强的 Webpack 配置
  webpack: (config, { isServer, dev }) => {
    // 性能优化配置
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          cacheGroups: {
            default: false,
            vendors: false,
            // React 相关
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // 大型库
            lib: {
              test(module: any) {
                return module.size() > 50000 && /node_modules[/\\]/.test(module.identifier());
              },
              name(module: any) {
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                return `lib-${packageName.replace('@', '')}`;
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            // 分析工具单独打包
            analytics: {
              name: 'analytics',
              test: /[\\/]node_modules[\\/](@vercel[\\/]analytics|posthog|clarity-js)[\\/]/,
              priority: 35,
              enforce: true,
            },
            // 通用模块
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
              reuseExistingChunk: true,
            },
          },
        },
      };

      // Terser 压缩优化
      if (config.optimization.minimizer) {
        config.optimization.minimizer.forEach((minimizer: any) => {
          if (minimizer.constructor.name === 'TerserPlugin') {
            minimizer.options.terserOptions = {
              ...minimizer.options.terserOptions,
              compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info'],
                passes: 2,
              },
              mangle: {
                safari10: true,
              },
              format: {
                comments: false,
              },
            };
          }
        });
      }
    }

    // Cloudflare Workers 优化
    if (process.env.CLOUDFLARE_BUILD) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push(
          'amphtml-validator',
          '@babel/core',
          '@babel/preset-env',
          'terser-webpack-plugin',
          'terser',
          'uglify-js',
          'webpack',
        );
      }
    }

    // Railway 内存优化
    if (process.env.RAILWAY_ENVIRONMENT) {
      config.parallelism = 1;
      config.cache = {
        type: 'filesystem',
        maxMemoryGenerations: 1,
        cacheDirectory: '/tmp/webpack-cache',
      };
    }

    // 忽略警告
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

    // Workspace 包解析
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@rolitt/shopify': resolve(__dirname, 'packages/shopify/dist'),
      '@rolitt/shopify/next': resolve(__dirname, 'packages/shopify/dist/next'),
      '@rolitt/admin': resolve(__dirname, 'packages/admin/src'),
      '@rolitt/admin/components': resolve(__dirname, 'packages/admin/src/components'),
      '@rolitt/admin/features': resolve(__dirname, 'packages/admin/src/features'),
      '@rolitt/admin/stores': resolve(__dirname, 'packages/admin/src/stores'),
      '@rolitt/admin/types': resolve(__dirname, 'packages/admin/src/types'),
      '@rolitt/shared': resolve(__dirname, 'packages/shared/src'),
      '@rolitt/shared/ui': resolve(__dirname, 'packages/shared/src/ui'),
      '@rolitt/shared/utils': resolve(__dirname, 'packages/shared/src/utils'),
      '@rolitt/shared/types': resolve(__dirname, 'packages/shared/src/types'),
    };

    // 客户端库外部化
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
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
