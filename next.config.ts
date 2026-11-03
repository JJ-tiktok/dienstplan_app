import type { NextConfig } from "next";

/**
 * Sicherheits-Header für alle Antworten.
 *
 * Bewusst ohne vollständige Content-Security-Policy für Skripte: Supabase,
 * Vercel Analytics und Framer Motion bräuchten eine sorgfältig getestete Policy,
 * eine falsche würde die Seite still brechen. frame-ancestors ist dagegen
 * risikolos und verhindert Clickjacking (Einbetten der Seite in fremde Frames).
 */
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Admin, Login und API gehören nicht in Suchmaschinen
        source: "/(admin|login|api)/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/(admin|login)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
