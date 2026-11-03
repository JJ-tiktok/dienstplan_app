import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/branding";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/login", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
