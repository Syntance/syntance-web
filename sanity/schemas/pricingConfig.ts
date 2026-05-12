import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  name: 'pricingConfig',
  title: 'Cennik — pakiety i zasady',
  type: 'document',
  groups: [
    { name: 'general', title: 'Ogólne', default: true },
    { name: 'bundle', title: 'Gotowe pakiety — cena bazowa' },
    { name: 'startingPrices', title: 'Wartości pomocnicze (SEO, fallback)' },
    { name: 'rates', title: 'Stawki' },
    { name: 'complexity', title: 'Złożoność' },
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
        'Dla każdego typu z „Pakiet gotowy — typ” dodaj jeden wiersz: wybierz ten sam dokument typu, opcjonalnie slug kategorii bazy, cenę pakietu netto. Nowy typ projektu: najpierw utwórz go w menu Pakiety gotowe → Typ pakietu, potem dodaj wiersz tutaj.',
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
          ],
          preview: {
            select: {
              name: 'projectType.name',
              pid: 'projectType.id.current',
              price: 'bundlePriceNet',
              slug: 'baseCategorySlug',
            },
            prepare({ name, pid, price, slug }) {
              const slugLabel = slug?.trim() ? slug : 'zapas'
              return {
                title: name ?? pid ?? 'Typ projektu',
                subtitle: `${price ?? 0} PLN netto · baza: ${slugLabel}`,
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

    // === WARTOŚCI POMOCNICZE ===
    defineField({
      name: 'websiteStartPrice',
      title: 'Strona firmowa — cena do SEO / fallback (PLN)',
      type: 'number',
      group: 'startingPrices',
      initialValue: 5400,
      description:
        'Gdy konfigurator liczy po pozycjach (pakiet WWW = 0), może służyć jako tekst w meta. Główna wycena strony: zakładka Gotowe pakiety lub suma z konfiguratora.',
    }),
    defineField({
      name: 'websiteAdvancedStartPrice',
      title: 'Strona rozbudowana — SEO / fallback (PLN)',
      type: 'number',
      group: 'startingPrices',
      initialValue: 12000,
      description: 'Wartość pomocnicza (teksty, porównania). Wycena z konfiguratora / pakietów ma pierwszeństwo.',
    }),
    defineField({
      name: 'ecommerceStandardStartPrice',
      title: 'Sklep standard — SEO / fallback (PLN)',
      type: 'number',
      group: 'startingPrices',
      initialValue: 12000,
      description: 'Jak wyżej — pomocniczo dla meta i starych treści.',
    }),
    defineField({
      name: 'ecommerceProStartPrice',
      title: 'Sklep Pro — SEO / fallback (PLN)',
      type: 'number',
      group: 'startingPrices',
      initialValue: 25000,
      description: 'Jak wyżej.',
    }),
    defineField({
      name: 'webappStartPrice',
      title: 'Aplikacja webowa — SEO / fallback (PLN)',
      type: 'number',
      group: 'startingPrices',
      initialValue: 30000,
      description: 'Jak wyżej.',
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
    defineField({
      name: 'complexitySettings',
      title: 'Ustawienia złożoności',
      type: 'object',
      group: 'complexity',
      fields: [
        // === PROGI ZŁOŻONOŚCI ===
        defineField({
          name: 'mediumThreshold',
          title: 'Próg średniej złożoności',
          type: 'number',
          initialValue: 5,
          description: 'Suma wag złożoności od której projekt jest "średnio złożony"',
        }),
        defineField({
          name: 'highThreshold',
          title: 'Próg wysokiej złożoności',
          type: 'number',
          initialValue: 10,
          description: 'Suma wag złożoności od której projekt jest "wysoko złożony"',
        }),
        defineField({
          name: 'veryHighThreshold',
          title: 'Próg bardzo wysokiej złożoności',
          type: 'number',
          initialValue: 15,
          description: 'Suma wag złożoności od której projekt jest "bardzo wysoko złożony"',
        }),
        
        // === NISKA ZŁOŻONOŚĆ ===
        defineField({
          name: 'lowDays',
          title: '1. Niska złożoność - dodatkowe dni',
          type: 'number',
          initialValue: 0,
          description: 'Ile dni dodać dla niskiej złożoności',
        }),
        defineField({
          name: 'showLowDaysLabel',
          title: '1. Niska złożoność - pokaż napis o dodatkowych dniach',
          type: 'boolean',
          initialValue: false,
          description: 'Czy pokazywać napis "(+X dni za złożoność)" dla niskiej złożoności',
        }),
        
        // === ŚREDNIA ZŁOŻONOŚĆ ===
        defineField({
          name: 'mediumDays',
          title: '2. Średnia złożoność - dodatkowe dni',
          type: 'number',
          initialValue: 2,
          description: 'Ile dni dodać dla średniej złożoności',
        }),
        defineField({
          name: 'showMediumDaysLabel',
          title: '2. Średnia złożoność - pokaż napis o dodatkowych dniach',
          type: 'boolean',
          initialValue: true,
          description: 'Czy pokazywać napis "(+X dni za złożoność)" dla średniej złożoności',
        }),
        
        // === WYSOKA ZŁOŻONOŚĆ ===
        defineField({
          name: 'highDays',
          title: '3. Wysoka złożoność - dodatkowe dni',
          type: 'number',
          initialValue: 4,
          description: 'Ile dni dodać dla wysokiej złożoności',
        }),
        defineField({
          name: 'showHighDaysLabel',
          title: '3. Wysoka złożoność - pokaż napis o dodatkowych dniach',
          type: 'boolean',
          initialValue: true,
          description: 'Czy pokazywać napis "(+X dni za złożoność)" dla wysokiej złożoności',
        }),
        
        // === BARDZO WYSOKA ZŁOŻONOŚĆ ===
        defineField({
          name: 'veryHighDays',
          title: '4. Bardzo wysoka złożoność - dodatkowe dni',
          type: 'number',
          initialValue: 7,
          description: 'Ile dni dodać dla bardzo wysokiej złożoności',
        }),
        defineField({
          name: 'showVeryHighDaysLabel',
          title: '4. Bardzo wysoka złożoność - pokaż napis o dodatkowych dniach',
          type: 'boolean',
          initialValue: true,
          description: 'Czy pokazywać napis "(+X dni za złożoność)" dla bardzo wysokiej złożoności',
        }),
        
        // === CENA ===
        defineField({
          name: 'dayPrice',
          title: 'Cena za dzień złożoności (PLN)',
          type: 'number',
          initialValue: 1200,
          description: 'Cena dodawana za każdy dodatkowy dzień wynikający ze złożoności',
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
