import { groq } from 'next-sanity'

// Zapytanie do pobrania wszystkich ustawień SEO
export const seoSettingsQuery = groq`
  *[_type == "seoSettings" && _id == "seoSettings"][0] {
    // Meta tagi
    metaTitle,
    metaTitleTemplate,
    metaDescription,
    canonicalUrl,
    
    // Słowa kluczowe
    keywords,
    
    // Open Graph
    ogTitle,
    ogDescription,
    ogImage {
      asset-> {
        url,
        metadata {
          dimensions {
            width,
            height
          }
        }
      },
      alt
    },
    ogImageUrl,
    
    // Twitter
    twitterTitle,
    twitterDescription,
    twitterImageAlt,
    
    // Schema.org
    organizationName,
    organizationDescription,
    foundingDate,
    founderName,
    contactEmail,
    contactPhone,
    address {
      street,
      city,
      postalCode,
      region,
      country
    },
    geo {
      latitude,
      longitude
    },
    socialLinks,
    openingHours {
      opens,
      closes,
      days
    },
    services[] {
      name,
      description,
      serviceType,
      priceRange,
      price
    }
  }
`

// Typ dla ustawień SEO
export interface SeoSettings {
  metaTitle: string
  metaTitleTemplate: string
  metaDescription: string
  canonicalUrl: string
  keywords: string[]
  ogTitle: string
  ogDescription: string
  ogImage?: {
    asset: {
      url: string
      metadata: {
        dimensions: {
          width: number
          height: number
        }
      }
    }
    alt: string
  }
  ogImageUrl?: string
  twitterTitle: string
  twitterDescription: string
  twitterImageAlt: string
  organizationName: string
  organizationDescription: string
  foundingDate: string
  founderName: string
  contactEmail: string
  contactPhone: string
  address: {
    street: string
    city: string
    postalCode: string
    region: string
    country: string
  }
  geo: {
    latitude: number
    longitude: number
  }
  socialLinks: string[]
  openingHours: {
    opens: string
    closes: string
    days: string[]
  }
  services: Array<{
    name: string
    description: string
    serviceType: string
    priceRange?: string
    price?: number
  }>
}
