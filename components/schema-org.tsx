export function OrganizationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": "https://syntance.com/#organization",
          name: "Syntance",
          url: "https://syntance.com",
          logo: "https://syntance.com/logo.png",
          description: "Studio oferujące strony, sklepy i aplikacje SaaS na Next.js. PageSpeed 90+ gwarantowany.",
          foundingDate: "2024",
          founder: {
            "@type": "Person",
            name: "Kamil Podobiński",
          },
          address: {
            "@type": "PostalAddress",
            streetAddress: "Czerniec 72",
            addressLocality: "Łącko",
            postalCode: "33-390",
            addressRegion: "Małopolskie",
            addressCountry: "PL",
          },
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+48662519544",
            email: "kontakt@syntance.com",
            contactType: "customer service",
            availableLanguage: ["Polish", "English"],
          },
          sameAs: [
            "https://github.com/Syntance",
            "https://linkedin.com/company/syntance",
          ],
        }),
      }}
    />
  );
}

export function ServicesSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: [
            {
              "@type": "Service",
              position: 1,
              name: "Strony WWW Next.js",
              description: "Ultra-szybkie strony internetowe na Next.js z PageSpeed 90+ gwarantowanym. Strategia przed kodem, pełna własność kodu.",
              provider: { "@type": "Organization", name: "Syntance" },
              areaServed: "PL",
              serviceType: "Web Development",
              offers: {
                "@type": "Offer",
                priceRange: "5000-15000 PLN",
                priceCurrency: "PLN",
              },
            },
            {
              "@type": "Service",
              position: 2,
              name: "Sklepy E-commerce Next.js",
              description: "Headless e-commerce na MedusaJS i Next.js. Szybkie, skalowalne sklepy bez prowizji.",
              provider: { "@type": "Organization", name: "Syntance" },
              areaServed: "PL",
              serviceType: "E-commerce Development",
              offers: {
                "@type": "Offer",
                priceRange: "od 20000 PLN",
                priceCurrency: "PLN",
              },
            },
            {
              "@type": "Service",
              position: 3,
              name: "Warsztat Discovery",
              description: "Strategia przed kodem - analiza biznesu, buyer persony, UVP, architektura informacji.",
              provider: { "@type": "Organization", name: "Syntance" },
              areaServed: "PL",
              serviceType: "Business Consulting",
              offers: {
                "@type": "Offer",
                price: "4500",
                priceCurrency: "PLN",
              },
            },
            {
              "@type": "Service",
              position: 4,
              name: "Aplikacje Webowe",
              description: "Dedykowane systemy, panele administracyjne i aplikacje SaaS.",
              provider: { "@type": "Organization", name: "Syntance" },
              areaServed: "PL",
              serviceType: "Software Development",
              offers: {
                "@type": "Offer",
                priceRange: "od 50000 PLN",
                priceCurrency: "PLN",
              },
            },
          ],
        }),
      }}
    />
  );
}

export function LocalBusinessSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": "https://syntance.com/#localbusiness",
          name: "Syntance",
          image: "https://syntance.com/logo.png",
          url: "https://syntance.com",
          telephone: "+48662519544",
          email: "kontakt@syntance.com",
          priceRange: "$$",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Czerniec 72",
            addressLocality: "Łącko",
            postalCode: "33-390",
            addressRegion: "Małopolskie",
            addressCountry: "PL",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 49.5733,
            longitude: 20.3894,
          },
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "09:00",
            closes: "17:00",
          },
        }),
      }}
    />
  );
}

export function WebSiteSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": "https://syntance.com/#website",
          url: "https://syntance.com",
          name: "Syntance",
          description: "Strony i sklepy Next.js z gwarancją PageSpeed 90+",
          publisher: {
            "@id": "https://syntance.com/#organization",
          },
          inLanguage: "pl-PL",
        }),
      }}
    />
  );
}
