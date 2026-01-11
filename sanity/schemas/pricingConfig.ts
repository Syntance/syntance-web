import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'pricingConfig',
  title: 'Ustawienia cennika',
  type: 'document',
  fields: [
    defineField({
      name: 'vatRate',
      title: 'Stawka VAT (%)',
      type: 'number',
      initialValue: 23,
    }),
    defineField({
      name: 'depositPercent',
      title: 'Zaliczka (%)',
      type: 'number',
      initialValue: 20,
      description: 'Procent ceny jako zaliczka',
    }),
    defineField({
      name: 'depositFixed',
      title: 'Kaucja rezerwacyjna (PLN)',
      type: 'number',
      initialValue: 500,
    }),
    defineField({
      name: 'discoveryWorkshopPrice',
      title: 'Cena Warsztatu Discovery (PLN)',
      type: 'number',
      initialValue: 4500,
    }),
    defineField({
      name: 'hourlyRateDev',
      title: 'Stawka godzinowa dev (PLN)',
      type: 'number',
      initialValue: 200,
    }),
    defineField({
      name: 'hourlyRateConsulting',
      title: 'Stawka godzinowa consulting (PLN)',
      type: 'number',
      initialValue: 300,
    }),
    defineField({
      name: 'workHoursPerDay',
      title: 'Godziny pracy dziennie',
      type: 'number',
      initialValue: 6,
      description: 'Do kalkulacji dni realizacji',
    }),
    defineField({
      name: 'calendlyUrl',
      title: 'URL Calendly',
      type: 'url',
    }),
    defineField({
      name: 'ctaTexts',
      title: 'Teksty CTA',
      type: 'object',
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
