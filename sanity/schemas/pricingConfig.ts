import { defineField, defineType } from 'sanity'

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

    // === GOTOWE PAKIETY (cena bazowa konfiguratora) ===
    defineField({
      name: 'baseProjectCategoryId',
      title: 'Slug kategorii „baza pakietu”',
      type: 'string',
      group: 'bundle',
      initialValue: 'base',
      description:
        'ID dokumentu kategorii (slug), która grupuje stały skład gotowego pakietu (np. setup, strona główna). Gdy poniżej wpiszesz kwoty większe od 0, skład tej kategorii nie sumuje się z cen katalogowych — liczy się jedna cena pakietu.',
    }),
    defineField({
      name: 'baseProjectBundlePriceWebsite',
      title: 'Pakiet gotowy: strona WWW (PLN netto)',
      type: 'number',
      group: 'bundle',
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
      description:
        'Cena gotowego pakietu strony w konfiguratorze. Gdy większe od 0: pozycje z kategorii „baza” dla WWW nie dodają cen z katalogu — tylko ta kwota plus dodatki z innych kategorii. Zero = sumuj każdą pozycję z CMS.',
    }),
    defineField({
      name: 'baseProjectBundlePriceEcommerce',
      title: 'Pakiet gotowy: sklep e-commerce (PLN netto)',
      type: 'number',
      group: 'bundle',
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
      description:
        'Jak wyżej — pakiet sklepu (baza katalogu, checkout itd.).',
    }),
    defineField({
      name: 'baseProjectBundlePriceWebapp',
      title: 'Pakiet gotowy: aplikacja webowa (PLN netto)',
      type: 'number',
      group: 'bundle',
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
      description: 'Jak wyżej — pakiet aplikacji webowej.',
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
