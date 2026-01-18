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
    default: "Syntance — Strony i sklepy Next.js | PageSpeed 90+ | Polska",
    template: "%s | Syntance",
  },
  description:
    "Strony i sklepy Next.js z gwarancją PageSpeed 90+. Strategia przed kodem. Headless CMS, MedusaJS, Vercel. Własność kodu, zero vendor lock-in. Strony od 5k PLN, sklepy od 20k PLN.",
  keywords: [
    "strony Next.js",
    "sklepy Next.js", 
    "strony internetowe Next.js",
    "sklep e-commerce Next.js",
    "strony www Next.js",
    "tworzenie stron Next.js",
    "Next.js Polska",
    "MedusaJS sklep",
    "Headless CMS",
    "strony React",
    "sklepy React",
    "strony Vercel",
    "szybkie strony internetowe",
    "nowoczesne strony www",
    "strony dla firm",
    "sklepy online",
    "PageSpeed 90",
    "Sanity CMS",
  ],
  authors: [{ name: "Syntance", url: "https://syntance.com" }],
  creator: "Syntance",
  publisher: "Syntance",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Syntance — Strony i sklepy Next.js | PageSpeed 90+",
    description: "Strony i sklepy Next.js z gwarancją PageSpeed 90+. Strategia przed kodem. Headless CMS, MedusaJS, Vercel. Własność kodu, zero vendor lock-in. Strony od 5k PLN, sklepy od 20k PLN.",
    url: "https://syntance.com",
    siteName: "Syntance",
    images: [
      {
        url: "https://syntance.com/og/og-home-1200x630.png",
        width: 1200,
        height: 630,
        alt: "Syntance — Strony i sklepy Next.js",
        type: "image/png",
      }
    ],
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Syntance — Strony i sklepy Next.js | PageSpeed 90+",
    description: "Strony i sklepy Next.js z gwarancją PageSpeed 90+. Strategia przed kodem. Headless CMS, MedusaJS, Vercel. Własność kodu, zero vendor lock-in.",
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
    "@type": "ProfessionalService",
    "@id": "https://syntance.com/#organization",
    "name": "Syntance - Strony i sklepy Next.js",
    "legalName": "Syntance P.S.A.",
    "alternateName": ["Syntance", "Syntance Studio", "Strony Next.js Syntance"],
    "url": "https://syntance.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://syntance.com/og/syntance-logo.png",
      "width": 512,
      "height": 512
    },
    "image": "https://syntance.com/og/og-home-1200x630.png",
    "description": "Tworzymy strony internetowe i sklepy e-commerce w Next.js. PageSpeed 90+, MedusaJS, Headless CMS. Strony od 5000 PLN, sklepy od 20000 PLN.",
    "priceRange": "5000-50000 PLN",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "kontakt@syntance.com",
      "telephone": "+48662519544",
      "contactType": "sales",
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
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 49.5669,
      "longitude": 20.4259
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
    "knowsAbout": ["Next.js", "React", "Strony internetowe", "Sklepy e-commerce", "Headless CMS", "MedusaJS", "Vercel", "TypeScript", "Tailwind CSS"],
    "slogan": "Strony i sklepy Next.js - Ultra-szybkie, bezpieczne i gotowe na przyszłość",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Usługi tworzenia stron i sklepów Next.js",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Strony WWW",
            "description": "Strony wizytówkowe, landing page, strony firmowe w Next.js"
          },
          "priceSpecification": {
            "@type": "PriceSpecification",
            "minPrice": "5000",
            "maxPrice": "15000",
            "priceCurrency": "PLN"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Sklepy E-commerce",
            "description": "Sklepy online na MedusaJS i Next.js"
          },
          "price": "20000",
          "priceCurrency": "PLN"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Warsztat Discovery",
            "description": "Strategia przed kodem - analiza potrzeb i specyfikacja"
          },
          "price": "4500",
          "priceCurrency": "PLN"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Aplikacje Webowe",
            "description": "Dedykowane aplikacje webowe i SaaS"
          },
          "price": "50000",
          "priceCurrency": "PLN"
        }
      ]
    }
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://syntance.com/#website",
    "name": "Strony i sklepy Next.js | Syntance",
    "url": "https://syntance.com",
    "description": "Tworzymy strony internetowe i sklepy e-commerce w Next.js. PageSpeed 90+, MedusaJS, Headless CMS.",
    "publisher": {
      "@id": "https://syntance.com/#organization"
    },
    "inLanguage": "pl",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://syntance.com/?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const serviceJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": "https://syntance.com/#service-websites",
      "name": "Strony WWW Next.js",
      "description": "Strony wizytówkowe, landing page, strony firmowe w Next.js. PageSpeed 90+ gwarantowany. Czas realizacji 2-4 tygodnie.",
      "provider": {
        "@id": "https://syntance.com/#organization"
      },
      "serviceType": "Web Development",
      "areaServed": {
        "@type": "Country",
        "name": "Polska"
      },
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "5000",
        "highPrice": "15000",
        "priceCurrency": "PLN"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": "https://syntance.com/#service-ecommerce",
      "name": "Sklepy E-commerce Next.js",
      "description": "Sklepy internetowe na MedusaJS i Next.js. Headless e-commerce, szybkie i skalowalne. Czas realizacji 4-6 tygodni.",
      "provider": {
        "@id": "https://syntance.com/#organization"
      },
      "serviceType": "E-commerce Development",
      "areaServed": {
        "@type": "Country",
        "name": "Polska"
      },
      "offers": {
        "@type": "Offer",
        "price": "20000",
        "priceCurrency": "PLN",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "minPrice": "20000",
          "priceCurrency": "PLN"
        }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": "https://syntance.com/#service-discovery",
      "name": "Warsztat Discovery",
      "description": "Strategia przed kodem. Analiza potrzeb, projektowanie UX, specyfikacja techniczna.",
      "provider": {
        "@id": "https://syntance.com/#organization"
      },
      "serviceType": "Consulting",
      "areaServed": {
        "@type": "Country",
        "name": "Polska"
      },
      "offers": {
        "@type": "Offer",
        "price": "4500",
        "priceCurrency": "PLN"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": "https://syntance.com/#service-webapp",
      "name": "Aplikacje Webowe",
      "description": "Dedykowane aplikacje webowe i SaaS na Next.js. Skalowalne rozwiązania dla biznesu.",
      "provider": {
        "@id": "https://syntance.com/#organization"
      },
      "serviceType": "Software Development",
      "areaServed": {
        "@type": "Country",
        "name": "Polska"
      },
      "offers": {
        "@type": "Offer",
        "price": "50000",
        "priceCurrency": "PLN",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "minPrice": "50000",
          "priceCurrency": "PLN"
        }
      }
    }
  ];

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://syntance.com/#localbusiness",
    "name": "Syntance",
    "description": "Strony i sklepy Next.js z gwarancją PageSpeed 90+",
    "url": "https://syntance.com",
    "telephone": "+48662519544",
    "email": "kontakt@syntance.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Czerniec 72",
      "addressLocality": "Łącko",
      "postalCode": "33-390",
      "addressRegion": "Małopolska",
      "addressCountry": "PL"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 49.5669,
      "longitude": 20.4259
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "17:00"
    },
    "priceRange": "5000-50000 PLN"
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
        <SeoJsonLd json={localBusinessJsonLd} />
        {serviceJsonLd.map((service, index) => (
          <SeoJsonLd key={index} json={service} />
        ))}
      </body>
    </html>
  );
}

