import SeoJsonLd from "@/components/SeoJsonLd";

export default function PageSeoContent() {
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "Product",
        "position": 1,
        "name": "Syntance Studio",
        "description": "Projektujemy strony i sklepy, które zachwycają harmonią, lekkością i emocją.",
        "brand": {
          "@type": "Brand",
          "name": "Syntance"
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "PLN",
          "price": "Od 2500",
          "availability": "https://schema.org/InStock"
        }
      },
      {
        "@type": "Product",
        "position": 2,
        "name": "Syntance AI",
        "description": "Inteligentne rozwiązania AI, które automatyzują procesy i wspierają decyzje biznesowe.",
        "brand": {
          "@type": "Brand",
          "name": "Syntance"
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "PLN",
          "price": "Od 5000",
          "availability": "https://schema.org/InStock"
        }
      }
    ]
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Syntance",
    "image": "https://syntance.com/og/syntance-logo.png",
    "@id": "https://syntance.com",
    "url": "https://syntance.com",
    "telephone": "+48662519544",
    "email": "kontakt@syntance.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "PL"
    },
    "priceRange": "$$",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "09:00",
      "closes": "17:00"
    },
    "sameAs": [
      "https://twitter.com/syntance",
      "https://linkedin.com/company/syntance",
      "https://github.com/syntance"
    ]
  };

  return (
    <>
      <SeoJsonLd json={productJsonLd} />
      <SeoJsonLd json={localBusinessJsonLd} />
    </>
  );
}
