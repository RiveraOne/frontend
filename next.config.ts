import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin"],
  webpack: (config, { isServer }) => {
    if (isServer && config.output?.chunkFilename) {
      config.output.chunkFilename = "[id].js";
    }

    return config;
  },
};

export default nextConfig;
