import type { NextConfig } from "next";

const API_TARGET = process.env.BACKEND_URL ?? "http://localhost:3050";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_TARGET}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
