import type { SeoSettings } from '@/lib/data/seo-types'

export const defaultSeo: SeoSettings = {
  metaTitle: 'Syntance — Strony i sklepy Next.js | PageSpeed 90+ | Polska',
  metaTitleTemplate: '%s | Syntance',
  metaDescription:
    'Szybkie strony i sklepy internetowe z gwarancją PageSpeed 90+. Strategia marketingu i sprzedaży (faza przedwdrożeniowa). Strony od 5k PLN, sklepy od 20k PLN. Pełna własność kodu. Strony w 2-4 tygodnie, sklepy w 4-8 tygodni.',
  canonicalUrl: 'https://syntance.com',
  keywords: [
    'strony Next.js',
    'sklepy Next.js',
    'strony internetowe Next.js',
    'sklep e-commerce Next.js',
    'MedusaJS sklep',
    'Headless CMS',
    'PageSpeed 90+',
    'strony dla firm',
    'Next.js Polska',
    'tworzenie stron Next.js',
    'szybkie strony internetowe',
  ],
  ogTitle: 'Syntance — Strony i sklepy Next.js | PageSpeed 90+',
  ogDescription:
    'Szybkie strony i sklepy internetowe z gwarancją PageSpeed 90+. Strategia marketingu i sprzedaży (faza przedwdrożeniowa). Strony od 5k PLN. Strony w 2-4 tygodnie, sklepy w 4-8 tygodni.',
  ogImageUrl: 'https://syntance.com/og/og-home-1200x630.png',
  twitterTitle: 'Syntance — Strony i sklepy Next.js | PageSpeed 90+',
  twitterDescription:
    'Szybkie strony i sklepy internetowe z gwarancją PageSpeed 90+. Strategia marketingu i sprzedaży (faza przedwdrożeniowa). Strony od 5k PLN. Strony w 2-4 tygodnie, sklepy w 4-8 tygodni.',
  twitterImageAlt: 'Syntance - Studio tworzące szybkie strony i sklepy internetowe Next.js',
  organizationName: 'Syntance',
  organizationDescription: 'Studio oferujące strony, sklepy i aplikacje SaaS na Next.js. PageSpeed 90+ gwarantowany.',
  foundingDate: '2024',
  founderName: 'Kamil Podobiński',
  contactEmail: 'kontakt@syntance.com',
  contactPhone: '+48537110170',
  address: {
    street: 'Czerniec 72',
    city: 'Łącko',
    postalCode: '33-390',
    region: 'Małopolskie',
    country: 'PL',
  },
  geo: { latitude: 49.5733, longitude: 20.3894 },
  socialLinks: ['https://github.com/Syntance', 'https://linkedin.com/company/syntance'],
  openingHours: {
    opens: '09:00',
    closes: '17:00',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  services: [
    {
      name: 'Strony WWW Next.js',
      description:
        'Ultra-szybkie strony internetowe na Next.js z PageSpeed 90+ gwarantowanym. Strategia marketingu i sprzedaży przed kodem, pełna własność kodu.',
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
      name: 'Strategia marketingu i sprzedaży',
      description:
        'Faza przedwdrożeniowa: segmentacja rynku, pozycjonowanie, UVP, buyer persony, lejek, user flows, plan SEO i analityki.',
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
