import { readFileSync, writeFileSync } from 'node:fs'

const SOURCE = '.env.syntance-dev.local'
const TARGET = '.env.local'

function readEnv(path, key) {
  const content = readFileSync(path, 'utf8')
  const match = content.match(new RegExp(`^${key}="([^"]*)"`, 'm'))
  return match?.[1] ?? null
}

function upsertEnv(path, entries) {
  let content = readFileSync(path, 'utf8')
  for (const [key, value] of Object.entries(entries)) {
    const line = `${key}=${JSON.stringify(value)}`
    const re = new RegExp(`^${key}=.*$`, 'm')
    content = re.test(content) ? content.replace(re, line) : `${content.trim()}\n${line}\n`
  }
  writeFileSync(path, `${content.trim()}\n`)
}

const databaseUrl = readEnv(SOURCE, 'Database_DATABASE_URL')
const databaseUrlUnpooled = readEnv(SOURCE, 'Database_DATABASE_URL_UNPOOLED')

if (!databaseUrl) {
  console.error('Brak Database_DATABASE_URL w', SOURCE)
  process.exit(1)
}

upsertEnv(TARGET, {
  DATABASE_URL: databaseUrl,
  ...(databaseUrlUnpooled ? { DATABASE_URL_UNPOOLED: databaseUrlUnpooled } : {}),
})

console.log('OK: DATABASE_URL zapisany w .env.local')
