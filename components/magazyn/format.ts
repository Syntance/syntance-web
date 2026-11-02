export const fmtDate = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleDateString('pl-PL', { dateStyle: 'medium' }) : '—'
export const fmtDateTime = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) : '—'
export const fmtMoney = (total: number | null, currency: string | null): string =>
  total === null || !currency ? '—' : `${(total / 100).toFixed(2)} ${currency}`
