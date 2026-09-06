/**
 * Wykrywa publiczne trasy z systemu plików i zapisuje je do lib/data/routes.generated.ts.
 *
 * Dzięki temu panel SEO nie potrzebuje ręcznej listy podstron: dodanie nowego
 * `page.tsx` albo zmiana nazwy folderu automatycznie pojawia się w Magazyn → SEO.
 *
 * Uruchamiane w `prebuild`, więc każdy build ma aktualną listę.
 */
import { readdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const APP_DIR = 'app'
const OUT_FILE = 'lib/data/routes.generated.ts'
const PAGE_FILES = new Set(['page.tsx', 'page.ts', 'page.jsx', 'page.js'])

/** Sekcje nie będące publicznymi podstronami marketingowymi. */
const EXCLUDED_PREFIXES = ['/magazyn', '/api']

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      // _prywatne foldery i @sloty równoległe nie tworzą tras
      if (entry.name.startsWith('_') || entry.name.startsWith('@')) continue
      walk(full, acc)
    } else if (PAGE_FILES.has(entry.name)) {
      acc.push(full)
    }
  }
  return acc
}

function fileToRoute(file) {
  const segments = relative(APP_DIR, file)
    .split(sep)
    .slice(0, -1)
    // grupy tras (marketing) nie wchodzą do URL-a
    .filter((seg) => !(seg.startsWith('(') && seg.endsWith(')')))
  return '/' + segments.join('/')
}

/** Źródła stałych przekierowań — te adresy nigdy się nie wyrenderują. */
function readRedirectSources() {
  try {
    const raw = readFileSync('next.config.mjs', 'utf-8')
    const sources = new Set()
    for (const m of raw.matchAll(/source:\s*['"`]([^'"`]+)['"`][^}]*?permanent:\s*true/gs)) {
      sources.add(m[1])
    }
    return sources
  } catch {
    return new Set()
  }
}

const redirectSources = readRedirectSources()

const routes = [...new Set(walk(APP_DIR).map(fileToRoute))]
  .filter((r) => !r.includes('[')) // trasy dynamiczne mają własne metadane per rekord
  .filter((r) => !EXCLUDED_PREFIXES.some((p) => r === p || r.startsWith(p + '/')))
  .filter((r) => !redirectSources.has(r))
  .sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b, 'pl')))

const skipped = [...redirectSources].filter((r) => r.startsWith('/'))

const body = `/**
 * PLIK GENEROWANY — nie edytuj ręcznie.
 * Zrodlo: skan plikow page.tsx w katalogu app/ przez scripts/generate-routes.mjs (prebuild).
 *
 * Pominięte: trasy dynamiczne ([slug]), /magazyn, /api oraz źródła stałych przekierowań
 * (${skipped.length ? skipped.join(', ') : 'brak'}).
 */
export const DISCOVERED_ROUTES: readonly string[] = [
${routes.map((r) => `  '${r}',`).join('\n')}
]
`

writeFileSync(OUT_FILE, body, 'utf-8')
console.log(`[routes] wykryto ${routes.length} publicznych tras -> ${OUT_FILE}`)
for (const r of routes) console.log(`  ${r}`)
if (skipped.length) console.log(`[routes] pominięte przekierowania: ${skipped.join(', ')}`)
