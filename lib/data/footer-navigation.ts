export type FooterLink = {
  label: string
  href: string
  external?: boolean
}

export const footerOfferLinks: FooterLink[] = [
  { label: 'Strony internetowe', href: '/strony-www' },
  { label: 'Sklepy internetowe', href: '/sklepy-internetowe' },
  { label: 'Dla agencji', href: '/agencje-marketingowe' },
  { label: 'Panel klienta', href: '/panel' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Cennik', href: '/cennik' },
]

export const footerCompanyLinks: FooterLink[] = [
  { label: 'O nas', href: '/o-nas' },
  { label: 'Kontakt', href: '/kontakt' },
  { label: 'Umów rozmowę', href: '/porozmawiajmy' },
  { label: 'Strategia marketingu', href: '/strategia-marketingu-i-sprzedazy' },
  { label: 'Technologia Next.js', href: '/nextjs' },
]

export const footerLegalLinks: FooterLink[] = [
  { label: 'Polityka prywatności', href: '/polityka-prywatnosci' },
  { label: 'Regulamin', href: '/regulamin' },
  { label: 'Reklamacje', href: '/regulamin#reklamacje' },
  {
    label: 'Zgłoś problem z dostępnością',
    href: 'mailto:kontakt@syntance.com?subject=Zg%C5%82oszenie%20problemu%20z%20dost%C4%99pno%C5%9Bci%C4%85',
    external: true,
  },
]
