import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { getEmailTemplates } from '@/lib/db/queries/settings'
import { TEMPLATE_META, type TemplateKey } from '@/lib/magazyn/email-meta'
import { EmailEditor } from '@/components/magazyn/email-editor'

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return TEMPLATE_META.map((m) => ({ key: m.key }))
}

type Props = {
  params: Promise<{ key: string }>
}

export default async function EdytujEmailPage({ params }: Props) {
  const { key } = await params
  const meta = TEMPLATE_META.find((m) => m.key === key)
  if (!meta) notFound()

  const templates = await getEmailTemplates()
  const template = templates[key as TemplateKey]
  if (!template) notFound()

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/magazyn/emaile"
        className="inline-flex w-fit items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-white"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Wróć do e-maili
      </Link>

      <header>
        <h1 className="text-2xl font-medium tracking-tight text-white">{meta.nazwa}</h1>
        <p className="mt-1 font-mono text-sm text-neutral-500">{meta.klucz}</p>
      </header>

      <EmailEditor
        templateKey={key as TemplateKey}
        template={template}
        meta={meta}
        allTemplates={templates}
      />
    </div>
  )
}
