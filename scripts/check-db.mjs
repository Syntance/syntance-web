import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

function readEnv(path, key) {
  const content = readFileSync(path, 'utf8')
  const match = content.match(new RegExp(`^${key}=(?:"([^"]*)"|([^\\n]*))`, 'm'))
  return match?.[1] ?? match?.[2] ?? null
}

const url = readEnv('.env.local', 'DATABASE_URL')
if (!url) {
  console.log('NO_URL')
  process.exit(1)
}

const sql = neon(url)
try {
  const seo = await sql`SELECT COUNT(*)::int AS c FROM seo_global`
  const faq = await sql`SELECT COUNT(*)::int AS c FROM faq_entries`
  const pages = await sql`SELECT COUNT(*)::int AS c FROM seo_pages`
  console.log(JSON.stringify({ seo: seo[0]?.c, faq: faq[0]?.c, pages: pages[0]?.c }))
} catch (e) {
  console.log('ERR', e instanceof Error ? e.message : String(e))
}
