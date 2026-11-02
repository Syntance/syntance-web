import { Suspense } from 'react'
import { PageHeader } from '@/components/magazyn/ui'

/** Ramka strony Studio: nagłówek + granica Suspense (listy czytają filtry z adresu URL). */
export function StudioFrame({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <PageHeader title={title} description={description} />
      <Suspense fallback={<p className="text-sm text-neutral-400" role="status">Wczytuję…</p>}>{children}</Suspense>
    </div>
  )
}
