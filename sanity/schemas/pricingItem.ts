import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'pricingItem',
  title: 'Element cennika',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'ID (unikalne)',
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
      name: 'price',
      title: 'Cena (PLN netto)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'hours',
      title: 'Czas realizacji (h)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'category',
      title: 'Kategoria',
      type: 'reference',
      to: [{ type: 'pricingCategory' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'projectTypes',
      title: 'Typy projektów',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'projectType' }] }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'required',
      title: 'Obowiązkowy element?',
      type: 'boolean',
      initialValue: false,
      description: 'Czy element jest zawsze zawarty w cenie bazowej',
    }),
    defineField({
      name: 'maxQuantity',
      title: 'Maksymalna ilość',
      type: 'number',
      description: 'Np. max 10 podstron. Zostaw puste dla 1.',
    }),
    defineField({
      name: 'percentageAdd',
      title: 'Procentowy dodatek (%)',
      type: 'number',
      description: 'Np. 20 dla i18n (+20% do całości). Jeśli ustawione, pole "Cena" jest ignorowane.',
    }),
    defineField({
      name: 'dependencies',
      title: 'Wymaga elementów (blokada)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'pricingItem' }] }],
      description: 'Elementy, które muszą być wybrane PRZED tym elementem (ten będzie zablokowany dopóki tamte nie są wybrane)',
    }),
    defineField({
      name: 'bundledWith',
      title: 'Automatycznie dodaje (pakiet)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'pricingItem' }] }],
      description: 'Elementy które AUTOMATYCZNIE dodadzą się gdy wybierzesz ten element. Usunięcie któregokolwiek z pakietu usunie też ten element.',
    }),
    defineField({
      name: 'order',
      title: 'Kolejność w kategorii',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'popular',
      title: 'Popularne',
      type: 'boolean',
      initialValue: false,
      description: 'Pokaż badge "Popularne"',
    }),
    defineField({
      name: 'new',
      title: 'Nowość',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      price: 'price',
      category: 'category.name',
    },
    prepare({ title, price, category }) {
      return {
        title,
        subtitle: `${price?.toLocaleString('pl-PL') || 0} PLN | ${category || 'Brak kategorii'}`,
      }
    },
  },
  orderings: [
    {
      title: 'Kategoria + Kolejność',
      name: 'categoryOrder',
      by: [
        { field: 'category.order', direction: 'asc' },
        { field: 'order', direction: 'asc' },
      ],
    },
  ],
})
