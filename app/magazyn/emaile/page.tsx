import Link from 'next/link'
import { Edit3, Mail } from 'lucide-react'
import { getEmailTemplates } from '@/lib/db/queries/settings'
import { hasDb } from '@/lib/db'
import { TEMPLATE_META } from '@/lib/magazyn/email-meta'
import { DbBanner } from '@/components/magazyn/ui'

export const dynamic = 'force-dynamic'

export default async function EmailePage() {
  const templates = await getEmailTemplates()
  const dbConnected = hasDb()

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-medium tracking-tight">E-maile</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Szablony wiadomości transakcyjnych ({TEMPLATE_META.length} typów).
        </p>
      </header>

      <DbBanner connected={dbConnected} />

      <ul className="flex flex-col gap-3">
        {TEMPLATE_META.map((m) => {
          const tmpl = templates[m.key] as unknown as Record<string, unknown> | undefined
          const subject = String(tmpl?.subjectTemplate ?? '—')

          return (
            <li key={m.key}>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="flex flex-1 items-center gap-4">
                    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-purple-500/10 text-purple-400">
                      <Mail className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-white">{m.nazwa}</p>
                        {m.hasInternalVersion && (
                          <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
                            Wersja wewnętrzna
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 font-mono text-xs text-neutral-500">{m.klucz}</p>
                      <p className="mt-1 truncate text-xs text-neutral-400">{m.opis}</p>
                      <p className="mt-0.5 truncate font-mono text-xs text-neutral-600" title={subject}>
                        Temat: {subject}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {m.previewParam && (
                      <a
                        href={`/api/admin/email-preview?template=${m.previewParam}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-sm text-neutral-300 transition-colors hover:bg-white/10"
                      >
                        Podgląd
                      </a>
                    )}
                    <Link
                      href={`/magazyn/emaile/${m.key}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                    >
                      <Edit3 className="size-3.5" aria-hidden />
                      Edytuj
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
