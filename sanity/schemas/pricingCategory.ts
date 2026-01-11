import { defineField, defineType } from 'sanity'

// Kategorie: base, pages, sections, features, integrations, payments, shipping
export default defineType({
  name: 'pricingCategory',
  title: 'Kategoria cennika',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'ID (slug)',
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
      name: 'order',
      title: 'Kolejność',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'icon',
      title: 'Ikona (nazwa Lucide)',
      type: 'string',
      description: 'np. Layout, ShoppingCart, Settings',
    }),
    defineField({
      name: 'disabled',
      title: 'Wyłączona (niedostępna)',
      type: 'boolean',
      initialValue: false,
      description: 'Kategoria i wszystkie jej elementy będą niedostępne',
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
  ],
  preview: {
    select: {
      title: 'name',
      order: 'order',
    },
    prepare({ title, order }) {
      return {
        title: title,
        subtitle: `Kolejność: ${order}`,
      }
    },
  },
})
