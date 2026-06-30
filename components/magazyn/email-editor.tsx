'use client'

import { useCallback, useState } from 'react'
import {
  Copy,
  GripVertical,
  Heading,
  Monitor,
  PanelBottom,
  Redo2,
  RotateCcw,
  Save,
  Send,
  Smartphone,
  Trash2,
  Type,
  Undo2,
} from 'lucide-react'
import type { EmailTemplates } from '@/lib/data/email-templates'
import type { EmailBlock, TemplateMeta } from '@/lib/magazyn/email-meta'
import {
  buildBlocks,
  buildPreviewUrl,
  isColorField,
  MERGE_VARIABLES,
} from '@/lib/magazyn/email-meta'

const seg = 'inline-flex rounded-lg border border-white/10 p-0.5'
const segItem =
  'rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30'
const segActive = 'bg-white text-black'
const segIdle = 'text-neutral-400 hover:bg-white/10'

const BLOCK_ICONS: Record<EmailBlock['type'], React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>> = {
  emoji: Heading,
  heading: Heading,
  text: Type,
  footer: PanelBottom,
  subject: Type,
}

const FIELD_LABELS: Record<string, string> = {
  headerEmoji: 'Emoji w nagłówku',
  heading: 'Nagłówek',
  greetingTemplate: 'Powitanie',
  intro: 'Wstęp',
  body: 'Treść',
  body2: 'Treść (ciąg dalszy)',
  bodyTemplate: 'Treść szablonu',
  footerNote: 'Stopka',
  footerLine: 'Linia stopki',
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- base class shared across editor inputs
const INPUT_BASE =
  'w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-neutral-600 outline-none focus-visible:border-purple-500/60 focus-visible:ring-2 focus-visible:ring-purple-500/30'

type Props = {
  templateKey: keyof EmailTemplates
  template: EmailTemplates[keyof EmailTemplates]
  meta: TemplateMeta
  allTemplates: EmailTemplates
}

export function EmailEditor({ templateKey, template, meta, allTemplates }: Props) {
  const [data, setData] = useState(template as unknown as Record<string, unknown>)
  const [blocks, setBlocks] = useState(() => buildBlocks(data))
  const [subject, setSubject] = useState(String(data.subjectTemplate ?? ''))
  const [testEmail, setTestEmail] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(blocks[0]?.id ?? null)
  const [leftTab, setLeftTab] = useState<'block' | 'theme'>('block')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [status, setStatus] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [history, setHistory] = useState<Array<Record<string, unknown>>>([data])
  const [historyIndex, setHistoryIndex] = useState(0)

  const selected = blocks.find((b) => b.id === selectedId) ?? null

  const previewUrl = meta.previewParam ? buildPreviewUrl(meta.previewParam) : null

  function patch(fieldKey: string, value: string) {
    setData((prev) => {
      const next = { ...prev, [fieldKey]: value }
      setBlocks(buildBlocks(next))
      setHistory((h) => [...h.slice(0, historyIndex + 1), next])
      setHistoryIndex((i) => i + 1)
      return next
    })
  }

  function undo() {
    if (historyIndex <= 0) return
    const prev = history[historyIndex - 1]
    setData(prev)
    setBlocks(buildBlocks(prev))
    setHistoryIndex((i) => i - 1)
  }

  function redo() {
    if (historyIndex >= history.length - 1) return
    const next = history[historyIndex + 1]
    setData(next)
    setBlocks(buildBlocks(next))
    setHistoryIndex((i) => i + 1)
  }

  function reset() {
    const def = allTemplates[templateKey] as unknown as Record<string, unknown>
    setData(def)
    setBlocks(buildBlocks(def))
    setSubject(String(def.subjectTemplate ?? ''))
  }

  const save = useCallback(async () => {
    setPending(true)
    setStatus(null)
    try {
      const payload = { ...data, subjectTemplate: subject }
      const res = await fetch(`/api/magazyn/emaile/${templateKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Zapis nie powiódł się')
      setStatus('Zapisano.')
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Błąd zapisu')
    } finally {
      setPending(false)
    }
  }, [data, subject, templateKey])

  const colorFields = Object.keys(data).filter((k) => isColorField(k))

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email-subject" className="text-sm font-medium text-neutral-200">
            Temat wiadomości
          </label>
          <input
            id="email-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-10 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus-visible:border-purple-500/60 focus-visible:ring-2 focus-visible:ring-purple-500/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-neutral-500">Wstaw zmienną:</span>
          {MERGE_VARIABLES.map((v) => (
            <button
              key={v.token}
              type="button"
              title={v.label}
              onClick={() => setSubject((s) => `${s}{${v.token}}`)}
              className="rounded-lg border border-white/10 px-2 py-0.5 font-mono text-xs text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              {`{${v.token}}`}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex w-full min-w-0 items-center gap-2 sm:max-w-md sm:flex-1">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="adres@do-testu.pl"
              className="h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus-visible:border-purple-500/60"
            />
            <button
              type="button"
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-sm text-neutral-300 transition-colors hover:bg-white/10"
            >
              <Send className="size-4" aria-hidden />
              Wyślij test
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={undo}
              disabled={historyIndex <= 0}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm text-neutral-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
            >
              <Undo2 className="size-4" aria-hidden />
              Cofnij
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm text-neutral-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
            >
              <Redo2 className="size-4" aria-hidden />
              Ponów
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="size-4" aria-hidden />
              Przywróć domyślny
            </button>
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
            >
              <Save className="size-4" aria-hidden />
              {pending ? 'Zapisuję…' : 'Zapisz'}
            </button>
          </div>
        </div>

        {status && (
          <p role="status" className="text-sm text-green-400">
            {status}
          </p>
        )}
      </div>

      {/* Edytor + podgląd */}
      <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(280px,320px)_minmax(0,1fr)] xl:grid-rows-[auto_minmax(0,1fr)] xl:items-start">
        {/* Lista bloków */}
        <div className="order-1 min-w-0 rounded-xl border border-white/10 bg-white/[0.03] p-3 xl:col-start-1 xl:row-start-2">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Bloki ({blocks.length})
            </h3>
          </div>
          {blocks.length === 0 ? (
            <p className="py-4 text-center text-xs text-neutral-600">Brak bloków dla tego szablonu.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {blocks.map((block) => (
                <BlockRow
                  key={block.id}
                  block={block}
                  selected={selectedId === block.id}
                  onSelect={() => {
                    setSelectedId(block.id)
                    setLeftTab('block')
                  }}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Inspektor bloku / motyw */}
        <div className="order-3 flex min-w-0 flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 xl:col-start-1 xl:row-start-1">
          <div className={seg + ' w-full'}>
            <button
              type="button"
              aria-pressed={leftTab === 'block'}
              onClick={() => setLeftTab('block')}
              className={`${segItem} flex-1 px-3 py-1.5 text-sm font-medium ${leftTab === 'block' ? segActive : segIdle}`}
            >
              Blok
            </button>
            <button
              type="button"
              aria-pressed={leftTab === 'theme'}
              onClick={() => setLeftTab('theme')}
              className={`${segItem} flex-1 px-3 py-1.5 text-sm font-medium ${leftTab === 'theme' ? segActive : segIdle}`}
            >
              Motyw
            </button>
          </div>

          {leftTab === 'theme' ? (
            <ThemePanel data={data} colorFields={colorFields} onChange={patch} />
          ) : selected ? (
            <BlockInspector
              block={selected}
              value={String(data[selected.fieldKey] ?? '')}
              onChange={(v) => patch(selected.fieldKey, v)}
            />
          ) : (
            <p className="text-sm text-neutral-500">
              Zaznacz blok na liście poniżej, aby edytować treść i styl.
            </p>
          )}
        </div>

        {/* Podgląd */}
        <div className="order-2 flex min-w-0 flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 xl:col-span-1 xl:col-start-2 xl:row-span-2 xl:row-start-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Podgląd (przykładowe dane)
            </h3>
            <div className={seg}>
              <button
                type="button"
                aria-label="Podgląd desktop"
                aria-pressed={previewMode === 'desktop'}
                onClick={() => setPreviewMode('desktop')}
                className={`${segItem} inline-flex size-7 items-center justify-center ${previewMode === 'desktop' ? segActive : segIdle}`}
              >
                <Monitor className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Podgląd mobilny"
                aria-pressed={previewMode === 'mobile'}
                onClick={() => setPreviewMode('mobile')}
                className={`${segItem} inline-flex size-7 items-center justify-center ${previewMode === 'mobile' ? segActive : segIdle}`}
              >
                <Smartphone className="size-4" aria-hidden />
              </button>
            </div>
          </div>
          <div className="w-full min-w-0 overflow-x-auto">
            {previewUrl ? (
              <iframe
                key={previewUrl}
                title="Podgląd maila"
                src={previewUrl}
                sandbox="allow-same-origin"
                className={`h-[min(480px,52vh)] w-full rounded-lg border border-white/10 bg-white xl:h-[min(720px,70vh)] ${
                  previewMode === 'mobile' ? 'mx-auto max-w-[390px]' : 'max-w-full'
                }`}
              />
            ) : (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-neutral-500">
                Podgląd niedostępny dla tego szablonu.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function BlockRow({
  block,
  selected,
  onSelect,
}: {
  block: EmailBlock
  selected: boolean
  onSelect: () => void
}) {
  const Icon = BLOCK_ICONS[block.type]

  return (
    <li
      className={`flex items-center gap-2 rounded-lg border px-2 py-2 transition-colors ${
        selected
          ? 'border-purple-500/60 bg-purple-500/10 ring-1 ring-purple-500/30'
          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
      }`}
    >
      <button
        type="button"
        aria-label="Przeciągnij, aby zmienić kolejność"
        className="cursor-grab text-neutral-600 hover:text-neutral-400"
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-2 text-left">
        <Icon className="size-4 shrink-0 text-neutral-500" aria-hidden />
        <span className="min-w-0">
          <span className="block text-xs font-medium text-white">{FIELD_LABELS[block.fieldKey] ?? block.label}</span>
          <span className="block truncate text-xs text-neutral-500">{block.snippet || '(puste)'}</span>
        </span>
      </button>
      <button
        type="button"
        aria-label="Duplikuj blok"
        className="inline-flex size-7 items-center justify-center rounded-lg text-neutral-600 hover:bg-white/10 hover:text-neutral-300"
      >
        <Copy className="size-3.5" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Wyczyść blok"
        className="inline-flex size-7 items-center justify-center rounded-lg text-neutral-600 hover:bg-red-500/10 hover:text-red-400"
      >
        <Trash2 className="size-3.5" aria-hidden />
      </button>
    </li>
  )
}

function BlockInspector({
  block,
  value,
  onChange,
}: {
  block: EmailBlock
  value: string
  onChange: (v: string) => void
}) {
  const label = FIELD_LABELS[block.fieldKey] ?? block.label
  const isSingleLine = block.type === 'emoji'
  const isTextWithVars =
    block.fieldKey === 'greetingTemplate' ||
    block.fieldKey === 'subjectTemplate' ||
    block.fieldKey === 'bodyTemplate'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-200">{label}</label>
        {isSingleLine ? (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-full max-w-[100px] rounded-lg border border-white/10 bg-black/40 px-3 text-base text-white outline-none focus-visible:border-purple-500/60"
          />
        ) : (
          <textarea
            rows={6}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full resize-y rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus-visible:border-purple-500/60 focus-visible:ring-2 focus-visible:ring-purple-500/30"
          />
        )}
        {isTextWithVars && (
          <p className="text-xs text-neutral-500">Zmienne: {'{name}'}, {'{bookingId}'}, {'{amount}'} itd.</p>
        )}
      </div>
    </div>
  )
}

function ThemePanel({
  data,
  colorFields,
  onChange,
}: {
  data: Record<string, unknown>
  colorFields: string[]
  onChange: (key: string, value: string) => void
}) {
  const THEME_LABELS: Record<string, string> = {
    mailBackgroundColor: 'Tło karty e-mail',
    sectionPanelBackgroundColor: 'Tło panelu sekcji',
    headingColor: 'Kolor nagłówka',
    greetingColor: 'Kolor powitania',
    introColor: 'Kolor wstępu',
    bodyColor: 'Kolor treści',
    body2Color: 'Kolor treści 2',
    footerNoteColor: 'Kolor stopki',
    referenceLineMutedColor: 'Kolor etykiety ref.',
    referenceLineAccentColor: 'Kolor akcentu ref.',
    tableLabelColor: 'Etykiety tabeli',
    tableValueColor: 'Wartości tabeli',
    tableAccentColor: 'Akcent tabeli',
    summarySectionHeadingColor: 'Nagłówek podsumowania',
    paymentDetailsPanelBackgroundColor: 'Tło panelu płatności',
    paymentDetailsBorderColor: 'Obramowanie płatności',
    paymentDetailsHeadingColor: 'Nagłówek płatności',
    transferTitleColor: 'Tytuł przelewu',
    transferAmountColor: 'Kwota przelewu',
    mainContentTextColor: 'Główna treść',
    dateStrongColor: 'Kolor daty',
    meetLinkColor: 'Kolor linku Meet',
    footerLineColor: 'Kolor linii stopki',
    footerStripBackgroundColor: 'Tło paska stopki',
  }

  if (colorFields.length === 0) {
    return <p className="text-sm text-neutral-500">Ten szablon nie ma ustawień motywu.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {colorFields.map((key) => {
        const value = String(data[key] ?? '#111111')
        const label = THEME_LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
        const isHex = /^#[0-9a-fA-F]{3,8}$/.test(value)

        return (
          <div key={key} className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-400">{label}</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={isHex && value.length <= 7 ? value : '#111111'}
                onChange={(e) => onChange(key, e.target.value)}
                className="h-9 w-10 shrink-0 cursor-pointer rounded border border-white/10 bg-transparent"
                aria-label={`Kolor: ${label}`}
              />
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(key, e.target.value)}
                className="h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-3 font-mono text-xs text-white outline-none focus-visible:border-purple-500/60"
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
