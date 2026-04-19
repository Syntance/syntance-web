import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface LinkCard {
  title: string
  href: string
  description: string
  external?: boolean
}

const SANITY_PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'sqgw0wlq'

const CONTENT_LINKS: LinkCard[] = [
  {
    title: 'Sanity Studio (content)',
    href: `https://${SANITY_PROJECT}.sanity.studio`,
    description: 'Edytor treści — strony, SEO, FAQ, cennik, reguły bookingu.',
    external: true,
  },
  {
    title: '/porozmawiajmy',
    href: '/porozmawiajmy',
    description: 'Podgląd strony wizytówkowej z widgetem rezerwacji.',
    external: true,
  },
  {
    title: 'Strona główna',
    href: '/',
    description: 'Podgląd strony głównej w nowym oknie.',
    external: true,
  },
]

const INTEGRATIONS: LinkCard[] = [
  {
    title: 'Google Calendar',
    href: 'https://calendar.google.com/',
    description: 'Twój kalendarz — eventy tworzą się tu automatycznie.',
    external: true,
  },
  {
    title: 'Resend (maile)',
    href: 'https://resend.com/emails',
    description: 'Historia wysłanych maili (potwierdzenia, powiadomienia).',
    external: true,
  },
  {
    title: 'Attio (CRM)',
    href: 'https://app.attio.com/',
    description: 'CRM — leady z konfiguratora.',
    external: true,
  },
  {
    title: 'Vercel',
    href: 'https://vercel.com/',
    description: 'Deployment, logi, analytics.',
    external: true,
  },
  {
    title: 'Google Cloud (service account)',
    href: 'https://console.cloud.google.com/iam-admin/serviceaccounts',
    description: 'Klucze API do kalendarza.',
    external: true,
  },
]

function Card({ item }: { item: LinkCard }) {
  const content = (
    <div className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.04]">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-base font-medium text-white">{item.title}</h3>
        <ExternalLink className="h-4 w-4 flex-shrink-0 text-neutral-400 transition-colors group-hover:text-white" />
      </div>
      <p className="text-sm text-neutral-400">{item.description}</p>
    </div>
  )
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer">
        {content}
      </a>
    )
  }
  return <Link href={item.href}>{content}</Link>
}

export default function LinksPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-medium">Linki i narzędzia</h1>
        <p className="mt-1 text-neutral-400">Skróty do wszystkich zewnętrznych paneli, z których korzystasz.</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-neutral-500">Treść i strona</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONTENT_LINKS.map((l) => (
            <Card key={l.title} item={l} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-neutral-500">Integracje</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INTEGRATIONS.map((l) => (
            <Card key={l.title} item={l} />
          ))}
        </div>
      </section>
    </div>
  )
}
