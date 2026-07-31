import type { NextConfig } from "next";

/**
 * CORS + image config live here.
 * Framing / CSP clickjacking policy is in middleware.ts so /embed/* and
 * the rest of the site can get mutually exclusive headers (next.config
 * merges matching sources, which would leak X-Frame-Options onto embeds).
 */
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/embed/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
