'use client'

import { useState } from 'react'
import type { PricingCategoryAdmin, ProjectTypeAdmin } from '@/lib/db/queries/pricing'
import type { PricingConfig, PricingItem } from '@/lib/data/pricing'
import {
  CENNIK_SECTIONS,
  CategoriesPanel,
  ConfigPanel,
  ItemsPanel,
  LayoutPanel,
  ProjectTypesPanel,
  type CennikSection,
} from '@/components/magazyn/cennik-panels'
import { PackagesPanel } from '@/components/magazyn/cennik-packages-panel'
import { mergePricingPackagesForAdmin } from '@/lib/magazyn/pricing-packages-defaults'
import type { PricingPackage } from '@/lib/data/pricing'
import { DbBanner, PageHeader, StatusMessage } from '@/components/magazyn/ui'

type Props = {
  config: PricingConfig
  items: PricingItem[]
  categories: PricingCategoryAdmin[]
  projectTypes: ProjectTypeAdmin[]
  itemCount: number
  categoryCount: number
  dbConnected: boolean
  catalogNeedsSave?: boolean
}

function str(value: string | null | undefined) {
  return value ?? ''
}

function num(value: number | null | undefined) {
  return value ?? 0
}

function normalizeConfig(config: PricingConfig): PricingConfig {
  return {
    ...config,
    vatRate: num(config.vatRate),
    depositPercent: num(config.depositPercent),
    depositFixed: num(config.depositFixed),
    calendlyUrl: str(config.calendlyUrl),
    hourlyRateDev: num(config.hourlyRateDev),
    hourlyRateConsulting: num(config.hourlyRateConsulting),
    workHoursPerDay: num(config.workHoursPerDay),
    discoveryWorkshopPrice: num(config.discoveryWorkshopPrice),
    websiteStartPrice: num(config.websiteStartPrice),
    websiteAdvancedStartPrice: num(config.websiteAdvancedStartPrice),
    ecommerceStandardStartPrice: num(config.ecommerceStandardStartPrice),
    ecommerceProStartPrice: num(config.ecommerceProStartPrice),
    webappStartPrice: num(config.webappStartPrice),
    ctaTexts: {
      reserve: str(config.ctaTexts?.reserve),
      workshop: str(config.ctaTexts?.workshop),
      pdf: str(config.ctaTexts?.pdf),
    },
  }
}

function normalizeItem(item: PricingItem): PricingItem {
  return {
    ...item,
    name: str(item.name),
    category: str(item.category),
    price: num(item.price),
    hours: num(item.hours),
    projectTypes: item.projectTypes ?? [],
    description: item.description ?? undefined,
  }
}

export function CennikClient({
  config,
  items,
  categories,
  projectTypes,
  itemCount,
  categoryCount,
  dbConnected,
  catalogNeedsSave = false,
}: Props) {
  const [section, setSection] = useState<CennikSection>('layout')
  const [configForm, setConfigForm] = useState(() => normalizeConfig(config))
  const [packagesForm, setPackagesForm] = useState<PricingPackage[]>(() =>
    mergePricingPackagesForAdmin(config.packages, config),
  )
  const [categoriesForm, setCategoriesForm] = useState(categories)
  const [projectTypesForm, setProjectTypesForm] = useState(projectTypes)
  const [itemsForm, setItemsForm] = useState(() => items.map(normalizeItem))
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [pending, setPending] = useState(false)

  const shared = { pending, status, error }

  async function saveConfig() {
    setPending(true)
    setStatus(null)
    setError(false)
    try {
      const payload = { ...configForm, packages: packagesForm }
      const res = await fetch('/api/magazyn/cennik/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Zapis konfiguracji nie powiódł się')
      setConfigForm(payload)
      setStatus('Konfiguracja zapisana.')
    } catch (e) {
      setError(true)
      setStatus(e instanceof Error ? e.message : 'Błąd')
    } finally {
      setPending(false)
    }
  }

  async function savePackages() {
    setPending(true)
    setStatus(null)
    setError(false)
    try {
      const configPayload = { ...configForm, packages: packagesForm }
      const [configRes, itemsRes] = await Promise.all([
        fetch('/api/magazyn/cennik/config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(configPayload),
        }),
        fetch('/api/magazyn/cennik/items', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: itemsForm }),
        }),
      ])
      if (!configRes.ok) throw new Error('Zapis pakietów nie powiódł się')
      if (!itemsRes.ok) throw new Error('Zapis pozycji katalogu nie powiódł się')
      setConfigForm(configPayload)
      setStatus('Pakiety i pozycje katalogu zapisane.')
    } catch (e) {
      setError(true)
      setStatus(e instanceof Error ? e.message : 'Błąd')
    } finally {
      setPending(false)
    }
  }

  async function saveCategories() {
    setPending(true)
    setStatus(null)
    setError(false)
    try {
      const res = await fetch('/api/magazyn/cennik/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: categoriesForm }),
      })
      if (!res.ok) throw new Error('Zapis kategorii nie powiódł się')
      setStatus('Kategorie zapisane.')
    } catch (e) {
      setError(true)
      setStatus(e instanceof Error ? e.message : 'Błąd')
    } finally {
      setPending(false)
    }
  }

  async function saveProjectTypes() {
    setPending(true)
    setStatus(null)
    setError(false)
    try {
      const res = await fetch('/api/magazyn/cennik/project-types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectTypes: projectTypesForm }),
      })
      if (!res.ok) throw new Error('Zapis typów projektu nie powiódł się')
      setStatus('Typy projektu zapisane.')
    } catch (e) {
      setError(true)
      setStatus(e instanceof Error ? e.message : 'Błąd')
    } finally {
      setPending(false)
    }
  }

  async function saveLayout() {
    setPending(true)
    setStatus(null)
    setError(false)
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        fetch('/api/magazyn/cennik/items', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: itemsForm }),
        }),
        fetch('/api/magazyn/cennik/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categories: categoriesForm }),
        }),
      ])
      if (!itemsRes.ok) throw new Error('Zapis pozycji nie powiódł się')
      if (!categoriesRes.ok) throw new Error('Zapis kolejności sekcji nie powiódł się')
      setStatus('Układ cennika, kolejność sekcji i pozycje zapisane.')
    } catch (e) {
      setError(true)
      setStatus(e instanceof Error ? e.message : 'Błąd')
    } finally {
      setPending(false)
    }
  }

  async function saveItems() {
    setPending(true)
    setStatus(null)
    setError(false)
    try {
      const res = await fetch('/api/magazyn/cennik/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsForm }),
      })
      if (!res.ok) throw new Error('Zapis pozycji nie powiódł się')
      setStatus('Pozycje zapisane.')
    } catch (e) {
      setError(true)
      setStatus(e instanceof Error ? e.message : 'Błąd')
    } finally {
      setPending(false)
    }
  }

  const sectionTitle = CENNIK_SECTIONS.find((s) => s.id === section)?.label ?? 'Cennik'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cennik"
        description={`${itemCount} pozycji · ${categoryCount} kategorii · ${packagesForm.length} pakietów · ${projectTypesForm.length} typów projektu`}
      />
      <DbBanner connected={dbConnected} />

      {dbConnected && catalogNeedsSave ? (
        <div
          role="status"
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90"
        >
          Wykryto brakującą sekcję <strong>Strategia</strong> lub pozycje spoza układu. Zapisz kategorie i układ
          cennika, aby zaktualizować produkcję — albo uruchom <code className="text-amber-50">pnpm patch:pricing</code>{' '}
          z connection stringiem Neon.
        </div>
      ) : null}

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex shrink-0 flex-row flex-wrap gap-1 lg:w-52 lg:flex-col lg:gap-0.5">
          {CENNIK_SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                section === item.id ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1 space-y-4">
          <h2 className="text-lg font-medium">{sectionTitle}</h2>

          {section === 'config' ? (
            <ConfigPanel {...shared} configForm={configForm} setConfigForm={setConfigForm} onSave={saveConfig} />
          ) : null}

          {section === 'packages' ? (
            <PackagesPanel
              packages={packagesForm}
              setPackages={setPackagesForm}
              items={itemsForm}
              setItems={setItemsForm}
              categories={categoriesForm}
              projectTypes={projectTypesForm}
              workHoursPerDay={num(configForm.workHoursPerDay) || 6}
              pending={pending}
              onSave={savePackages}
            />
          ) : null}

          {section === 'layout' ? (
            <LayoutPanel
              {...shared}
              projectTypes={projectTypesForm}
              categories={categoriesForm}
              setCategories={setCategoriesForm}
              items={itemsForm}
              setItems={setItemsForm}
              config={configForm}
              onSave={saveLayout}
            />
          ) : null}

          {section === 'project-types' ? (
            <ProjectTypesPanel
              {...shared}
              projectTypes={projectTypesForm}
              setProjectTypes={setProjectTypesForm}
              onSave={saveProjectTypes}
            />
          ) : null}

          {section === 'categories' ? (
            <CategoriesPanel
              {...shared}
              categories={categoriesForm}
              setCategories={setCategoriesForm}
              onSave={saveCategories}
            />
          ) : null}

          {section === 'items' ? (
            <ItemsPanel
              {...shared}
              items={itemsForm}
              setItems={setItemsForm}
              categories={categoriesForm}
              projectTypes={projectTypesForm}
              onSave={saveItems}
            />
          ) : null}
        </div>
      </div>

      <StatusMessage message={status} error={error} />
    </div>
  )
}
