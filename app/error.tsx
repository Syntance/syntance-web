'use client'

import { useEffect } from 'react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Hook do Sentry/PostHog gdy będzie podłączony (rules: 50-perf-a11y, 60-quality).
    if (typeof window !== 'undefined') {
      console.error('[ErrorBoundary]', error)
    }
  }, [error])

  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center px-6 py-32 bg-black text-[#F5F3FF]"
    >
      <div className="max-w-xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-400 mb-6">
          Coś nie zadziałało
        </p>
        <h1 className="text-3xl md:text-4xl font-light tracking-wider mb-6">
          Strona napotkała błąd.
        </h1>
        <p className="text-gray-400 font-light mb-10 max-w-md mx-auto">
          Przepraszamy — odśwież stronę albo wróć na stronę główną. Już się tym
          zajmujemy.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-full bg-white text-gray-900 font-medium tracking-wider hover:bg-white/90 transition-colors cursor-pointer"
          >
            Spróbuj ponownie
          </button>
          <a
            href="/"
            className="px-6 py-3 rounded-full border border-gray-700 text-white font-medium tracking-wider hover:bg-gray-900/60 transition-colors"
          >
            Strona główna
          </a>
        </div>
        {error.digest && (
          <p className="mt-10 text-xs text-gray-500 font-mono">
            ID błędu: {error.digest}
          </p>
        )}
      </div>
    </main>
  )
}
