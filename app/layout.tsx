import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import { AllSchemasDynamic } from "@/components/schema-org-dynamic";
import { generateSeoMetadata, getSeoSettings } from "@/lib/seo";
import NavbarStudio from "@/components/navbar-studio";
import { ProgressBar } from "@/components/progress-bar";
import { CookieBanner } from "@/components/CookieBanner";
import { Suspense } from "react";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: true,
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
  preload: true,
});

// Dynamiczne generowanie metadata z Sanity
export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata();
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pobierz ustawienia SEO z Sanity
  const seo = await getSeoSettings();
  
  return (
    <html
      lang="pl"
      className={`${spaceGrotesk.variable} ${plusJakartaSans.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        {/* Preconnect dla Sanity (API + CDN) — używane w fetchach klient-side i obrazach */}
        <link
          rel="preconnect"
          href={
            process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
              ? `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io`
              : "https://api.sanity.io"
          }
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
      </head>
      <body className="font-sans antialiased bg-black text-[#F5F3FF]">
        {/* Skip link (WCAG 2.2) — niewidoczny do momentu fokusu klawiaturą */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-9999 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Przejdź do treści
        </a>
        <Suspense fallback={null}>
          <ProgressBar />
        </Suspense>
        <AllSchemasDynamic seo={seo} />
        <NavbarStudio />
        {children}
        <CookieBanner />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
