export type PanelRealizationScreenshot = {
  /** Ścieżka w public/, np. /panel/realizacje/klient-dashboard.webp */
  src: string
  alt: string
  caption?: string
}

export type PanelRealization = {
  id: string
  clientName: string
  description?: string
  /** Link do strony klienta (opcjonalnie) */
  projectUrl?: string
  screenshots: PanelRealizationScreenshot[]
}

/**
 * Zrzuty panelu u klientów — dodaj wpis i wrzuć pliki do public/panel/realizacje/.
 *
 * @example
 * {
 *   id: 'retrohouse',
 *   clientName: 'RetroHouse',
 *   description: 'Zarządzanie produktami i zamówieniami w sklepie vintage.',
 *   projectUrl: 'https://sklep-retrohouse.pl',
 *   screenshots: [
 *     {
 *       src: '/panel/realizacje/retrohouse-dashboard.webp',
 *       alt: 'Panel RetroHouse — widok dashboardu',
 *       caption: 'Przegląd zamówień',
 *     },
 *   ],
 * }
 */
export const panelRealizations: PanelRealization[] = []
