import { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

const canonical = 'https://syntance.com/dla-agencji'

const title = 'Współpraca partnerska dla agencji — strony Next.js'
const description =
  'Realizujemy strony i sklepy Next.js dla agencji, studiów i freelancerów. Cena to procent od cennika detalicznego, termin objęty karą umowną, kod w Twoim repozytorium. Tryb jawny albo white-label.'

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    path: '/dla-agencji',
    title: `${title} | Syntance`,
    description,
    ogTitle: title,
    keywords: [ 'partner deweloperski dla agencji', 'podwykonawca Next.js', 'white label strony internetowe', 'wdrożenie projektu z Figmy', 'outsourcing web development Polska', ],
    languages: { pl: canonical, },
  })
}

export default function DlaAgencjiLayout({ children }: { children: React.ReactNode }) {
  return children
}
