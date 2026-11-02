export interface MagazynNavItem {
  href: string
  label: string
  /** Aktywny także dla podstron (domyślnie tak). */
  exact?: boolean
}

export interface MagazynSection {
  id: 'strona' | 'studio'
  label: string
  /** Wejście do sekcji po kliknięciu zakładki. */
  href: string
  items: MagazynNavItem[]
}

/**
 * Dwie główne zakładki Magazynu. Menu boczne pokazuje tylko pozycje aktywnej sekcji;
 * sekcja wynika z adresu (/magazyn/studio… = Studio, reszta = strona).
 */
export const MAGAZYN_SECTIONS: MagazynSection[] = [
  {
    id: 'strona',
    label: 'Syntance strona',
    href: '/magazyn',
    items: [
      { href: '/magazyn', label: 'Przegląd', exact: true },
      { href: '/magazyn/rezerwacje', label: 'Rezerwacje' },
      { href: '/magazyn/blokady', label: 'Blokady' },
      { href: '/magazyn/regulamin', label: 'Reguły bookingu' },
      { href: '/magazyn/cms', label: 'CMS' },
      { href: '/magazyn/seo', label: 'SEO' },
      { href: '/magazyn/cennik', label: 'Cennik' },
      { href: '/magazyn/emaile', label: 'E-maile' },
      { href: '/magazyn/model-partnerski', label: 'Model partnerski' },
      { href: '/magazyn/ustawienia', label: 'Ustawienia' },
    ],
  },
  {
    id: 'studio',
    label: 'Syntance Studio',
    href: '/magazyn/studio',
    items: [
      { href: '/magazyn/studio', label: 'Pulpit', exact: true },
      { href: '/magazyn/studio/licencje', label: 'Licencje' },
      { href: '/magazyn/studio/klienci', label: 'Klienci' },
      { href: '/magazyn/studio/plany', label: 'Plany' },
      { href: '/magazyn/studio/funkcje', label: 'Funkcje i moduły' },
      { href: '/magazyn/studio/kody', label: 'Kody promocyjne' },
      { href: '/magazyn/studio/zamowienia', label: 'Zamówienia' },
      { href: '/magazyn/studio/ceny', label: 'Ceny (Paddle)' },
      { href: '/magazyn/studio/wydania', label: 'Wydania (pobieranie)' },
      { href: '/magazyn/studio/moduly', label: 'Moduły i katalog' },
      { href: '/magazyn/studio/audyt', label: 'Dziennik audytu' },
    ],
  },
]

export function sectionForPath(pathname: string): MagazynSection {
  const studio = MAGAZYN_SECTIONS[1]!
  const site = MAGAZYN_SECTIONS[0]!
  return pathname === studio.href || pathname.startsWith(`${studio.href}/`) ? studio : site
}

export function isNavActive(pathname: string, item: MagazynNavItem): boolean {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
}
