import type { PortfolioProjectType } from '@/lib/portfolio-content'

export const PORTFOLIO_PROJECT_TYPE_OPTIONS: Array<{
  value: PortfolioProjectType
  label: string
}> = [
  { value: 'website', label: 'Strona internetowa' },
  { value: 'ecommerce', label: 'Sklep internetowy' },
]

export function slugifyPortfolioName(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || `realizacja-${crypto.randomUUID().slice(0, 8)}`
}
