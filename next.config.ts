import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Course cover images + instructor photos are uploaded as resized
      // JPEG data URLs and submitted as plain form fields (no separate file
      // storage service is wired up). The default 1MB server-action body
      // limit is too tight once both fields are populated, so raise it.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
