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
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { GoogleConsentDefaultScript } from "@/components/analytics/google-consent-default";
import { isGa4Configured } from "@/lib/analytics/ga4";
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

// Dynamiczne generowanie metadata z bazy (Neon)
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
  // Ustawienia SEO z Postgres
  const seo = await getSeoSettings();
  
  return (
    <html
      lang="pl"
      className={`${spaceGrotesk.variable} ${plusJakartaSans.variable}`}
    >
      <head>
        {process.env.NEXT_PUBLIC_POSTHOG_HOST ? (
          <>
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_POSTHOG_HOST} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_POSTHOG_HOST} />
          </>
        ) : null}
        {isGa4Configured() ? (
          <>
            <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
          </>
        ) : null}
        <GoogleConsentDefaultScript />
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
        <AnalyticsProvider>{children}</AnalyticsProvider>
        <CookieBanner />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
