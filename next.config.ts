import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit reads its font-metrics files (.afm) off disk relative to its own
  // package directory at runtime — bundling it breaks that path resolution,
  // so it must stay external and load via plain require() instead.
  serverExternalPackages: ["pdfkit"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
