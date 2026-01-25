import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sklepy internetowe headless | MedusaJS & Next.js | Syntance',
  description: 'Budujemy sklepy internetowe w architekturze headless. MedusaJS, Next.js, zero prowizji. Sklepy od 12 000 PLN. Wycena w 24h →',
  keywords: [
    'ile kosztuje sklep internetowy',
    'sklep internetowy dla firmy',
    'sklep internetowy headless',
    'headless ecommerce',
    'sklep next.js',
    'medusajs sklep',
    'własny sklep internetowy',
    'sklep dla producenta',
    'alternatywa dla Shopify',
    'własny sklep zamiast Allegro',
    'sklep internetowy Kraków',
    'tworzenie sklepów internetowych Polska',
    'agencja e-commerce Małopolska',
  ],
  openGraph: {
    title: 'Sklepy internetowe headless | MedusaJS & Next.js | Syntance',
    description: 'Budujemy sklepy e-commerce w architekturze headless. Zero prowizji, pełna kontrola. Sklepy od 12 000 PLN.',
    url: 'https://syntance.com/sklepy-internetowe',
  },
  alternates: {
    canonical: 'https://syntance.com/sklepy-internetowe',
  },
}

export default function SklepyInternetoweLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
