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
    default: "Syntance — Studio technologiczne | Strony, sklepy, AI",
    template: "%s | Syntance",
  },
  description:
    "Studio technologiczne specjalizujące się w tworzeniu stron internetowych, sklepów online i rozwiązań AI. Next.js, React, automatyzacja procesów biznesowych.",
  keywords: "strony internetowe, sklepy online, AI, Next.js, React, automatyzacja, studio technologiczne, web development, Polska",
  authors: [{ name: "Syntance" }],
  creator: "Syntance",
  publisher: "Syntance",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Syntance — Studio technologiczne | Strony, sklepy, AI",
    description: "Studio technologiczne specjalizujące się w tworzeniu stron internetowych, sklepów online i rozwiązań AI. Next.js, React, automatyzacja procesów biznesowych.",
    url: "https://syntance.com",
    siteName: "Syntance",
    images: [
      {
        url: "/og/og-home-1200x630.png",
        width: 1200,
        height: 630,
        alt: "Syntance - Studio technologiczne",
      }
    ],
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Syntance — Studio technologiczne",
    description: "Studio technologiczne specjalizujące się w tworzeniu stron internetowych, sklepów online i rozwiązań AI.",
    images: ["/og/og-home-1200x630.png"],
    creator: "@syntance",
  },
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
  alternates: {
    canonical: "https://syntance.com",
  },
  icons: { 
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Syntance",
    "legalName": "Syntance Studio",
    "url": "https://syntance.com",
    "logo": "https://syntance.com/og/syntance-logo.png",
    "description": "Studio technologiczne specjalizujące się w tworzeniu stron internetowych, sklepów online i rozwiązań AI.",
    "email": "kontakt@syntance.com",
    "telephone": "+48662519544",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "PL"
    },
    "sameAs": [
      "https://twitter.com/syntance",
      "https://linkedin.com/company/syntance",
      "https://github.com/syntance"
    ],
    "foundingDate": "2023",
    "founders": [
      {
        "@type": "Person",
        "name": "Kamil Podobiński"
      }
    ]
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Syntance",
    "url": "https://syntance.com",
    "description": "Studio technologiczne - strony internetowe, sklepy online, rozwiązania AI",
    "publisher": {
      "@type": "Organization",
      "name": "Syntance",
      "url": "https://syntance.com"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://syntance.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
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
      </body>
    </html>
  );
}

