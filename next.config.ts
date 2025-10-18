import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lp-cms-production.imgix.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.kitulgalarafting.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Video optimization
  async headers() {
    return [
      {
        source: '/(.*\\.(mp4|webm|ogg))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Encoding',
            value: 'gzip',
          },
        ],
      },
    ];
  },
  experimental: {
    optimizePackageImports: [],
  },
  // SEO optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Enable static optimization
  trailingSlash: false,
  // Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
