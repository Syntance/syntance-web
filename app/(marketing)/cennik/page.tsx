import { Metadata } from 'next'
import { sanityFetch } from '@/sanity/lib/fetch'
import { pricingDataQuery, PricingData, defaultPricingData } from '@/sanity/queries/pricing'
import { PricingConfigurator } from '@/components/PricingConfigurator'
import NavbarStudio from '@/components/navbar-studio'
import PricingFAQ from '@/components/sections/pricing-faq'
import { Twitter, Linkedin, Github } from 'lucide-react'

// Wymusza dynamiczne renderowanie - dane zawsze świeże z Sanity
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ile kosztuje strona internetowa? Cennik 2026 | Syntance',
  description: 'Skonfiguruj swój projekt i zobacz orientacyjną wycenę w czasie rzeczywistym. Strony WWW, sklepy e-commerce i aplikacje webowe.',
  openGraph: {
    title: 'Konfigurator Cennika — Syntance',
    description: 'Skonfiguruj swój projekt i zobacz orientacyjną wycenę w czasie rzeczywistym.',
    url: 'https://syntance.com/cennik',
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
    <div className="min-h-screen bg-gray-950 w-full" style={{ overflowX: 'clip' }}>
      <NavbarStudio />
      
      {/* Animated hero wrapper - BEZ konfiguratora (transform blokuje sticky) */}
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
      </div>

      {/* Configurator - POZA animowanym wrapperem żeby sticky działało */}
      <section className="relative z-10 py-12 px-4 sm:px-6 lg:px-12 w-full">
        <div className="max-w-7xl mx-auto w-full">
          <PricingConfigurator data={data} />
        </div>
      </section>

      {/* FAQ Section */}
      <PricingFAQ />

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-900 pt-16 pb-12 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <a href="/" className="text-gray-400 hover:text-white transition-colors font-medium">
                ← Powrót do strony głównej
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
              © Syntance — Strony i sklepy, które działają.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
