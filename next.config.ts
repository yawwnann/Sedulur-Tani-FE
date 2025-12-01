import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    domains: [
      "images.unsplash.com",
      "via.placeholder.com",
      "localhost",
      "res.cloudinary.com",
    ],
  },
};

export default nextConfig;
