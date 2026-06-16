export type PortfolioProjectType = 'website' | 'ecommerce'

export interface PortfolioCaseStudy {
  id: string
  name: string
  url: string
  domain: string
  type: PortfolioProjectType
  typeLabel: string
  description: string
  highlights: readonly string[]
  stack: readonly string[]
  order: number
  logoUrl?: string
  logoAlt?: string
}

export const PORTFOLIO_CASE_STUDIES: readonly PortfolioCaseStudy[] = [
  {
    id: 'lumine-concept',
    name: 'Lumine Concept',
    url: 'https://lumineconcept.pl',
    domain: 'lumineconcept.pl',
    type: 'ecommerce',
    typeLabel: 'Sklep internetowy',
    description:
      'Sklep i branding salonu beauty — logo 3D, tabliczki z plexi oraz sprzedaż online w spójnej, premium identyfikacji wizualnej marki.',
    highlights: [
      'Sklep internetowy w estetyce marki salonu',
      'Spójna identyfikacja wizualna (logo 3D, plexi)',
      'Layout pod konwersję i prezentację produktów',
    ],
    stack: ['Next.js', 'Medusa', 'Vercel', 'R2'],
    order: 1,
  },
  {
    id: 'retrohouse',
    name: 'RetroHouse',
    url: 'https://sklep-retrohouse.pl',
    domain: 'sklep-retrohouse.pl',
    type: 'ecommerce',
    typeLabel: 'Sklep internetowy',
    description:
      'Sklep z antykami i vintage prosto z Wiednia — katalog kategorii (porcelana, szkło, meble), sprzedaż online i lokal w Nowym Targu.',
    highlights: [
      'Katalog produktów z kategoriami premium',
      'Formularz kontaktu i obsługa zapytań B2B',
      'Architektura pod skalowanie kolekcji',
    ],
    stack: ['Next.js', 'Medusa', 'Vercel', 'R2'],
    order: 2,
  },
] as const

export function getPortfolioTypeDotColor(type: PortfolioProjectType): string {
  return type === 'ecommerce' ? 'oklch(0.72 0.17 162)' : 'oklch(0.72 0.14 250)'
}

export function toPortfolioGridItems(
  items: readonly PortfolioCaseStudy[],
): Array<{
  id: string
  name: string
  url: string
  logoUrl: string
  logoAlt: string
  order?: number
}> {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    url: item.url,
    logoUrl: item.logoUrl ?? '',
    logoAlt: item.logoAlt ?? item.name,
    order: item.order,
  }))
}
