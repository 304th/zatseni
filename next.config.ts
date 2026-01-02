import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "otzovik.ai",
          },
        ],
        destination: "https://www.otzovik.ai/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
