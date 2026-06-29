/**
 * Na Vercel: migrate schematu + jednorazowy import z Sanity gdy baza pusta.
 */
import { execSync } from 'node:child_process'
import { neon } from '@neondatabase/serverless'

if (process.env.VERCEL !== '1' || !process.env.DATABASE_URL) {
  console.log('[db] Pomijam setup DB (nie Vercel lub brak DATABASE_URL)')
  process.exit(0)
}

console.log('[db] drizzle-kit migrate…')
execSync('npx drizzle-kit migrate', { stdio: 'inherit', env: process.env })

async function seedIfEmpty() {
  const sql = neon(process.env.DATABASE_URL)
  try {
    const rows = await sql`SELECT COUNT(*)::int AS count FROM seo_global`
    const count = rows[0]?.count ?? 0
    if (count > 0) {
      console.log('[db] Dane już w bazie — pomijam import z Sanity')
      return
    }
  } catch {
    console.log('[db] seo_global niedostępna — uruchamiam import mimo to')
  }

  console.log('[db] Import danych z Sanity…')
  execSync('npx tsx scripts/migrate-from-sanity.ts', {
    stdio: 'inherit',
    env: process.env,
    timeout: 300_000,
  })
}

seedIfEmpty().catch((err) => {
  console.error('[db] Import z Sanity nie powiódł się (build kontynuuje):', err.message)
  process.exit(0)
})
