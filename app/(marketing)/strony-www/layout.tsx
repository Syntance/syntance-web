import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Strony internetowe dla firm | Profesjonalne strony www Next.js | Syntance',
  description: 'Tworzymy profesjonalne strony internetowe dla firm B2B. Next.js, PageSpeed 90+, strategia przed kodem. Strony od 5 400 PLN. Bezpłatna wycena →',
  keywords: [
    'tworzenie stron internetowych',
    'strona internetowa dla firmy',
    'profesjonalna strona internetowa',
    'strony dla firm',
    'strona www dla firmy',
    'strona internetowa Next.js',
    'strona B2B',
    'szybka strona internetowa',
    'tworzenie stron internetowych Kraków',
    'strony internetowe Małopolska',
    'agencja webowa Polska',
  ],
  openGraph: {
    title: 'Strony internetowe dla firm | Syntance',
    description: 'Profesjonalne strony www w Next.js z gwarancją PageSpeed 90+. Strategia przed kodem. Strony od 5 400 PLN.',
    url: 'https://syntance.com/strony-www',
  },
  alternates: {
    canonical: 'https://syntance.com/strony-www',
  },
}

export default function StronyWWWLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
