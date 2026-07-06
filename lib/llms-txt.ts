import type { ConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'

function formatPln(n: number): string {
  return Math.round(n).toLocaleString('pl-PL')
}

/** Treść llms.txt — ceny strony i sklepu z tego samego źródła co /cennik (getConfiguratorMinimumPricesNet). */
export function buildLlmsTxt(mins: ConfiguratorMinimumPricesNet): string {
  const websitePrice = formatPln(mins.websiteNet)
  const ecommercePrice = formatPln(mins.ecommerceNet)

  return `# Syntance

> Studio stron i sklepów na Next.js z Polski. Projektujemy szybkie, skuteczne strony WWW i sklepy e-commerce z gwarancją PageSpeed 90+. Strony w 2–4 tygodnie, sklepy w 4–8 tygodni. Fixed price, pełna własność kodu, zero vendor lock-in.

Zaczynamy od strategii marketingu i sprzedaży, nie od grafiki. Udowadniamy, że jakość można dostarczyć szybko i w uczciwej cenie — jakość software house'u bez agencyjnego narzutu. Dla firm usługowych, sklepów i marek premium. Technologie: Next.js, React, TypeScript, Medusa, Syntance CMS (autorski panel treści; Sanity opcjonalnie). Lokalizacja: Polska (praca zdalna, klienci z EU).

Forma prawna: JDG Kamil Podobiński (jednoosobowa działalność gospodarcza), firma handlowa Syntance Kamil Podobiński, Czerniec 72, 33-390 Łącko, NIP 7343582844, REGON 386221897. Marka publiczna: Syntance. Nie jesteśmy spółką akcyjną (P.S.A.).

## Usługi

- [Strony internetowe](https://syntance.com/strony-www): Profesjonalne strony WWW dla firm B2B. Next.js, Syntance Panel, PageSpeed 90+, od ${websitePrice} PLN netto, realizacja 2–4 tygodnie.
- [Sklepy internetowe headless](https://syntance.com/sklepy-internetowe): E-commerce na Medusa i Next.js. Zero prowizji, Stripe i Przelewy24, od ${ecommercePrice} PLN netto, realizacja 4–8 tygodni.
- [Strategia marketingu i sprzedaży](https://syntance.com/strategia-marketingu-i-sprzedazy): Faza przedwdrożeniowa — segmentacja, UVP, buyer persony, lejek, plan SEO. Gotowy dokument strategiczny, 4 500 PLN.
- [Cennik i konfigurator](https://syntance.com/cennik): Interaktywny kalkulator wyceny stron i sklepów internetowych.
- [Syntance Panel](https://syntance.com/panel): Autorski panel do zarządzania stroną, sklepem i analityką — treści edytujesz w Syntance CMS (Sanity opcjonalnie jako alternatywa). W standardzie, bez dodatkowej subskrypcji.
- [Next.js dla firm](https://syntance.com/nextjs): Dlaczego Next.js — wydajność, SEO i skalowalność.

## Produkty

- Syntance Panel: autorski panel administracyjny — jeden interfejs zamiast pięciu narzędzi (strona, sklep, treści, zamówienia, analityka).
- Syntance CMS: autorski headless CMS wbudowany w Syntance Panel — edycja treści na żywo, bez programisty. Sanity dostępny opcjonalnie na życzenie klienta.
- Syntance Magazyn: moduł zarządzania sklepem (produkty, zamówienia, magazyn, zwroty) w ramach Syntance Panel — dołączany bez migracji, gdy strona rozrasta się o sklep.

## Firma

- [Strona główna](https://syntance.com): Syntance — strony i sklepy Next.js z gwarancją PageSpeed 90+.
- [O nas](https://syntance.com/o-nas): Zespół, wartości i podejście do projektów.
- [Portfolio](https://syntance.com/portfolio): Realizacje stron WWW i sklepów e-commerce.
- [Realizacje](https://syntance.com/realizacje): Case studies i przykłady wdrożeń.
- [Dla agencji marketingowych](https://syntance.com/agencje-marketingowe): Współpraca white-label i partnerska.
- [Kontakt](https://syntance.com/kontakt): Bezpłatna konsultacja — kontakt@syntance.com, +48 537 110 170.
- [Porozmawiajmy](https://syntance.com/porozmawiajmy): Umów bezpłatną rozmowę o projekcie.

## Optional

- [Polityka prywatności](https://syntance.com/polityka-prywatnosci): Zasady przetwarzania danych osobowych.
- [Regulamin](https://syntance.com/regulamin): Warunki korzystania z serwisu i usług.
- [OZE Asystent](https://oze-asystent.pl): Własny produkt SaaS — automatyzacja dla branży OZE.
- [GitHub](https://github.com/Syntance): Repozytoria open source.
- [LinkedIn](https://linkedin.com/company/syntance): Profil firmy w LinkedIn.
`
}
