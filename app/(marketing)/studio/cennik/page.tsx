import { Metadata } from 'next'
import { sanityFetch } from '@/sanity/lib/fetch'
import { pricingDataQuery, PricingData, defaultPricingData } from '@/sanity/queries/pricing'
import { PricingConfigurator } from '@/components/PricingConfigurator'
import NavbarStudio from '@/components/navbar-studio'
import { Twitter, Linkedin, Github } from 'lucide-react'

// Wymusza dynamiczne renderowanie - dane zawsze świeże z Sanity
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Konfigurator Cennika — Syntance Studio',
  description: 'Skonfiguruj swój projekt i zobacz orientacyjną wycenę w czasie rzeczywistym. Strony WWW, sklepy e-commerce i aplikacje webowe.',
  openGraph: {
    title: 'Konfigurator Cennika — Syntance Studio',
    description: 'Skonfiguruj swój projekt i zobacz orientacyjną wycenę w czasie rzeczywistym.',
    url: 'https://syntance.com/studio/cennik',
  },
}

async function getPricingData(): Promise<PricingData> {
  try {
    const data = await sanityFetch<PricingData>({
      query: pricingDataQuery,
      tags: ['pricing'],
    })
    
    // Jeśli brak danych z Sanity, użyj domyślnych
    if (!data?.categories?.length || !data?.projectTypes?.length) {
      console.log('Using default pricing data (Sanity not configured)')
      return defaultPricingData
    }
    
    return data
  } catch (error) {
    console.error('Error fetching pricing data:', error)
    return defaultPricingData
  }
}

export default async function CennikPage() {
  const data = await getPricingData()

  return (
    <div className="min-h-screen bg-gray-950 overflow-x-hidden w-full max-w-full">
      <NavbarStudio />
      
      {/* Animated content wrapper */}
      <div className="animate-fade-in-scale">
        {/* Hero section */}
        <section className="relative z-10 pt-52 pb-16 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-light tracking-widest glow-text mb-6">
              Konfigurator wyceny
            </h1>
            <p className="text-xl font-light tracking-wide text-gray-400 max-w-2xl mx-auto">
              Wybierz elementy projektu i zobacz orientacyjną wycenę w czasie rzeczywistym.
              Finalna cena po szczegółowej rozmowie.
            </p>
          </div>
        </section>

        {/* Configurator */}
        <section className="relative z-10 py-12 px-4 sm:px-6 lg:px-12 overflow-x-hidden w-full">
          <div className="max-w-7xl mx-auto w-full overflow-hidden">
            <PricingConfigurator data={data} />
          </div>
        </section>

        {/* Info section */}
        <section className="relative z-10 py-16 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-medium text-white mb-2">Transparentność</h3>
                <p className="text-sm text-gray-400">Jasna wycena bez ukrytych kosztów</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔧</span>
                </div>
                <h3 className="font-medium text-white mb-2">Elastyczność</h3>
                <p className="text-sm text-gray-400">Dopasowanie do budżetu i potrzeb</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💎</span>
                </div>
                <h3 className="font-medium text-white mb-2">Wartość</h3>
                <p className="text-sm text-gray-400">Inwestycja, która się zwraca</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-900 pt-16 pb-12 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <a href="/studio" className="text-gray-400 hover:text-white transition-colors font-medium">
                ← Powrót do Syntance Studio
              </a>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter/X">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="GitHub">
                <Github size={20} />
              </a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-900">
            <p className="text-center text-sm font-light tracking-wider text-gray-500">
              © Syntance Studio — Strony i sklepy, które działają.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
