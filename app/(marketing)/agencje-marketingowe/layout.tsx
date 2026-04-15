import { Metadata } from 'next'

const canonical = 'https://syntance.com/agencje-marketingowe'

export const metadata: Metadata = {
  title: 'White-Label Next.js | Strony pod marką Twojej agencji | Syntance',
  description:
    'Dostarczamy strony Next.js pod Twoją marką. PageSpeed 96+, NDA, SLA. Marża 40-60% dla agencji. Cennik partnerski od 2 900 PLN.',
  keywords: [
    'white label strony internetowe',
    'partner dev dla agencji',
    'outsourcing stron Next.js',
    'white label web development Polska',
    'strony pod marką agencji',
  ],
  openGraph: {
    title: 'White-Label Next.js | Strony pod marką Twojej agencji | Syntance',
    description:
      'Dostarczamy strony Next.js pod Twoją marką. PageSpeed 96+, NDA, SLA. Marża 40-60% dla agencji. Cennik partnerski od 2 900 PLN.',
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

export default function AgencjeMarketingoweLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
