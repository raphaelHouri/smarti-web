import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig = {
  images: {
    domains: ['img.clerk.com', 'firebasestorage.googleapis.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* config options here */
  async headers() {
    return [
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*"
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS"
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization"
          },
          {
            key: "Content-Range",
            value: "bytes : 0-9*"
          }
        ]
      }
    ];
  },
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development" && process.env.ENABLE_PWA !== "true",
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "offlineCache",
          expiration: {
            maxEntries: 200,
          },
        },
      },
    ],
  },
} satisfies NextConfig & { pwa?: any };

export default withPWA(nextConfig);
