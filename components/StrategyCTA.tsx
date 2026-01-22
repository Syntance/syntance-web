'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, X } from 'lucide-react'
import { ContactForm } from './contact-form'

export function StrategyCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <section id="kontakt" className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
              <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-6">
                Gotowy na stronę, która pracuje na Twój wynik?
              </h2>
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Nie musisz znać odpowiedzi na wszystkie pytania. Wystarczy, że masz wizję — strategię zbudujemy razem.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/cennik#discovery" 
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
                >
                  <span>Zamów stronę ze strategią</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/10 text-white font-medium transition-all duration-300 hover:bg-white/5"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Bezpłatna konsultacja (15 min)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-3xl p-8 md:p-12 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Zamknij"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>

            {/* Modal content */}
            <div className="mb-8">
              <h3 className="text-2xl md:text-3xl font-light text-white mb-4">
                Umów bezpłatną konsultację
              </h3>
              <p className="text-gray-400">
                Wypełnij formularz, a odezwiemy się w ciągu 24h, aby ustalić termin 15-minutowej rozmowy o Twoim projekcie.
              </p>
            </div>

            <ContactForm 
              idPrefix="strategy-cta"
              showFullRodo={false}
              source="strategy-page-cta"
            />

            <div className="mt-6 text-xs text-gray-500 text-center">
              Twoje dane są bezpieczne. Sprawdź naszą{' '}
              <Link href="/polityka-prywatnosci" className="text-purple-400 hover:text-purple-300 underline">
                Politykę Prywatności
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
