import { defineField, defineType } from 'sanity'

// Typy projektów: website, ecommerce, webapp
export default defineType({
  name: 'projectType',
  title: 'Typ projektu',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'ID',
      type: 'slug',
      validation: (Rule) => Rule.required(),
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
      title: 'Cena bazowa (PLN netto)',
      type: 'number',
      description: 'Minimalna cena projektu tego typu',
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
