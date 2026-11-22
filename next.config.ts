import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Don't advertise the framework in every response (x-powered-by).
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  // /skills and /cheatsheet were removed in F008; keep old links (search results, posts) working.
  redirects: async () => [
    { source: '/skills/:path*', destination: '/', permanent: true },
    { source: '/cheatsheet/:path*', destination: '/blog/claude-code-cheatsheet-guide', permanent: true },
  ],
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
  ],
}

export default nextConfig
