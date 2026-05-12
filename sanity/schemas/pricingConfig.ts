import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  name: 'pricingConfig',
  title: 'Cennik — pakiety i zasady',
  type: 'document',
  groups: [
    { name: 'general', title: 'Ogólne', default: true },
    { name: 'bundle', title: 'Gotowe pakiety — cena bazowa' },
    { name: 'startingPrices', title: 'Zapasowe ceny (tylko gdy konfigurator i typ dają 0)' },
    { name: 'rates', title: 'Stawki' },
  ],
  fields: [
    // === OGÓLNE ===
    defineField({
      name: 'vatRate',
      title: 'Stawka VAT (%)',
      type: 'number',
      group: 'general',
      initialValue: 23,
    }),
    defineField({
      name: 'depositPercent',
      title: 'Zaliczka (%)',
      type: 'number',
      group: 'general',
      initialValue: 20,
      description: 'Procent ceny jako zaliczka',
    }),
    defineField({
      name: 'depositFixed',
      title: 'Kaucja rezerwacyjna (PLN)',
      type: 'number',
      group: 'general',
      initialValue: 500,
    }),
    defineField({
      name: 'discoveryWorkshopPrice',
      title: 'Strategia marketingu i sprzedaży — cena netto (PLN)',
      type: 'number',
      group: 'general',
      initialValue: 4500,
      validation: (Rule) => Rule.min(0),
      description:
        'Ta sama wartość co „cennik”: używana na stronie strategii, w FAQ (token {{DISCOVERY_NET}}), JSON-LD i wszędzie indziej — jedno pole, bez osobnego „ustawienia wyświetlania”.',
    }),
    defineField({
      name: 'calendlyUrl',
      title: 'URL Calendly',
      type: 'url',
      group: 'general',
    }),

    // === GOTOWE PAKIETY (cena bazowa konfiguratora, per typ dokumentu projectType) ===
    defineField({
      name: 'projectTypeBundles',
      title: 'Pakiety gotowe — cena i kategoria bazy per typ projektu',
      type: 'array',
      group: 'bundle',
      description:
        'Dla każdego typu z „Pakiet gotowy — typ” dodaj jeden wiersz: wybierz ten sam dokument typu, opcjonalnie slug kategorii bazy, cenę pakietu netto. Nowy typ projektu: najpierw utwórz go w menu Pakiety gotowe → Typ pakietu, potem dodaj wiersz tutaj. **Te wartości ustawiają też „cenę od której…” w tekstach witryny** (FAQ, meta) przez tokeny {{WEBSITE_NET}}, {{ECOMMERCE_NET}} itd. — ta sama kolejka co konfigurator (pakiet bazowy → min. zestaw pozycji → fallback).',
      validation: (Rule) =>
        Rule.custom((rows: { projectType?: { _ref?: string } }[] | undefined) => {
          if (!rows?.length) return true
          const refs = rows.map((r) => r?.projectType?._ref).filter(Boolean)
          if (refs.length !== new Set(refs).size) {
            return 'Każdy typ projektu może wystąpić tylko raz (usuń duplikat referencji).'
          }
          return true
        }),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'projectTypeBundleRow',
          fields: [
            defineField({
              name: 'projectType',
              title: 'Typ projektu',
              type: 'reference',
              to: [{ type: 'projectType' }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'baseCategorySlug',
              title: 'Slug kategorii bazy (rdzeń pakietu)',
              type: 'string',
              description:
                'Jak ID (slug) dokumentu „Kategoria w pakietach” używanego przez pozycje rdzenia tego typu. Puste: pole „Zapasowy slug kategorii bazy” niżej.',
            }),
            defineField({
              name: 'bundlePriceNet',
              title: 'Cena pakietu gotowego (PLN netto)',
              type: 'number',
              initialValue: 0,
              validation: (Rule) => Rule.min(0),
              description:
                'Jedna kwota pakietu zamiast sumy pozycji bazy w konfiguratorze. Zero = licz po pozycjach z CMS.',
            }),
            defineField({
              name: 'bundleBaseHours',
              title: 'Czas realizacji bazy (roboczogodziny, cały pakiet)',
              type: 'number',
              initialValue: 0,
              validation: (Rule) => Rule.min(0),
              description:
                'Gdy > 0: do szacunku terminu **nie** sumujemy godzin pojedynczych pozycji objętych pakietem / ceną bazową — liczy się tylko ta wartość + godziny dodatków. Zero = jak dotąd: suma godzin z pozycji „w bazie”.',
            }),
          ],
          preview: {
            select: {
              name: 'projectType.name',
              pid: 'projectType.id.current',
              price: 'bundlePriceNet',
              hours: 'bundleBaseHours',
              slug: 'baseCategorySlug',
            },
            prepare({ name, pid, price, hours, slug }) {
              const slugLabel = slug?.trim() ? slug : 'zapas'
              const h = typeof hours === 'number' && hours > 0 ? ` · ${hours} h baza` : ''
              return {
                title: name ?? pid ?? 'Typ projektu',
                subtitle: `${price ?? 0} PLN netto${h} · ${slugLabel}`,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'baseProjectCategoryId',
      title: 'Zapasowy slug kategorii bazy',
      type: 'string',
      group: 'bundle',
      initialValue: 'base',
      description:
        'Gdy w wierszu powyżej nie wpiszesz „Slug kategorii bazy”, używana jest ta wartość (np. „base”).',
    }),

    // === ZAPASOWE CENY (gdy **cena pakietu gotowego** = 0 lub brak wiersza: konfigurator → basePrice typu → poniżej → defaulty w kodzie) ===
    defineField({
      name: 'websiteStartPrice',
      title: 'Fallback: strona WWW (PLN netto)',
      type: 'number',
      group: 'startingPrices',
      initialValue: 5400,
      description:
        'Główna „cena od której zaczyna się projekt” na całej stronie: ustaw tutaj **Cena pakietu gotowego** w wierszu typu (powyżej). To pole tylko gdy pakiet = 0 i reszta łańcucha daje 0.',
    }),
    defineField({
      name: 'websiteAdvancedStartPrice',
      title: 'Strona rozbudowana (PLN) — zarezerwowane',
      type: 'number',
      group: 'startingPrices',
      initialValue: 12000,
      description:
        'Nie jest podpinane w kodzie. Możesz trzymać wartość na przyszłe teksty albo usunąć w następnej migracji schematu.',
    }),
    defineField({
      name: 'ecommerceStandardStartPrice',
      title: 'Fallback: sklep e-commerce (PLN netto)',
      type: 'number',
      group: 'startingPrices',
      initialValue: 12000,
      description: 'Jak „Fallback WWW” — dla typu sklep, gdy konfigurator i basePrice typu dają 0.',
    }),
    defineField({
      name: 'ecommerceProStartPrice',
      title: 'Sklep Pro (PLN) — zarezerwowane',
      type: 'number',
      group: 'startingPrices',
      initialValue: 25000,
      description: 'Nie jest używane na stronie — podobnie jak strona rozbudowana.',
    }),
    defineField({
      name: 'webappStartPrice',
      title: 'Fallback: aplikacja webowa (PLN netto)',
      type: 'number',
      group: 'startingPrices',
      initialValue: 30000,
      description: 'Jak „Fallback WWW” — dla typu aplikacja webowa.',
    }),

    // === STAWKI ===
    defineField({
      name: 'hourlyRateDev',
      title: 'Stawka godzinowa dev (PLN)',
      type: 'number',
      group: 'rates',
      initialValue: 200,
    }),
    defineField({
      name: 'hourlyRateConsulting',
      title: 'Stawka godzinowa consulting (PLN)',
      type: 'number',
      group: 'rates',
      initialValue: 300,
    }),
    defineField({
      name: 'workHoursPerDay',
      title: 'Godziny pracy dziennie',
      type: 'number',
      group: 'rates',
      initialValue: 6,
      description: 'Do kalkulacji dni realizacji',
    }),
    defineField({
      name: 'ctaTexts',
      title: 'Teksty CTA',
      type: 'object',
      group: 'general',
      fields: [
        defineField({ 
          name: 'reserve', 
          title: 'Przycisk zapytania o wycenę', 
          description: 'Główny CTA przy podsumowaniu konfiguratora (np. „Wyślij formularz").',
          type: 'string', 
          initialValue: 'Wyślij formularz'
        }),
        defineField({ 
          name: 'workshop', 
          title: 'Przycisk warsztatu', 
          type: 'string', 
          initialValue: 'Zamów Strategię marketingu i sprzedaży' 
        }),
        defineField({ 
          name: 'pdf', 
          title: 'Przycisk PDF', 
          type: 'string', 
          initialValue: 'Pobierz wycenę PDF' 
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Cennik — pakiety i zasady',
        subtitle: 'Gotowe pakiety WWW / sklep + strategia + VAT',
      }
    },
  },
})
