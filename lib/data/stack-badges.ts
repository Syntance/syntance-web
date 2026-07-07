export type StackBadgeRecord = {
  id: string
  name: string
  definition: string
  dotColor: string
  showInHero: boolean
  showInValues: boolean
  sortOrder: number
}

export const DEFAULT_STACK_BADGES: StackBadgeRecord[] = [
  {
    id: 'nextjs',
    name: 'Next.js',
    definition:
      'Framework React do stron i aplikacji webowych — szybkie ładowanie, SEO i skalowalność bez wtyczek.',
    dotColor: 'oklch(0.92 0 0)',
    showInHero: true,
    showInValues: true,
    sortOrder: 0,
  },
  {
    id: 'medusa',
    name: 'Medusa',
    definition:
      'Headless backend e-commerce — produkty, koszyk i zamówienia bez prowizji platformy SaaS.',
    dotColor: 'oklch(0.72 0.17 162)',
    showInHero: true,
    showInValues: true,
    sortOrder: 1,
  },
  {
    id: 'syntance-cms',
    name: 'Syntance CMS',
    definition:
      'Autorski moduł do zarządzania treścią, stroną i SEO — w standardzie każdego projektu Syntance.',
    dotColor: 'oklch(0.72 0.18 290)',
    showInHero: true,
    showInValues: true,
    sortOrder: 2,
  },
  {
    id: 'syntance-shop',
    name: 'Syntance Shop',
    definition:
      'Moduł sklepu w panelu Syntance — produkty, zamówienia i płatności w jednym miejscu.',
    dotColor: 'oklch(0.72 0.14 230)',
    showInHero: true,
    showInValues: true,
    sortOrder: 3,
  },
  {
    id: 'sanity',
    name: 'Sanity',
    definition:
      'Opcjonalny headless CMS — gdy potrzebujesz zaawansowanych workflow treści zamiast Syntance CMS.',
    dotColor: 'oklch(0.65 0.22 25)',
    showInHero: false,
    showInValues: true,
    sortOrder: 4,
  },
  {
    id: 'vercel',
    name: 'Vercel',
    definition: 'Hosting i CDN zoptymalizowany pod Next.js — szybkie deploye i edge na całym świecie.',
    dotColor: 'oklch(0.78 0 0)',
    showInHero: false,
    showInValues: true,
    sortOrder: 5,
  },
  {
    id: 'r2',
    name: 'R2',
    definition:
      'Object storage Cloudflare — media i pliki projektu bez kosztów transferu wychodzącego (egress).',
    dotColor: 'oklch(0.72 0.18 55)',
    showInHero: false,
    showInValues: true,
    sortOrder: 6,
  },
  {
    id: 'github',
    name: 'GitHub',
    definition: 'Repozytorium kodu źródłowego — pełna własność, kontrola wersji i audyt zmian.',
    dotColor: 'oklch(0.75 0.05 300)',
    showInHero: false,
    showInValues: true,
    sortOrder: 7,
  },
]

export function slugifyStackBadgeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}
