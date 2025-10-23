import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import WhatsAppButton from "@/components/whatsapp-button";
import SeoJsonLd from "@/components/SeoJsonLd";
import { faqJsonLd } from "./faq-json-ld";
import { breadcrumbJsonLd } from "./breadcrumb-json-ld";
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
  keywords: "studio technologiczne, AI-first, strony internetowe, sklepy online, Next.js, React, automatyzacja, web development, Polska, rozwiązania AI, aplikacje webowe",
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
    site: "@syntance",
    creator: "@syntance",
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
    "email": "kontakt@syntance.com",
    "telephone": "+48662519544",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "PL",
      "addressLocality": "Polska"
    },
    "sameAs": [
      "https://twitter.com/syntance",
      "https://linkedin.com/company/syntance",
      "https://github.com/syntance",
      "https://facebook.com/syntance"
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
    "inLanguage": "pl",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://syntance.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
  
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": "https://syntance.com/#product-ai",
    "name": "Syntance AI",
    "description": "Inteligentne rozwiązania AI, które automatyzują procesy i wspierają decyzje biznesowe",
    "brand": {
      "@id": "https://syntance.com/#organization"
    },
    "provider": {
      "@id": "https://syntance.com/#organization"
    },
    "category": "Artificial Intelligence Solutions",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "PLN",
      "availability": "https://schema.org/InStock",
      "priceRange": "$$$",
      "url": "https://syntance.com/#products"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "27"
    }
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
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Usługi Web Development",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Strony internetowe",
            "description": "Projektowanie i tworzenie stron internetowych w Next.js"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Sklepy online",
            "description": "Tworzenie sklepów e-commerce z pełną integracją"
          }
        }
      ]
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
        <SeoJsonLd json={productJsonLd} />
        <SeoJsonLd json={serviceJsonLd} />
        <SeoJsonLd json={faqJsonLd} />
        <SeoJsonLd json={breadcrumbJsonLd} />
      </body>
    </html>
  );
}

