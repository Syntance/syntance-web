/** Statyczny podgląd zakładki Przegląd — bez JS, tylko dekoracja sekcji marketingowej. */
export default function PanelOverviewMock() {
  const navItems = ['Przegląd', 'Strony', 'Produkty', 'Zamówienia', 'Analityka']

  return (
    <figure
      className="relative mx-auto w-full max-w-3xl"
      aria-label="Podgląd panelu administracyjnego Syntance — zakładka Przegląd"
    >
      <div className="absolute -inset-1 rounded-[1.25rem] bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 blur-sm" />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0f] shadow-2xl shadow-black/50">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
          <span className="size-2.5 rounded-full bg-red-400/80" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-amber-400/80" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" aria-hidden="true" />
          <span className="ml-2 truncate text-[11px] text-gray-500">panel.syntance.com · Przegląd</span>
        </div>

        <div className="grid md:grid-cols-[140px_1fr]">
          <div className="hidden border-r border-white/10 bg-black/40 p-3 md:block">
            <p className="mb-3 px-2 text-[10px] font-medium uppercase tracking-wider text-gray-500">
              Syntance Panel
            </p>
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = item === 'Przegląd'
                return (
                  <li
                    key={item}
                    className={`rounded-lg px-2.5 py-2 text-xs ${
                      isActive
                        ? 'bg-purple-500/15 font-medium text-white ring-1 ring-purple-400/30'
                        : 'text-gray-500'
                    }`}
                  >
                    {item}
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="p-4 sm:p-5">
            <div className="mb-4">
              <p className="text-sm font-medium text-white">Przegląd</p>
              <p className="text-xs text-gray-500">Strona, sklep i analityka w jednym miejscu</p>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {[
                { label: 'PageSpeed', value: '94' },
                { label: 'Zamówienia', value: '128' },
                { label: 'Przychód', value: '42k' },
                { label: 'Sesje', value: '3.2k' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                >
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-lg font-medium text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <div className="mb-3 flex items-center justify-between text-[11px] text-gray-500">
                <span>Ruch · ostatnie 7 dni</span>
                <span className="text-emerald-400">GA4 + PostHog</span>
              </div>
              <div className="flex h-20 items-end gap-1.5">
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
          </div>
        </div>
      </div>
      <figcaption className="sr-only">
        Statyczny podgląd zakładki Przegląd w panelu Syntance. Pełna wersja interaktywna dostępna na stronie
        panelu.
      </figcaption>
    </figure>
  )
}
