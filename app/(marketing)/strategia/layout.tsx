import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Strategia Strony Internetowej | Syntance',
  description: 'Dlaczego strona nie generuje leadów? Bo nie ma strategii. Poznaj 3 fundamenty skutecznej strony: cel biznesowy, buyer persona i UVP. Warsztat Discovery od 4 500 PLN.',
  keywords: 'strategia strony internetowej, buyer persona, UVP, cel biznesowy strony, warsztat discovery, strona B2B',
  openGraph: {
    title: 'Strategia Strony Internetowej | Syntance',
    description: 'Dlaczego strona nie generuje leadów? Bo nie ma strategii. Poznaj 3 fundamenty skutecznej strony.',
    url: 'https://syntance.com/strategia',
  },
  alternates: {
    canonical: 'https://syntance.com/strategia',
  },
}

export default function StrategiaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
