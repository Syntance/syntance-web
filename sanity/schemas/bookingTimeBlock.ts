import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'bookingTimeBlock',
  title: 'Blokada czasu',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Powód / notatka',
      type: 'string',
      validation: (Rule) => Rule.required().max(120),
      description: 'Np. „Urlop", „Deep work", „Święta"',
    }),
    defineField({
      name: 'allDay',
      title: 'Cały dzień',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'startAt',
      title: 'Od (data + godzina)',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endAt',
      title: 'Do (data + godzina, ekskluzywnie)',
      type: 'datetime',
      validation: (Rule) =>
        Rule.required().custom((endAt, ctx) => {
          const start = (ctx.document as { startAt?: string } | undefined)?.startAt
          if (!start || !endAt) return true
          return new Date(endAt as string) > new Date(start)
            ? true
            : 'Data końca musi być po dacie startu'
        }),
    }),
    defineField({
      name: 'createdBy',
      title: 'Utworzył',
      type: 'string',
      readOnly: true,
    }),
  ],
  preview: {
    select: { title: 'title', startAt: 'startAt', endAt: 'endAt', allDay: 'allDay' },
    prepare({ title, startAt, endAt, allDay }) {
      const s = startAt ? new Date(startAt).toLocaleString('pl-PL') : '?'
      const e = endAt ? new Date(endAt).toLocaleString('pl-PL') : '?'
      return {
        title: title ?? 'Blokada',
        subtitle: allDay ? `${s.split(',')[0]} → ${e.split(',')[0]} (cały dzień)` : `${s} → ${e}`,
      }
    },
  },
  orderings: [
    {
      title: 'Najbliższe najpierw',
      name: 'startAsc',
      by: [{ field: 'startAt', direction: 'asc' }],
    },
  ],
})
