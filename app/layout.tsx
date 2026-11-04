import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css"; // Korrigierter Pfad
import CookieBanner from "@/components/ui/CookieBanner";
import Footer from "@/components/ui/Footer";
import {
  APP_NAME,
  SITE_DESCRIPTION,
  SITE_TITLE_TEMPLATE,
  getSiteUrl,
} from "@/lib/branding";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: SITE_TITLE_TEMPLATE,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description: SITE_DESCRIPTION,
    locale: "de_DE",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: SITE_DESCRIPTION,
  },
  // Icons kommen über Dateikonventionen: app/favicon.ico, app/icon.tsx und
  // app/apple-icon.tsx (alle mit Wappen). Kein eigener icons-Block hier –
  // der würde die automatisch erzeugten Links überschreiben.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased bg-slate-50 min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
        <Analytics />
        <SpeedInsights />
        <CookieBanner />
      </body>
    </html>
  );
}