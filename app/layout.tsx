import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { OrganizationSchema, ServicesSchema, LocalBusinessSchema, WebSiteSchema } from "@/components/schema-org";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://syntance.com"),
  title: {
    default: "Syntance — Strony i sklepy Next.js | PageSpeed 90+ | Polska",
    template: "%s | Syntance",
  },
  description:
    "Szybkie strony i sklepy internetowe z gwarancją PageSpeed 90+. Strategia przed kodem. Strony od 5k PLN, sklepy od 20k PLN. Pełna własność kodu. Realizacja w 2-4 tygodnie.",
  keywords: [
    "strony Next.js",
    "sklepy Next.js",
    "strony internetowe Next.js",
    "sklep e-commerce Next.js",
    "MedusaJS sklep",
    "Headless CMS",
    "Sanity CMS",
    "PageSpeed 90+",
    "strony dla firm",
    "Next.js Polska",
    "tworzenie stron Next.js",
    "szybkie strony internetowe",
  ],
  authors: [{ name: "Syntance", url: "https://syntance.com" }],
  creator: "Syntance",
  publisher: "Syntance P.S.A.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Syntance — Strony i sklepy Next.js | PageSpeed 90+",
    description:
      "Szybkie strony i sklepy internetowe z gwarancją PageSpeed 90+. Strategia przed kodem. Strony od 5k PLN. Realizacja w 2-4 tygodnie.",
    url: "https://syntance.com",
    siteName: "Syntance",
    images: [
      {
        url: "https://syntance.com/og/og-home-1200x630.png",
        width: 1200,
        height: 630,
        alt: "Syntance - Strony i sklepy Next.js | PageSpeed 90+",
      },
    ],
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Syntance — Strony i sklepy Next.js | PageSpeed 90+",
    description:
      "Szybkie strony i sklepy internetowe z gwarancją PageSpeed 90+. Strategia przed kodem. Strony od 5k PLN. Realizacja w 2-4 tygodnie.",
    images: ["https://syntance.com/og/og-home-1200x630.png"],
  },
  alternates: {
    canonical: "https://syntance.com",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  category: "technology",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${spaceGrotesk.variable} font-sans antialiased bg-black text-[#F5F3FF]`}>
        <OrganizationSchema />
        <ServicesSchema />
        <LocalBusinessSchema />
        <WebSiteSchema />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
