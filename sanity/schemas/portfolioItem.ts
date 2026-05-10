import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'portfolioItem',
  title: 'Realizacja (portfolio)',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nazwa strony / klienta',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Link do realizacji',
      type: 'url',
      validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] }),
      description: 'Adres strony klienta (otwiera się w nowej karcie)',
    }),
    defineField({
      name: 'logo',
      title: 'Logo strony',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Opis logo dla SEO i czytników ekranu',
        }),
      ],
    }),
    defineField({
      name: 'order',
      title: 'Kolejność',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'disabled',
      title: 'Ukryj na stronie',
      type: 'boolean',
      initialValue: false,
      description: 'Jeśli zaznaczone, kafelek nie będzie widoczny na froncie',
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
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'url',
      media: 'logo',
    },
  },
})
