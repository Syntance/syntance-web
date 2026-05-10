'use client'

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.error('[GlobalErrorBoundary]', error)
    }
  }, [error])

  return (
    <html lang="pl">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          background: '#000',
          color: '#F5F3FF',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div style={{ maxWidth: 560, textAlign: 'center' }}>
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#9ca3af',
              marginBottom: '1.5rem',
            }}
          >
            Krytyczny błąd
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '1.5rem' }}>
            Aplikacja nie mogła się załadować.
          </h1>
          <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
            Spróbuj ponownie lub wróć później. Już się tym zajmujemy.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              background: '#fff',
              color: '#111',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Spróbuj ponownie
          </button>
          {error.digest && (
            <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#6b7280' }}>
              ID błędu: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
