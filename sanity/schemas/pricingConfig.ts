import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'pricingConfig',
  title: 'Ustawienia cennika',
  type: 'document',
  groups: [
    { name: 'general', title: 'Ogólne', default: true },
    { name: 'startingPrices', title: 'Ceny startowe' },
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
      name: 'calendlyUrl',
      title: 'URL Calendly',
      type: 'url',
      group: 'general',
    }),

    // === CENY STARTOWE ===
    defineField({
      name: 'discoveryWorkshopPrice',
      title: 'Cena Warsztatu Discovery (PLN)',
      type: 'number',
      group: 'startingPrices',
      initialValue: 4500,
      description: 'Cena pełnego warsztatu strategicznego',
    }),
    defineField({
      name: 'websiteStartPrice',
      title: 'Strona firmowa - cena startowa (PLN)',
      type: 'number',
      group: 'startingPrices',
      initialValue: 5400,
      description: 'Minimalna cena strony firmowej (landing page, wizytówka)',
    }),
    defineField({
      name: 'websiteAdvancedStartPrice',
      title: 'Strona rozbudowana - cena startowa (PLN)',
      type: 'number',
      group: 'startingPrices',
      initialValue: 12000,
      description: 'Cena rozbudowanej strony (katalog, portal, integracje)',
    }),
    defineField({
      name: 'ecommerceStandardStartPrice',
      title: 'Sklep Standard - cena startowa (PLN)',
      type: 'number',
      group: 'startingPrices',
      initialValue: 12000,
      description: 'Minimalna cena standardowego sklepu e-commerce',
    }),
    defineField({
      name: 'ecommerceProStartPrice',
      title: 'Sklep Pro - cena startowa (PLN)',
      type: 'number',
      group: 'startingPrices',
      initialValue: 25000,
      description: 'Cena rozbudowanego sklepu e-commerce (Pro)',
    }),
    defineField({
      name: 'webappStartPrice',
      title: 'Aplikacja webowa - cena startowa (PLN)',
      type: 'number',
      group: 'startingPrices',
      initialValue: 30000,
      description: 'Minimalna cena aplikacji webowej',
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
          title: 'Przycisk rezerwacji', 
          type: 'string', 
          initialValue: 'Zarezerwuj termin w tej cenie' 
        }),
        defineField({ 
          name: 'workshop', 
          title: 'Przycisk warsztatu', 
          type: 'string', 
          initialValue: 'Zamów Warsztat Discovery' 
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
        defineField({
          name: 'mediumDays',
          title: 'Dodatkowe dni (średnia)',
          type: 'number',
          initialValue: 2,
          description: 'Ile dni dodać dla średniej złożoności',
        }),
        defineField({
          name: 'highDays',
          title: 'Dodatkowe dni (wysoka)',
          type: 'number',
          initialValue: 4,
          description: 'Ile dni dodać dla wysokiej złożoności',
        }),
        defineField({
          name: 'veryHighDays',
          title: 'Dodatkowe dni (bardzo wysoka)',
          type: 'number',
          initialValue: 7,
          description: 'Ile dni dodać dla bardzo wysokiej złożoności',
        }),
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
        title: 'Ustawienia cennika',
        subtitle: 'Konfiguracja globalna',
      }
    },
  },
})
