import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import SeoJsonLd from "@/components/SeoJsonLd";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://syntance.com"),
  title: {
    default: "Syntance — Strony i sklepy Next.js",
    template: "%s | Syntance",
  },
  description:
    "Strony i sklepy Next.js z gwarancją PageSpeed 90+. Strategia przed kodem. Headless CMS, MedusaJS, Vercel. Własność kodu od pierwszego dnia.",
  authors: [{ name: "Syntance", url: "https://syntance.com" }],
  creator: "Syntance",
  publisher: "Syntance",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Syntance — Strony i sklepy Next.js",
    description: "Strony i sklepy Next.js z gwarancją PageSpeed 90+. Strategia przed kodem. Headless CMS, MedusaJS, Vercel. Własność kodu od pierwszego dnia.",
    url: "https://syntance.com",
    siteName: "Syntance",
    images: [
      {
        url: "https://syntance.com/og/og-home-1200x630.png",
        width: 1200,
        height: 630,
        alt: "Syntance - Strony i sklepy Next.js",
        type: "image/png",
      }
    ],
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Syntance — Strony i sklepy Next.js",
    description: "Strony i sklepy Next.js z gwarancją PageSpeed 90+. Strategia przed kodem. Headless CMS, MedusaJS, Vercel. Własność kodu od pierwszego dnia.",
    images: ["https://syntance.com/og/og-home-1200x630.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://syntance.com",
    languages: {
      "pl": "https://syntance.com",
      "en": "https://syntance.com/en",
    },
  },
  icons: { 
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
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
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://syntance.com/#organization",
    "name": "Syntance",
    "legalName": "Syntance P.S.A.",
    "alternateName": "Syntance - Strony i sklepy Next.js",
    "url": "https://syntance.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://syntance.com/og/syntance-logo.png",
      "width": 512,
      "height": 512
    },
    "image": "https://syntance.com/og/og-home-1200x630.png",
    "description": "Strony i sklepy Next.js z gwarancją PageSpeed 90+. Strategia przed kodem. Headless CMS, MedusaJS, Vercel.",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "kontakt@syntance.com",
      "telephone": "+48662519544",
      "contactType": "customer service",
      "areaServed": "PL",
      "availableLanguage": ["Polish", "English"]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Czerniec 72",
      "addressLocality": "Łącko",
      "postalCode": "33-390",
      "addressRegion": "Małopolska",
      "addressCountry": "PL"
    },
    "sameAs": [
      "https://github.com/Syntance/syntance-web"
    ],
    "foundingDate": "2023",
    "founders": [{
      "@type": "Person",
      "name": "Kamil Podobiński",
      "jobTitle": "CEO & Founder"
    }],
    "areaServed": {
      "@type": "Country",
      "name": "Polska"
    },
    "knowsAbout": ["Next.js", "React", "Headless CMS", "MedusaJS", "Vercel", "E-commerce", "Web Development"],
    "slogan": "Strony i sklepy Next.js - Ultra-szybkie, bezpieczne i gotowe na przyszłość"
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://syntance.com/#website",
    "name": "Syntance",
    "url": "https://syntance.com",
    "description": "Strony i sklepy Next.js z gwarancją PageSpeed 90+. Strategia przed kodem.",
    "publisher": {
      "@id": "https://syntance.com/#organization"
    },
    "inLanguage": "pl"
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://syntance.com/#service-webdev",
    "name": "Strony i sklepy Next.js",
    "description": "Ultra-szybkie, bezpieczne i gotowe na przyszłość. Strategia przed kodem. Headless CMS, MedusaJS, Vercel.",
    "provider": {
      "@id": "https://syntance.com/#organization"
    },
    "serviceType": "Web Development",
    "areaServed": {
      "@type": "Country",
      "name": "Polska"
    }
  };

  return (
    <html lang="pl" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${spaceGrotesk.variable} font-sans antialiased bg-black text-[#F5F3FF]`}>
        {children}
        <Analytics />
        <SeoJsonLd json={organizationJsonLd} />
        <SeoJsonLd json={websiteJsonLd} />
        <SeoJsonLd json={serviceJsonLd} />
      </body>
    </html>
  );
}

