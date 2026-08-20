import { Metadata } from 'next'

const canonical = 'https://syntance.com/dla-agencji'

// Bez sufiksu „| Syntance” — dokłada go globalny `title.template` z ustawień SEO.
const title = 'Współpraca partnerska dla agencji — strony Next.js'
const description =
  'Realizujemy strony i sklepy Next.js dla agencji, studiów i freelancerów. Cena to procent od cennika detalicznego, termin objęty karą umowną, kod w Twoim repozytorium. Tryb jawny albo white-label.'

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'partner deweloperski dla agencji',
    'podwykonawca Next.js',
    'white label strony internetowe',
    'wdrożenie projektu z Figmy',
    'outsourcing web development Polska',
  ],
  openGraph: {
    title,
    description,
    url: canonical,
    locale: 'pl_PL',
  },
  alternates: {
    canonical,
    languages: {
      pl: canonical,
    },
  },
}

export default function DlaAgencjiLayout({ children }: { children: React.ReactNode }) {
  return children
}
