import type { NextConfig } from "next";

const securityHeaders = [
  // HTTPS is already enforced by Vercel/the domain, but this tells browsers
  // to skip the initial HTTP round-trip on repeat visits and refuse downgrade.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Only same-origin framing — the store has no reason to render inside
  // someone else's <iframe> (clickjacking protection).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Stops the browser from guessing content-types and executing e.g. an
  // uploaded image as script.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak the full URL (which can carry order/reset tokens in the path
  // on some pages) to third-party sites we link out to.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // No use case on this site for camera/mic/geolocation/USB — deny by default.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), usb=()" },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework to would-be attackers fingerprinting for known CVEs.
  poweredByHeader: false,
  // pdfkit reads its font-metrics files (.afm) off disk relative to its own
  // package directory at runtime — bundling it breaks that path resolution,
  // so it must stay external and load via plain require() instead.
  serverExternalPackages: ["pdfkit"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
