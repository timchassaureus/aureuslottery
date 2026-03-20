import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisations pour la production
  reactStrictMode: true,
  
  // Configuration pour le déploiement
  output: 'standalone',

  // Forcer Turbopack à utiliser ce dossier comme racine du workspace
  turbopack: {
    root: __dirname,
  },

  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // MetaMask SDK optional RN dependency: not needed on web build
      "@react-native-async-storage/async-storage": false,
    };
    return config;
  },
  
  
  // Headers de sécurité + cache
  async headers() {
    return [
      // ─── Assets statiques : cache agressif (immutable = hash dans l'URL) ───
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // ─── Images publiques ───────────────────────────────────────────────────
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=3600' },
        ],
      },
      // ─── Headers de sécurité sur toutes les pages ──────────────────────────
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
        ],
      },
    ];
  },
};

export default nextConfig;
