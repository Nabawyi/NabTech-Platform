import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  rewrites: async () => {
    return [
      {
        source: "/admin",
        destination: "/teacher",
      },
      {
        source: "/admin/:path*",
        destination: "/teacher/:path*",
      },
    ];
  },
};

export default nextConfig;
