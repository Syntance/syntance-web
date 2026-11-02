export interface MagazynNavItem {
  href: string
  label: string
  /** Aktywny także dla podstron (domyślnie tak, poza korzeniem sekcji). */
  exact?: boolean
}

export interface MagazynNavGroup {
  label: string
  items: MagazynNavItem[]
}

/** Nawigacja Magazynu: grupy według tego, czym właściciel zarządza. */
export const MAGAZYN_NAV_GROUPS: MagazynNavGroup[] = [
  { label: 'Start', items: [{ href: '/magazyn', label: 'Przegląd', exact: true }] },
  {
    label: 'Syntance Studio',
    items: [
      { href: '/magazyn/studio', label: 'Pulpit Studio', exact: true },
      { href: '/magazyn/studio/licencje', label: 'Licencje' },
      { href: '/magazyn/studio/klienci', label: 'Klienci' },
      { href: '/magazyn/studio/kody', label: 'Kody promocyjne' },
      { href: '/magazyn/studio/zamowienia', label: 'Zamówienia' },
      { href: '/magazyn/studio/ceny', label: 'Ceny (Paddle)' },
      { href: '/magazyn/studio/moduly', label: 'Moduły i katalog' },
      { href: '/magazyn/studio/audyt', label: 'Dziennik audytu' },
    ],
  },
  {
    label: 'Rezerwacje',
    items: [
      { href: '/magazyn/rezerwacje', label: 'Rezerwacje' },
      { href: '/magazyn/blokady', label: 'Blokady' },
      { href: '/magazyn/regulamin', label: 'Reguły bookingu' },
    ],
  },
  {
    label: 'Strona i sprzedaż',
    items: [
      { href: '/magazyn/cms', label: 'CMS' },
      { href: '/magazyn/seo', label: 'SEO' },
      { href: '/magazyn/cennik', label: 'Cennik' },
      { href: '/magazyn/emaile', label: 'E-maile' },
      { href: '/magazyn/model-partnerski', label: 'Model partnerski' },
    ],
  },
  { label: 'System', items: [{ href: '/magazyn/ustawienia', label: 'Ustawienia' }] },
]

export const MAGAZYN_NAV = MAGAZYN_NAV_GROUPS.flatMap((g) => g.items)

export function isNavActive(pathname: string, item: MagazynNavItem): boolean {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
}
