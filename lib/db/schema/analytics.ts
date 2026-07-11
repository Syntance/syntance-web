import { date, integer, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'

/**
 * Zliczenia wejść na strony, niezależne od zgody na cookies analityczne.
 * Wyłącznie agregat (ścieżka + dzień + licznik) — bez IP, UA czy identyfikatora
 * użytkownika, więc nie wymaga zgody z banera cookies (nie jest to „dostęp do
 * urządzenia" w rozumieniu ePrivacy/art. 173 ustawy Pzt).
 */
export const pageHits = pgTable(
  'page_hits',
  {
    path: text('path').notNull(),
    day: date('day').notNull(),
    count: integer('count').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.path, table.day] })],
)
