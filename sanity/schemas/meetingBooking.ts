import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'meetingBooking',
  title: 'Rezerwacja (30 min)',
  type: 'document',
  groups: [
    { name: 'main', title: 'Rezerwacja', default: true },
    { name: 'technical', title: 'Techniczne' },
  ],
  fields: [
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'main',
      options: {
        list: [
          { title: 'Potwierdzona', value: 'confirmed' },
          { title: 'Anulowana', value: 'cancelled' },
          { title: 'Odbyta', value: 'done' },
          { title: 'Nie stawił się', value: 'no_show' },
        ],
      },
      initialValue: 'confirmed',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'startAt',
      title: 'Start spotkania',
      type: 'datetime',
      group: 'main',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endAt',
      title: 'Koniec spotkania',
      type: 'datetime',
      group: 'main',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Imię klienta',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email klienta',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'company',
      title: 'Firma',
      type: 'string',
      group: 'main',
    }),
    defineField({
      name: 'topic',
      title: 'Temat',
      type: 'text',
      group: 'main',
      rows: 3,
    }),
    defineField({
      name: 'source',
      title: 'Źródło ruchu',
      type: 'string',
      group: 'technical',
      description: 'UTM / kanał (np. bizcard)',
    }),
    defineField({
      name: 'meetLink',
      title: 'Google Meet URL',
      type: 'url',
      group: 'technical',
    }),
    defineField({
      name: 'googleEventId',
      title: 'Google Calendar event ID',
      type: 'string',
      group: 'technical',
      readOnly: true,
    }),
    defineField({
      name: 'googleCalendarId',
      title: 'Google Calendar ID',
      type: 'string',
      group: 'technical',
      readOnly: true,
    }),
    defineField({
      name: 'createdAt',
      title: 'Utworzono',
      type: 'datetime',
      group: 'technical',
      readOnly: true,
    }),
  ],
  preview: {
    select: { name: 'name', email: 'email', startAt: 'startAt', status: 'status' },
    prepare({ name, email, startAt, status }) {
      const when = startAt
        ? new Date(startAt).toLocaleString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '?'
      const badge = status === 'cancelled' ? '❌' : status === 'done' ? '✅' : status === 'no_show' ? '👻' : '📅'
      return {
        title: `${badge} ${when} — ${name ?? '(bez imienia)'}`,
        subtitle: email ?? '',
      }
    },
  },
  orderings: [
    {
      title: 'Najnowsze najpierw',
      name: 'startDesc',
      by: [{ field: 'startAt', direction: 'desc' }],
    },
    {
      title: 'Najbliższe najpierw',
      name: 'startAsc',
      by: [{ field: 'startAt', direction: 'asc' }],
    },
  ],
})
