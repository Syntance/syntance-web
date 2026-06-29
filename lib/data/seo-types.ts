export interface PageSeo {
  id?: string
  pageName: string
  slug: string
  isActive: boolean
  metaTitle?: string
  metaDescription?: string
  canonicalUrl?: string
  focusKeyword?: string
  keywords?: string[]
  keywordDensity?: string
  ogTitle?: string
  ogDescription?: string
  ogImageUrl?: string
  twitterTitle?: string
  twitterDescription?: string
  seoNotes?: string
  lastUpdated?: string
}

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
      metadata: { dimensions: { width: number; height: number } }
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
  geo: { latitude: number; longitude: number }
  socialLinks: string[]
  openingHours: { opens: string; closes: string; days: string[] }
  services: Array<{
    name: string
    description: string
    serviceType: string
    priceRange?: string
    price?: number
  }>
}
