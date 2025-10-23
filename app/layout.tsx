import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import WhatsAppButton from "@/components/whatsapp-button";
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
    default: "Syntance — Studio technologiczne AI-first w Polsce",
    template: "%s | Syntance",
  },
  description:
    "Studio technologiczne specjalizujące się w tworzeniu stron internetowych, sklepów online i rozwiązań AI. Next.js, React, automatyzacja procesów biznesowych. Zobacz nasze realizacje.",
  authors: [{ name: "Syntance", url: "https://syntance.com" }],
  creator: "Syntance",
  publisher: "Syntance",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Syntance — Studio technologiczne AI-first w Polsce",
    description: "Studio technologiczne specjalizujące się w tworzeniu stron internetowych, sklepów online i rozwiązań AI. Next.js, React, automatyzacja procesów biznesowych. Zobacz nasze realizacje.",
    url: "https://syntance.com",
    siteName: "Syntance",
    images: [
      {
        url: "https://syntance.com/og/og-home-1200x630.png",
        width: 1200,
        height: 630,
        alt: "Syntance - Studio technologiczne AI-first w Polsce",
        type: "image/png",
      }
    ],
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Syntance — Studio technologiczne AI-first w Polsce",
    description: "Studio technologiczne specjalizujące się w tworzeniu stron internetowych, sklepów online i rozwiązań AI. Next.js, React, automatyzacja procesów biznesowych. Zobacz nasze realizacje.",
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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
  },
  category: "technology",
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
    "legalName": "Syntance Studio",
    "alternateName": "Syntance AI-first Studio",
    "url": "https://syntance.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://syntance.com/og/syntance-logo.png",
      "width": 512,
      "height": 512
    },
    "image": "https://syntance.com/og/og-home-1200x630.png",
    "description": "Studio technologiczne AI-first specjalizujące się w tworzeniu stron internetowych, sklepów online i rozwiązań AI. Next.js, React, automatyzacja procesów biznesowych.",
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
      "https://github.com/Kamil0108/syntance-web"
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
    "knowsAbout": ["Next.js", "React", "AI", "Machine Learning", "Web Development", "E-commerce"],
    "slogan": "Technologia która zachwyca, nie przytłacza"
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://syntance.com/#website",
    "name": "Syntance",
    "url": "https://syntance.com",
    "description": "Studio technologiczne AI-first - strony internetowe, sklepy online, rozwiązania AI",
    "publisher": {
      "@id": "https://syntance.com/#organization"
    },
    "inLanguage": "pl"
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://syntance.com/#service-studio",
    "name": "Syntance Studio",
    "description": "Projektujemy strony i sklepy, które zachwycają harmonią, lekkością i emocją",
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
      </head>
      <body className={`${spaceGrotesk.variable} font-sans antialiased bg-black text-[#F5F3FF]`}>
        {children}
        <WhatsAppButton />
        <Analytics />
        <SeoJsonLd json={organizationJsonLd} />
        <SeoJsonLd json={websiteJsonLd} />
        <SeoJsonLd json={serviceJsonLd} />
      </body>
    </html>
  );
}

