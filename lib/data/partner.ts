/**
 * Parametry handlowe modelu partnerskiego (/dla-agencji).
 *
 * Wartości edytowalne z panelu (`/magazyn/model-partnerski`) i zapisywane
 * w tabeli `partner_settings`. Teksty warunków i kroków procesu są z nich
 * WYLICZANE (`buildPricingConditions`, `buildProcessSteps`), żeby zmiana
 * stawki w panelu aktualizowała wszystkie miejsca na stronie naraz.
 */

export interface PartnerLevel {
  id: string
  name: string
  when: string
  /** Rabat od ceny detalicznej, w procentach (0–90). */
  discountPercent: number
}

export interface PartnerSettings {
  levels: PartnerLevel[]
  /** Dopłata za tryb white-label, w procentach ceny partnerskiej. */
  whiteLabelSurchargePercent: number
  /** Minimalna wartość projektu netto (PLN). */
  minProjectNet: number
  /** Stawka godzinowa netto (PLN/h) — cennik detaliczny. */
  hourlyRateRetail: number
  /** Stawka godzinowa netto (PLN/h) — partnerzy. */
  hourlyRatePartner: number
  /** Płatny audyt/specyfikacja netto (PLN), zaliczany na poczet 1. projektu. */
  auditPriceNet: number
  /** Liczba rund poprawek w cenie projektu. */
  revisionRoundsIncluded: number
}

export const defaultPartnerSettings: PartnerSettings = {
  levels: [
    { id: 'partner', name: 'Partner', when: 'pierwszy projekt', discountPercent: 15 },
    {
      id: 'partner-plus',
      name: 'Partner+',
      when: '2–3 projekty w 12 miesiącach',
      discountPercent: 25,
    },
    {
      id: 'partner-pro',
      name: 'Partner Pro',
      when: '4+ projekty lub stały wolumen',
      discountPercent: 35,
    },
  ],
  whiteLabelSurchargePercent: 10,
  minProjectNet: 4500,
  hourlyRateRetail: 200,
  hourlyRatePartner: 180,
  auditPriceNet: 1500,
  revisionRoundsIncluded: 2,
}

export function formatPln(value: number): string {
  return `${Math.round(value).toLocaleString('pl-PL')} PLN`
}

/** Warunki wyświetlane pod tabelą poziomów — wprost z parametrów, bez ręcznego przepisywania. */
export function buildPricingConditions(settings: PartnerSettings): string[] {
  return [
    `Tryb white-label: +${settings.whiteLabelSurchargePercent}% do ceny partnerskiej.`,
    `Minimum projektu: ${formatPln(settings.minProjectNet)} netto.`,
    `Godzinowo, przy nieokreślonym zakresie: ${settings.hourlyRateRetail} PLN/h detal, ${settings.hourlyRatePartner} PLN/h partner. Przy ustalonym zakresie wychodzi taniej i znasz kwotę z góry.`,
    `Poprawki: ${settings.revisionRoundsIncluded} rundy w cenie. Kolejne oraz praca poza zakresem — ${settings.hourlyRateRetail} PLN/h.`,
    'Płatność 50/50: zaliczka przy starcie, reszta przy odbiorze. Rozliczamy się z Tobą niezależnie od tego, kiedy zapłaci Twój klient.',
    'Poziom liczymy z ostatnich 12 miesięcy i podnosimy automatycznie po projekcie, który przekracza próg.',
  ]
}

export function buildProcessSteps(settings: PartnerSettings) {
  return [
    {
      meta: `krok 1 · ${formatPln(settings.auditPriceNet)} netto`,
      title: 'Audyt i specyfikacja',
      text: 'Przechodzimy zakres, ryzyka i integracje. Dostajesz dokument, na podstawie którego projekt można wycenić u dowolnego wykonawcy — także u kogoś innego. Kwota zaliczana na poczet pierwszego projektu.',
    },
    {
      meta: 'krok 2 · Twój czas: brief',
      title: 'Brief i wycena',
      text: 'Przekazujesz materiały i projekt graficzny. Wyceniamy z konfiguratora, odejmujemy Twój poziom partnerski i podajemy harmonogram z datą dostawy oraz karą umowną.',
    },
    {
      meta: 'krok 3 · jeden kanał',
      title: 'Realizacja',
      text: 'Slack albo Teams, jeden wątek. Podgląd na środowisku preview, status raz w tygodniu. Nie wymagamy codziennych spotkań.',
    },
    {
      meta: 'krok 4 · Twój czas: akceptacja',
      title: 'Dostawa i 30 dni wsparcia',
      text: 'Kod w Twoim repozytorium, deploy na Twoje albo klienta konto, 30 dni na poprawki po starcie.',
    },
  ]
}

/** Cena partnerska z uwzględnieniem poziomu, trybu i minimum projektu. */
export function computePartnerPrice(
  retailNet: number,
  discountPercent: number,
  whiteLabel: boolean,
  settings: PartnerSettings,
): { price: number; belowMinimum: boolean } {
  const afterDiscount = retailNet * (1 - discountPercent / 100)
  const withMode = whiteLabel
    ? afterDiscount * (1 + settings.whiteLabelSurchargePercent / 100)
    : afterDiscount
  const belowMinimum = withMode < settings.minProjectNet
  return { price: belowMinimum ? settings.minProjectNet : withMode, belowMinimum }
}
