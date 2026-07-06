import { Metadata } from 'next'
import Link from 'next/link'
import { PricingConfigurator } from '@/components/PricingConfigurator'
import PricingFAQ from '@/components/sections/pricing-faq'
import { fetchPricingData } from '@/lib/pricing-data'
import { strategiaWorkshopPriceNet } from '@/lib/pricing-calculator'
import { getConfiguratorMinimumPricesNet } from '@/lib/pricing-configurator-minimum'
import { fetchFaqSettings, resolveCennikFaqItems } from '@/lib/faq-data'
import Footer from '@/components/sections/footer'

// Wymusza dynamiczne renderowanie - dane zawsze świeże z Sanity
export const dynamic = 'force-dynamic'

// Funkcja do formatowania ceny
function formatPrice(price: number): string {
  return price.toLocaleString('pl-PL')
}

// Dynamiczne metadata — te same minima co w konfiguratorze (baza, bez dodatków)
export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchPricingData()
  const mins = getConfiguratorMinimumPricesNet(data)

  return {
    title: 'Ile kosztuje strona internetowa? Cennik 2026 | Syntance',
    description: `Strona firmowa od ${formatPrice(mins.websiteNet)} PLN netto (baza w konfiguratorze), sklep e-commerce od ${formatPrice(mins.ecommerceNet)} PLN netto. Sprawdź cenę w konfiguratorze — wycena w kilka minut, bez zobowiązań.`,
    openGraph: {
      title: 'Ile kosztuje strona internetowa? | Syntance',
      description:
        'Cena strony internetowej zależy od funkcjonalności. Sprawdź ile kosztuje zrobienie strony internetowej lub sklepu e-commerce.',
      url: 'https://syntance.com/cennik',
    },
  }
}

export default async function CennikPage() {
  const [data, faqDoc] = await Promise.all([fetchPricingData(), fetchFaqSettings()])
  const mins = getConfiguratorMinimumPricesNet(data)
  const discoveryNet = strategiaWorkshopPriceNet(data)
  const faqData = resolveCennikFaqItems(faqDoc, mins, discoveryNet)

  return (
    <div className="min-h-screen bg-gray-950 w-full" style={{ overflowX: 'clip' }}>
      {/* Animated hero wrapper - BEZ konfiguratora (transform blokuje sticky) */}
      <div className="animate-fade-in-scale">
        {/* Hero section */}
        <section className="relative z-10 pt-52 pb-16 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="glow-text mb-6">
              Ile kosztuje strona internetowa?
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
      <PricingFAQ items={faqData} />

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

      <Footer />
    </div>
  )
}
