import { SeoSettings } from '@/sanity/queries/seo'

interface SchemaProps {
  seo: SeoSettings
}

export function OrganizationSchemaDynamic({ seo }: SchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": `${seo.canonicalUrl}/#organization`,
          name: seo.organizationName,
          url: seo.canonicalUrl,
          logo: `${seo.canonicalUrl}/logo.png`,
          description: seo.organizationDescription,
          foundingDate: seo.foundingDate,
          founder: {
            "@type": "Person",
            name: seo.founderName,
          },
          address: {
            "@type": "PostalAddress",
            streetAddress: seo.address?.street,
            addressLocality: seo.address?.city,
            postalCode: seo.address?.postalCode,
            addressRegion: seo.address?.region,
            addressCountry: seo.address?.country,
          },
          contactPoint: {
            "@type": "ContactPoint",
            telephone: seo.contactPhone,
            email: seo.contactEmail,
            contactType: "customer service",
            availableLanguage: ["Polish", "English"],
          },
          sameAs: seo.socialLinks || [],
        }),
      }}
    />
  )
}

export function ServicesSchemaDynamic({ seo }: SchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: seo.services?.map((service, index) => ({
            "@type": "Service",
            position: index + 1,
            name: service.name,
            description: service.description,
            provider: { "@type": "Organization", name: seo.organizationName },
            areaServed: "PL",
            serviceType: service.serviceType,
            offers: {
              "@type": "Offer",
              ...(service.price 
                ? { price: service.price.toString(), priceCurrency: "PLN" }
                : { priceRange: service.priceRange, priceCurrency: "PLN" }
              ),
            },
          })) || [],
        }),
      }}
    />
  )
}

export function LocalBusinessSchemaDynamic({ seo }: SchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": `${seo.canonicalUrl}/#localbusiness`,
          name: seo.organizationName,
          image: `${seo.canonicalUrl}/logo.png`,
          url: seo.canonicalUrl,
          telephone: seo.contactPhone,
          email: seo.contactEmail,
          priceRange: "$$",
          address: {
            "@type": "PostalAddress",
            streetAddress: seo.address?.street,
            addressLocality: seo.address?.city,
            postalCode: seo.address?.postalCode,
            addressRegion: seo.address?.region,
            addressCountry: seo.address?.country,
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: seo.geo?.latitude,
            longitude: seo.geo?.longitude,
          },
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: seo.openingHours?.days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: seo.openingHours?.opens || "09:00",
            closes: seo.openingHours?.closes || "17:00",
          },
        }),
      }}
    />
  )
}

export function WebSiteSchemaDynamic({ seo }: SchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${seo.canonicalUrl}/#website`,
          url: seo.canonicalUrl,
          name: seo.organizationName,
          description: seo.metaDescription,
          publisher: {
            "@id": `${seo.canonicalUrl}/#organization`,
          },
          inLanguage: "pl-PL",
        }),
      }}
    />
  )
}

// Komponent łączący wszystkie schematy
export function AllSchemasDynamic({ seo }: SchemaProps) {
  return (
    <>
      <OrganizationSchemaDynamic seo={seo} />
      <ServicesSchemaDynamic seo={seo} />
      <LocalBusinessSchemaDynamic seo={seo} />
      <WebSiteSchemaDynamic seo={seo} />
    </>
  )
}
