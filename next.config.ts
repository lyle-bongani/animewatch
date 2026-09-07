import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.asurascans.com",
      },
    ],
  },
};

export default nextConfig;
