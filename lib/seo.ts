import { Metadata } from 'next'
import { clientWithoutToken } from '@/sanity/lib/client'
import { seoSettingsQuery, SeoSettings, pageSeoQuery, PageSeo } from '@/sanity/queries/seo'

// Domyślne wartości SEO (fallback)
const defaultSeo: SeoSettings = {
  metaTitle: 'Syntance — Strony i sklepy Next.js | PageSpeed 90+ | Polska',
  metaTitleTemplate: '%s | Syntance',
  metaDescription: 'Szybkie strony i sklepy internetowe z gwarancją PageSpeed 90+. Strategia przed kodem. Strony od 5k PLN, sklepy od 20k PLN. Pełna własność kodu. Realizacja w 2-4 tygodnie.',
  canonicalUrl: 'https://syntance.com',
  keywords: [
    'strony Next.js',
    'sklepy Next.js',
    'strony internetowe Next.js',
    'sklep e-commerce Next.js',
    'MedusaJS sklep',
    'Headless CMS',
    'Sanity CMS',
    'PageSpeed 90+',
    'strony dla firm',
    'Next.js Polska',
    'tworzenie stron Next.js',
    'szybkie strony internetowe',
  ],
  ogTitle: 'Syntance — Strony i sklepy Next.js | PageSpeed 90+',
  ogDescription: 'Szybkie strony i sklepy internetowe z gwarancją PageSpeed 90+. Strategia przed kodem. Strony od 5k PLN. Realizacja w 2-4 tygodnie.',
  ogImageUrl: 'https://syntance.com/og/og-home-1200x630.png',
  twitterTitle: 'Syntance — Strony i sklepy Next.js | PageSpeed 90+',
  twitterDescription: 'Szybkie strony i sklepy internetowe z gwarancją PageSpeed 90+. Strategia przed kodem. Strony od 5k PLN. Realizacja w 2-4 tygodnie.',
  twitterImageAlt: 'Syntance - Studio tworzące szybkie strony i sklepy internetowe Next.js',
  organizationName: 'Syntance',
  organizationDescription: 'Studio oferujące strony, sklepy i aplikacje SaaS na Next.js. PageSpeed 90+ gwarantowany.',
  foundingDate: '2024',
  founderName: 'Kamil Podobiński',
  contactEmail: 'kontakt@syntance.com',
  contactPhone: '+48662519544',
  address: {
    street: 'Czerniec 72',
    city: 'Łącko',
    postalCode: '33-390',
    region: 'Małopolskie',
    country: 'PL',
  },
  geo: {
    latitude: 49.5733,
    longitude: 20.3894,
  },
  socialLinks: [
    'https://github.com/Syntance',
    'https://linkedin.com/company/syntance',
  ],
  openingHours: {
    opens: '09:00',
    closes: '17:00',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  services: [
    {
      name: 'Strony WWW Next.js',
      description: 'Ultra-szybkie strony internetowe na Next.js z PageSpeed 90+ gwarantowanym. Strategia przed kodem, pełna własność kodu.',
      serviceType: 'Web Development',
      priceRange: '5000-15000 PLN',
    },
    {
      name: 'Sklepy E-commerce Next.js',
      description: 'Headless e-commerce na MedusaJS i Next.js. Szybkie, skalowalne sklepy bez prowizji.',
      serviceType: 'E-commerce Development',
      priceRange: 'od 20000 PLN',
    },
    {
      name: 'Warsztat Discovery',
      description: 'Strategia przed kodem - analiza biznesu, buyer persony, UVP, architektura informacji.',
      serviceType: 'Business Consulting',
      price: 4500,
    },
    {
      name: 'Aplikacje Webowe',
      description: 'Dedykowane systemy, panele administracyjne i aplikacje SaaS.',
      serviceType: 'Software Development',
      priceRange: 'od 50000 PLN',
    },
  ],
}

// Pobierz ustawienia SEO z Sanity (z cache)
export async function getSeoSettings(): Promise<SeoSettings> {
  try {
    const settings = await clientWithoutToken.fetch<SeoSettings | null>(
      seoSettingsQuery,
      {},
      { 
        next: { 
          revalidate: 60 // Cache na 60 sekund
        } 
      }
    )
    
    if (!settings) {
      return defaultSeo
    }
    
    // Merge z domyślnymi wartościami (dla pustych pól)
    return {
      ...defaultSeo,
      ...settings,
      keywords: settings.keywords?.length ? settings.keywords : defaultSeo.keywords,
      services: settings.services?.length ? settings.services : defaultSeo.services,
      socialLinks: settings.socialLinks?.length ? settings.socialLinks : defaultSeo.socialLinks,
      address: settings.address ? { ...defaultSeo.address, ...settings.address } : defaultSeo.address,
      geo: settings.geo ? { ...defaultSeo.geo, ...settings.geo } : defaultSeo.geo,
      openingHours: settings.openingHours ? { ...defaultSeo.openingHours, ...settings.openingHours } : defaultSeo.openingHours,
    }
  } catch (error) {
    console.error('Error fetching SEO settings from Sanity:', error)
    return defaultSeo
  }
}

// Pobierz SEO dla konkretnej strony (z cache)
export async function getPageSeo(slug: string): Promise<PageSeo | null> {
  try {
    const pageSeo = await clientWithoutToken.fetch<PageSeo | null>(
      pageSeoQuery,
      { slug },
      { 
        next: { 
          revalidate: 60 // Cache na 60 sekund
        } 
      }
    )
    
    return pageSeo
  } catch (error) {
    console.error(`Error fetching page SEO for slug "${slug}":`, error)
    return null
  }
}

// Merguj SEO strony z globalnym SEO (strona ma priorytet)
export function mergeSeoSettings(global: SeoSettings, page: PageSeo | null): SeoSettings {
  if (!page) return global
  
  return {
    ...global,
    // Override z page SEO (jeśli istnieje)
    metaTitle: page.metaTitle || global.metaTitle,
    metaDescription: page.metaDescription || global.metaDescription,
    canonicalUrl: page.canonicalUrl || global.canonicalUrl,
    keywords: page.keywords?.length ? page.keywords : global.keywords,
    ogTitle: page.ogTitle || page.metaTitle || global.ogTitle,
    ogDescription: page.ogDescription || page.metaDescription || global.ogDescription,
    ogImage: page.ogImage || global.ogImage,
    ogImageUrl: page.ogImageUrl || global.ogImageUrl,
    twitterTitle: page.twitterTitle || page.metaTitle || global.twitterTitle,
    twitterDescription: page.twitterDescription || page.metaDescription || global.twitterDescription,
  }
}

// Generuj Metadata z Next.js na podstawie ustawień Sanity
export async function generateSeoMetadata(pathname?: string): Promise<Metadata> {
  const globalSeo = await getSeoSettings()
  
  // Jeśli podano pathname, spróbuj pobrać SEO dla tej strony
  let pageSeo: PageSeo | null = null
  if (pathname) {
    // Zamień pathname na slug (usuń trailing slash)
    const slug = pathname === '/' ? '/' : pathname.replace(/\/$/, '')
    pageSeo = await getPageSeo(slug)
  }
  
  // Merguj global SEO z page SEO
  const seo = mergeSeoSettings(globalSeo, pageSeo)
  
  const ogImageUrl = seo.ogImage?.asset?.url || seo.ogImageUrl || defaultSeo.ogImageUrl
  
  return {
    metadataBase: new URL(seo.canonicalUrl || 'https://syntance.com'),
    title: {
      default: seo.metaTitle,
      template: seo.metaTitleTemplate,
    },
    description: seo.metaDescription,
    keywords: seo.keywords,
    authors: [{ name: seo.organizationName, url: seo.canonicalUrl }],
    creator: seo.organizationName,
    publisher: `${seo.organizationName} P.S.A.`,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: seo.ogTitle || seo.metaTitle,
      description: seo.ogDescription || seo.metaDescription,
      url: seo.canonicalUrl,
      siteName: seo.organizationName,
      images: [
        {
          url: ogImageUrl!,
          width: seo.ogImage?.asset?.metadata?.dimensions?.width || 1200,
          height: seo.ogImage?.asset?.metadata?.dimensions?.height || 630,
          alt: seo.ogImage?.alt || seo.ogTitle || seo.metaTitle,
        },
      ],
      locale: 'pl_PL',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.twitterTitle || seo.ogTitle || seo.metaTitle,
      description: seo.twitterDescription || seo.ogDescription || seo.metaDescription,
      images: [
        {
          url: ogImageUrl!,
          alt: seo.twitterImageAlt || seo.ogImage?.alt || seo.metaTitle,
        },
      ],
    },
    alternates: {
      canonical: seo.canonicalUrl,
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    category: 'technology',
  }
}

// Eksportuj domyślne SEO dla użycia w innych miejscach
export { defaultSeo }
