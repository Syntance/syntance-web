import Link from 'next/link'
import type { Metadata } from 'next'

const SITE_URL = 'https://syntance.com'

export const metadata: Metadata = {
  title: 'Realizacje i case studies — Syntance',
  description:
    'Wybrane projekty Syntance: strony Next.js i sklepy Next.js z naciskiem na strategię, performance i konwersję.',
  alternates: { canonical: `${SITE_URL}/realizacje` },
  openGraph: {
    url: `${SITE_URL}/realizacje`,
    title: 'Realizacje i case studies — Syntance',
    description:
      'Case studies z polami skutecznymi stronami i sklepami dla firm.',
    siteName: 'Syntance',
    locale: 'pl_PL',
  },
}

/** Krótka witryna pod canonical URL `/realizacje` — Notion jako punkt wyjścia z /porozmawiajmy. */
export default function RealizacjePage() {
  return (
    <main id="main-content" className="mx-auto max-w-2xl px-6 pt-16 pb-24 md:pb-32">
      <h1 className="mb-4 text-3xl font-light tracking-tight text-white md:text-4xl">
        Realizacje i&nbsp;case studies
      </h1>
      <p className="mb-10 text-[17px] leading-relaxed text-gray-300">
        Wybrane realizacje, metryki i kontekst strategii prezentujemy w sekcji
        portfolio na stronie głównej — tam jest największa gęstość case studies.
      </p>
      <Link
        href="/#portfolio-studio"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-8 py-3 text-[15px] font-medium tracking-wide text-white transition hover:border-white/30 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
      >
        Zobacz portfolio na stronie głównej
      </Link>
      <p className="mt-10 text-sm text-gray-500">
        Wracam do:&nbsp;
        <Link href="/porozmawiajmy" className="text-gray-300 underline underline-offset-4 hover:text-white">
          zamówienie audytu
        </Link>
      </p>
    </main>
  )
}
