import { defineField, defineType } from 'sanity'

// Typy produktów: dokumenty w CMS. Konfigurator na /cennik pokazuje tylko website | ecommerce | webapp (lib/configurator-project-types).
export default defineType({
  name: 'projectType',
  title: 'Pakiet gotowy — typ projektu',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'ID (slug)',
      type: 'slug',
      validation: (Rule) => Rule.required(),
      description:
        'Własny slug (np. website, landing-x). Na /cennik w konfiguratorze są zawsze tylko: website, ecommerce, webapp — inne typy użyj na landingach i podstronach.',
    }),
    defineField({
      name: 'name',
      title: 'Nazwa',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Opis',
      type: 'text',
    }),
    defineField({
      name: 'basePrice',
      title: 'Cena bazowa / „od X” (PLN netto)',
      type: 'number',
      description:
        'Kwota na karcie typu („od X PLN”) i podłoga kalkulacji gdy pakiet gotowy = 0. Ustalenie jednej kwoty pakietu zastępczej: dokument „Cennik — pakiety i zasady”, lista „Pakiety gotowe — cena i kategoria bazy”.',
    }),
    defineField({
      name: 'icon',
      title: 'Ikona',
      type: 'string',
    }),
    defineField({
      name: 'order',
      title: 'Kolejność',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'disabled',
      title: 'Wyłączony (niedostępny)',
      type: 'boolean',
      initialValue: false,
      description: 'Typ projektu będzie widoczny ale niemożliwy do wybrania',
    }),
  ],
  orderings: [
    {
      title: 'Kolejność',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Nazwa A-Z',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
    {
      title: 'Nazwa Z-A',
      name: 'nameDesc',
      by: [{ field: 'name', direction: 'desc' }],
    },
    {
      title: 'Cena bazowa rosnąco',
      name: 'basePriceAsc',
      by: [{ field: 'basePrice', direction: 'asc' }],
    },
    {
      title: 'Cena bazowa malejąco',
      name: 'basePriceDesc',
      by: [{ field: 'basePrice', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      basePrice: 'basePrice',
    },
    prepare({ title, basePrice }) {
      return {
        title: title,
        subtitle: basePrice ? `od ${basePrice.toLocaleString('pl-PL')} PLN` : 'Brak ceny',
      }
    },
  },
})
