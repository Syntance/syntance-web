'use client'

import Link from 'next/link'
import Container from '@/components/container'
import SyntanceLogo from '@/components/syntance-logo'
import { CookieSettingsTrigger } from '@/components/cookie-settings-trigger'
import {
  footerCompanyLinks,
  footerLegalLinks,
  footerOfferLinks,
  type FooterLink,
} from '@/lib/data/footer-navigation'
import {
  legalFormLabel,
  legalContactEmail,
  legalContactPhone,
  legalNip,
  legalRegon,
  legalTradeName,
} from '@/lib/data/legal-entity'
import { cn } from '@/lib/utils'

type FooterProps = {
  className?: string
}

function FooterColumn({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-300 mb-4">
        {title}
      </h2>
      {children}
    </div>
  )
}

const footerLinkClass =
  'text-sm font-light text-zinc-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white focus-visible:underline underline-offset-4'

function FooterNavList({ links }: { links: FooterLink[] }) {
  return (
    <ul className="space-y-2.5">
      {links.map((link) => (
        <li key={link.href}>
          {link.external ? (
            <a href={link.href} className={footerLinkClass}>
              {link.label}
            </a>
          ) : (
            <Link href={link.href} className={footerLinkClass}>
              {link.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function Footer({ className }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer
      id="site-footer"
      className={cn(
        'relative z-10 border-t border-white/[0.06] bg-black pt-14 pb-[max(5rem,calc(env(safe-area-inset-bottom,0px)+3.5rem))] lg:pb-[max(4rem,calc(env(safe-area-inset-bottom,0px)+2.5rem))]',
        className,
      )}
      aria-labelledby="footer-heading"
    >
      <Container>
        <h2 id="footer-heading" className="sr-only">
          Stopka serwisu
        </h2>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Imprint + marka */}
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="inline-block rounded-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              aria-label="Syntance — strona główna"
            >
              <SyntanceLogo className="h-9" />
            </Link>
            <p className="mt-4 max-w-xs text-sm font-light leading-relaxed text-zinc-300">
              Strony i sklepy Next.js z naciskiem na strategię, wydajność i konwersję.
            </p>
            <address className="mt-6 not-italic text-sm font-light leading-relaxed text-zinc-400 space-y-1">
              <span className="block text-zinc-200">{legalFormLabel}</span>
              <span className="block text-zinc-300">{legalTradeName}</span>
              <span className="block">Czerniec 72, 33-390 Łącko</span>
              <span className="block">
                NIP: {legalNip} · REGON: {legalRegon}
              </span>
              <span className="block pt-2">
                <a
                  href={`mailto:${legalContactEmail}`}
                  className="text-zinc-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white focus-visible:underline underline-offset-4"
                >
                  {legalContactEmail}
                </a>
              </span>
              <span className="block">
                <a
                  href="tel:+48537110170"
                  className="text-zinc-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white focus-visible:underline underline-offset-4"
                >
                  {legalContactPhone}
                </a>
              </span>
            </address>
          </div>

          <div className="lg:col-span-2">
            <FooterColumn title="Oferta">
              <FooterNavList links={footerOfferLinks} />
            </FooterColumn>
          </div>

          <div className="lg:col-span-3">
            <FooterColumn title="Firma">
              <FooterNavList links={footerCompanyLinks} />
            </FooterColumn>
          </div>

          <div className="lg:col-span-3">
            <FooterColumn title="Informacje prawne">
              <ul className="space-y-2.5">
                {footerLegalLinks.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a href={link.href} className={footerLinkClass}>
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className={footerLinkClass}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
                <li>
                  <CookieSettingsTrigger className={`${footerLinkClass} cursor-pointer text-left`} />
                </li>
              </ul>
            </FooterColumn>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 border-t border-white/[0.06] pt-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs font-light tracking-wider text-zinc-400">
            © {year} {legalTradeName}. Wszelkie prawa zastrzeżone.
          </p>
          <p className="text-xs font-light text-zinc-400">
            Punkt kontaktowy (RODO, reklamacje, dostępność):{' '}
            <a
              href={`mailto:${legalContactEmail}`}
              className="text-zinc-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white focus-visible:underline underline-offset-4"
            >
              {legalContactEmail}
            </a>
          </p>
        </div>
      </Container>
    </footer>
  )
}
