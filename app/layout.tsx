import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css"; // Korrigierter Pfad
import CookieBanner from "@/components/ui/CookieBanner";
import Footer from "@/components/ui/Footer";
import {
  APP_NAME,
  SITE_DESCRIPTION,
  SITE_TITLE_TEMPLATE,
} from "@/lib/branding";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
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
  },
  twitter: {
    card: "summary",
    title: APP_NAME,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: "/thomm.png",
    apple: "/thomm.png",
  },
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
        <CookieBanner />
      </body>
    </html>
  );
}