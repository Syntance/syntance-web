import { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    path: '/syntance-studio',
    title: 'Syntance Studio — program do PDF na Windows: edycja, redakcja, OCR, druk',
    description:
      'Syntance Studio to program do pracy z PDF na komputerze: czytanie, komentarze, edycja treści, scalanie, redakcja danych wrażliwych, OCR i moduły Print, Wektor i Obraz. Działa offline, plan Free bez karty.',
    ogTitle: 'Syntance Studio — PDF na Twoim komputerze',
    ogDescription: 'Edycja, redakcja, OCR i przygotowanie do druku. Działa offline. Pobierz za darmo.',
    keywords: ['program do PDF', 'edytor PDF Windows', 'redakcja PDF', 'OCR PDF offline', 'scalanie PDF', 'przygotowanie do druku PDF'],
  })
}

export default function StudioLandingLayout({ children }: { children: React.ReactNode }) {
  return children
}
