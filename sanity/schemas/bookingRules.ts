import { defineField, defineType } from 'sanity'

const DAYS = [
  { title: 'Poniedziałek', value: 1 },
  { title: 'Wtorek', value: 2 },
  { title: 'Środa', value: 3 },
  { title: 'Czwartek', value: 4 },
  { title: 'Piątek', value: 5 },
  { title: 'Sobota', value: 6 },
  { title: 'Niedziela', value: 0 },
]

export default defineType({
  name: 'bookingRules',
  title: 'Reguły rezerwacji (/porozmawiajmy)',
  type: 'document',
  groups: [
    { name: 'slots', title: 'Sloty', default: true },
    { name: 'horizon', title: 'Horyzont czasu' },
    { name: 'advanced', title: 'Zaawansowane' },
  ],
  fields: [
    defineField({
      name: 'slotMinutes',
      title: 'Długość slota (minuty)',
      type: 'number',
      group: 'slots',
      initialValue: 30,
      validation: (Rule) => Rule.required().min(5).max(240),
    }),
    defineField({
      name: 'workingDays',
      title: 'Dni robocze (w których można rezerwować)',
      type: 'array',
      group: 'slots',
      of: [{ type: 'number' }],
      options: { list: DAYS, layout: 'grid' },
      initialValue: [1, 2, 3, 4, 5],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'workingHoursStart',
      title: 'Godzina startu pracy (HH:MM)',
      type: 'string',
      group: 'slots',
      initialValue: '10:00',
      validation: (Rule) =>
        Rule.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
          name: 'hh:mm',
          invert: false,
        }),
    }),
    defineField({
      name: 'workingHoursEnd',
      title: 'Godzina końca pracy (HH:MM)',
      type: 'string',
      group: 'slots',
      initialValue: '17:00',
      validation: (Rule) =>
        Rule.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
          name: 'hh:mm',
          invert: false,
        }),
    }),
    defineField({
      name: 'slotPresets',
      title: 'Godziny slotów (pusta lista = generuj automatycznie w widełkach)',
      type: 'array',
      group: 'slots',
      of: [
        {
          type: 'string',
          validation: (Rule) =>
            Rule.regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
              name: 'hh:mm',
              invert: false,
            }),
        },
      ],
      description:
        'Jeśli chcesz pokazywać tylko konkretne godziny (np. 10:00, 13:00, 16:00), wpisz je tutaj. W przeciwnym razie sloty będą generowane automatycznie co „Długość slota" od godziny startu do godziny końca.',
      initialValue: ['10:00', '13:00', '16:00'],
    }),
    defineField({
      name: 'bufferBeforeMinutes',
      title: 'Bufor przed spotkaniem (minuty)',
      type: 'number',
      group: 'advanced',
      initialValue: 0,
    }),
    defineField({
      name: 'bufferAfterMinutes',
      title: 'Bufor po spotkaniu (minuty)',
      type: 'number',
      group: 'advanced',
      initialValue: 15,
    }),
    defineField({
      name: 'minNoticeHours',
      title: 'Minimalne wyprzedzenie (godziny)',
      type: 'number',
      group: 'horizon',
      initialValue: 12,
      description: 'Ile godzin wcześniej przed spotkaniem klient może jeszcze rezerwować.',
    }),
    defineField({
      name: 'maxAdvanceDays',
      title: 'Maksymalne wyprzedzenie (dni)',
      type: 'number',
      group: 'horizon',
      initialValue: 60,
      description: 'Jak daleko w przód klient widzi wolne terminy.',
    }),
    defineField({
      name: 'timezone',
      title: 'Strefa czasowa',
      type: 'string',
      group: 'advanced',
      initialValue: 'Europe/Warsaw',
      readOnly: true,
    }),
  ],
  preview: {
    select: { slotMinutes: 'slotMinutes' },
    prepare({ slotMinutes }) {
      return {
        title: 'Reguły rezerwacji',
        subtitle: `Slot: ${slotMinutes ?? 30} min`,
      }
    },
  },
})
