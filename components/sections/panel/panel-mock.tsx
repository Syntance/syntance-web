import { PANEL_NAV, type PanelViewId } from '@/components/sections/panel/panel-content'

type PanelMockProps = {
  view: PanelViewId
  className?: string
  compact?: boolean
  animate?: boolean
}

function ViewOverview() {
  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: 'Przychód', value: '42 800 zł' },
          { label: 'Zamówienia', value: '128' },
          { label: 'Klienci', value: '1 024' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
          >
            <p className="text-[10px] uppercase tracking-wider text-gray-500">{stat.label}</p>
            <p className="mt-1 text-sm font-medium text-white">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <div className="mb-3 flex items-center justify-between text-[11px] text-gray-500">
          <span>Ruch · ostatnie 7 dni</span>
          <span className="text-emerald-400">+18%</span>
        </div>
        <div className="flex h-16 items-end gap-1.5">
          {[38, 52, 44, 68, 58, 74, 62].map((height, index) => (
            <div
              key={index}
              className="flex-1 rounded-sm bg-gradient-to-t from-purple-500/40 to-cyan-400/70"
              style={{ height: `${height}%` }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </>
  )
}

function ViewProducts() {
  return (
    <ul className="space-y-2">
      {[
        { name: 'Kurtka Softshell Pro', price: '449 zł', stock: '24 szt.' },
        { name: 'Bluza merino', price: '279 zł', stock: '12 szt.' },
        { name: 'Spodnie trekking', price: '329 zł', stock: 'Wyprzedane' },
      ].map((product) => (
        <li
          key={product.name}
          className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
        >
          <div className="min-w-0">
            <p className="truncate text-sm text-white">{product.name}</p>
            <p className="text-[11px] text-gray-500">{product.stock}</p>
          </div>
          <span className="shrink-0 text-sm font-medium text-purple-300">{product.price}</span>
        </li>
      ))}
    </ul>
  )
}

function ViewOrders() {
  return (
    <ul className="space-y-2">
      {[
        { id: '#1042', status: 'Wysłane', total: '728 zł', channel: 'BLIK' },
        { id: '#1041', status: 'Pakowanie', total: '1 240 zł', channel: 'Przelewy24' },
        { id: '#1040', status: 'Opłacone', total: '389 zł', channel: 'Karta' },
      ].map((order) => (
        <li
          key={order.id}
          className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
        >
          <span className="text-xs font-medium text-white">{order.id}</span>
          <span className="text-[11px] text-gray-400">
            {order.status} · {order.channel}
          </span>
          <span className="text-sm text-emerald-400">{order.total}</span>
        </li>
      ))}
    </ul>
  )
}

function ViewCms() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-3 py-2">
        <p className="text-[10px] uppercase tracking-wider text-purple-300/80">Edycja na żywo</p>
        <p className="mt-1 text-sm text-white">Hero — nagłówek strony głównej</p>
      </div>
      <label className="block">
        <span className="mb-1 block text-[11px] text-gray-500">Nagłówek</span>
        <span className="block rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white">
          Cały sklep z jednego panelu
        </span>
      </label>
      <label className="block">
        <span className="mb-1 block text-[11px] text-gray-500">CTA</span>
        <span className="block rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-gray-300">
          Umów demo panelu
        </span>
      </label>
      <p className="text-[11px] text-emerald-400">Opublikowano · widoczne na stronie</p>
    </div>
  )
}

function ViewSeo() {
  return (
    <div className="space-y-3">
      {[
        { path: '/', title: 'Sklep outdoor — Syntance Demo', score: 96 },
        { path: '/produkty/kurtka', title: 'Kurtka Softshell Pro | Sklep', score: 94 },
        { path: '/kontakt', title: 'Kontakt i wsparcie | Sklep', score: 98 },
      ].map((row) => (
        <div key={row.path} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="truncate text-[11px] text-gray-500">{row.path}</span>
            <span className="shrink-0 text-[11px] text-emerald-400">SEO {row.score}</span>
          </div>
          <p className="text-sm text-white">{row.title}</p>
          <p className="mt-1 line-clamp-2 text-[11px] text-gray-500">
            Meta opis edytowany w panelu — publikacja bez wtyczek i redeploy.
          </p>
        </div>
      ))}
    </div>
  )
}

function ViewStats() {
  return (
    <>
      <div className="mb-3 flex gap-2">
        {['Statystyki sprzedażowe', 'Analityka'].map((tab, index) => (
          <span
            key={tab}
            className={`rounded-full px-3 py-1 text-[11px] ${
              index === 0
                ? 'bg-purple-500/20 text-purple-200 ring-1 ring-purple-400/30'
                : 'text-gray-500'
            }`}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2">
        {[
          { label: 'Konwersja', value: '3,8%' },
          { label: 'Przychód', value: '42,8k zł' },
          { label: 'Koszyk → zakup', value: '61%' },
          { label: 'Top kanał', value: 'Organic' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
          >
            <p className="text-[10px] text-gray-500">{stat.label}</p>
            <p className="text-sm font-medium text-white">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <p className="mb-2 text-[11px] text-gray-500">Lejek · GA4 + PostHog</p>
        <div className="space-y-2">
          {[
            { step: 'Wyświetlenie produktu', value: '12,4k' },
            { step: 'Dodanie do koszyka', value: '2,1k' },
            { step: 'Checkout', value: '890' },
            { step: 'Zakup', value: '472' },
          ].map((row, index) => (
            <div key={row.step} className="flex items-center gap-2">
              <span className="w-4 text-[10px] text-gray-600">{index + 1}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                  style={{ width: `${100 - index * 22}%` }}
                />
              </div>
              <span className="w-10 text-right text-[10px] text-gray-400">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function ViewReturns() {
  return (
    <ul className="space-y-2">
      {[
        { id: 'ZW-018', status: 'Oczekuje', reason: 'Zły rozmiar', age: '2 dni' },
        { id: 'ZW-017', status: 'Przyjęty', reason: 'Uszkodzenie', age: 'Wysłany zwrot' },
        { id: 'ZW-016', status: 'Zamknięty', reason: 'Reklamacja', age: 'Zwrot na konto' },
      ].map((item) => (
        <li
          key={item.id}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-white">{item.id}</span>
            <span className="text-[11px] text-amber-300">{item.status}</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">
            {item.reason} · {item.age}
          </p>
        </li>
      ))}
    </ul>
  )
}

const VIEW_META: Record<PanelViewId, { title: string; subtitle: string }> = {
  overview: { title: 'Przegląd', subtitle: 'KPI sklepu po zalogowaniu' },
  products: { title: 'Produkty', subtitle: 'Katalog, ceny i stany magazynowe' },
  orders: { title: 'Zamówienia', subtitle: 'Statusy, płatności i wysyłka' },
  cms: { title: 'CMS', subtitle: 'Treści publikowane na żywo' },
  seo: { title: 'SEO', subtitle: 'Meta per podstrona' },
  stats: { title: 'Statystyki', subtitle: 'GA4 + PostHog w jednym widoku' },
  returns: { title: 'Zwroty', subtitle: 'Reklamacje i obsługa po sprzedaży' },
}

function ViewContent({ view }: { view: PanelViewId }) {
  switch (view) {
    case 'overview':
      return <ViewOverview />
    case 'products':
      return <ViewProducts />
    case 'orders':
      return <ViewOrders />
    case 'cms':
      return <ViewCms />
    case 'seo':
      return <ViewSeo />
    case 'stats':
      return <ViewStats />
    case 'returns':
      return <ViewReturns />
  }
}

export default function PanelMock({
  view,
  className = '',
  compact = false,
  animate = true,
}: PanelMockProps) {
  const meta = VIEW_META[view]

  return (
    <figure
      className={`relative w-full ${className}`}
      aria-label={`Podgląd panelu Syntance — zakładka ${meta.title}`}
    >
      <div className="absolute -inset-1 rounded-[1.25rem] bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 blur-sm" />
      <div
        className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0f] shadow-2xl shadow-black/50 ${
          animate ? 'transition-opacity duration-300 ease-out' : ''
        }`}
      >
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
          <span className="size-2.5 rounded-full bg-red-400/80" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-amber-400/80" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" aria-hidden="true" />
          <span className="ml-2 truncate text-[11px] text-gray-500">
            panel.syntance.com · {meta.title}
          </span>
        </div>

        <div className={`grid ${compact ? '' : 'md:grid-cols-[132px_1fr]'}`}>
          {!compact && (
            <div className="hidden border-r border-white/10 bg-black/40 p-3 md:block">
              <p className="mb-3 px-2 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Syntance Panel
              </p>
              <ul className="space-y-1">
                {PANEL_NAV.map((item) => {
                  const isActive = item.id === view
                  return (
                    <li
                      key={item.id}
                      className={`rounded-lg px-2.5 py-2 text-xs transition-colors duration-300 ${
                        isActive
                          ? 'bg-purple-500/15 font-medium text-white ring-1 ring-purple-400/30'
                          : 'text-gray-500'
                      }`}
                    >
                      {item.label}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          <div className="p-4 sm:p-5">
            <div className="mb-4">
              <p className="text-sm font-medium text-white">{meta.title}</p>
              <p className="text-xs text-gray-500">{meta.subtitle}</p>
            </div>
            <ViewContent view={view} />
          </div>
        </div>
      </div>
      <figcaption className="sr-only">
        Statyczny podgląd zakładki {meta.title} w panelu administracyjnym Syntance.
      </figcaption>
    </figure>
  )
}
