import { Metadata } from 'next'
import { Mail, Phone, Calendar, MapPin, Clock, ArrowRight, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { ContactForm } from '@/components/contact-form'
import { PageTransition } from '@/components/page-transition'

export const metadata: Metadata = {
  title: 'Kontakt — Syntance | Strony i sklepy Next.js',
  description: 'Skontaktuj się z Syntance. Email: kontakt@syntance.com, tel: +48 662 519 544. Bezpłatna rozmowa o Twoim projekcie.',
  openGraph: {
    title: 'Kontakt | Syntance',
    description: 'Skontaktuj się z Syntance. Email: kontakt@syntance.com, tel: +48 662 519 544. Bezpłatna rozmowa o Twoim projekcie.',
    url: 'https://syntance.com/kontakt',
  },
}

const faqs = [
  {
    question: "Jak szybko odpowiadamy?",
    answer: "Staram się odpowiedzieć w ciągu 24 godzin roboczych. Na pilne sprawy — zadzwoń."
  },
  {
    question: "Czy pierwsza rozmowa jest płatna?",
    answer: "Nie. 30-minutowa rozmowa wstępna jest bezpłatna i bez zobowiązań."
  },
  {
    question: "Czy pracujemy z klientami spoza Polski?",
    answer: "Tak. Pracuję zdalnie z klientami z całej Europy. Komunikacja po polsku lub angielsku."
  },
  {
    question: "Jaki jest minimalny budżet na projekt?",
    answer: "Strony od 5 000 PLN, sklepy od 20 000 PLN. Dokładna wycena po rozmowie o zakresie."
  }
]

export default function KontaktPage() {
  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "mainEntity": {
              "@type": "LocalBusiness",
              "name": "Syntance P.S.A.",
              "description": "Studio tworzące strony i sklepy internetowe w Next.js",
              "url": "https://syntance.com",
              "email": "kontakt@syntance.com",
              "telephone": "+48662519544",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Czerniec 72",
                "addressLocality": "Łącko",
                "postalCode": "33-390",
                "addressCountry": "PL"
              },
              "founder": {
                "@type": "Person",
                "name": "Kamil Podobiński"
              },
              "sameAs": [
                "https://twitter.com/syntance",
                "https://linkedin.com/company/syntance"
              ]
            }
          })
        }}
      />
      
      <PageTransition>
      <div className="min-h-screen bg-[#05030C] w-full" style={{ overflowX: 'clip' }}>
        {/* Hero Section */}
        <section className="relative z-10 pt-52 pb-16 px-6 lg:px-12">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-white mb-6 leading-tight">
              Skontaktuj się
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
              Masz pytanie o projekt? Chcesz poznać wycenę? Napisz lub zadzwoń — odpowiadam osobiście.
            </p>
          </div>
        </section>

        {/* Main Content - 2 columns */}
        <section className="relative z-10 py-16 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16">
              
              {/* Left Column - Contact Info */}
              <div className="space-y-10">
                <div>
                  <h2 className="text-2xl font-medium text-white mb-8">Dane kontaktowe</h2>
                  
                  <div className="space-y-6">
                    {/* Email */}
                    <a 
                      href="mailto:kontakt@syntance.com" 
                      className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-purple-500/30 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Email</div>
                        <div className="text-white group-hover:text-purple-400 transition-colors">kontakt@syntance.com</div>
                      </div>
                    </a>
                    
                    {/* Phone */}
                    <a 
                      href="tel:+48662519544" 
                      className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-purple-500/30 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Telefon</div>
                        <div className="text-white group-hover:text-purple-400 transition-colors">+48 662 519 544</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          pon-pt, 9:00-17:00
                        </div>
                      </div>
                    </a>
                    
                    {/* Calendar */}
                    <a 
                      href="/#contact" 
                      className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-purple-500/30 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Kalendarz</div>
                        <div className="text-white group-hover:text-purple-400 transition-colors">Umów 30-min rozmowę</div>
                      </div>
                    </a>
                  </div>
                </div>
                
                {/* Company Data */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Dane firmy</h3>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="text-gray-300 text-sm space-y-1">
                        <div className="text-white font-medium">Syntance P.S.A.</div>
                        <div>Czerniec 72</div>
                        <div>33-390 Łącko</div>
                        <div className="text-gray-400 pt-2">NIP: 7343608647</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Social Media */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Social media</h3>
                  <div className="flex gap-3">
                    <a 
                      href="https://twitter.com/syntance" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-purple-500/30 transition-colors text-sm"
                    >
                      Twitter / X
                    </a>
                    <a 
                      href="https://linkedin.com/company/syntance" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-purple-500/30 transition-colors text-sm"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Form */}
              <div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-medium text-white">Napisz do mnie</h2>
                  </div>
                  
                  <ContactForm 
                    idPrefix="kontakt-page" 
                    source="kontakt-page"
                    showFullRodo={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative z-10 py-24 px-6 lg:px-12 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-4">
                Często zadawane pytania
              </h2>
              <p className="text-xl text-gray-400">
                Odpowiedzi na najczęstsze pytania
              </p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-xl p-6"
                >
                  <h3 className="text-lg font-medium text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-400">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 py-24 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
              
              <div className="relative bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
                <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white mb-6">
                  Wolisz najpierw poznać cennik?
                </h2>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                  Sprawdź orientacyjne ceny naszych usług przed kontaktem.
                </p>
                
                <Link 
                  href="/cennik" 
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
                >
                  <span>Zobacz cennik</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-gray-900 pt-16 pb-12 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors font-medium">
                ← Powrót do strony głównej
              </Link>
              <div className="flex gap-6">
                <Link href="/o-nas" className="text-gray-400 hover:text-white transition-colors">
                  O nas
                </Link>
                <Link href="/cennik" className="text-gray-400 hover:text-white transition-colors">
                  Cennik
                </Link>
                <Link href="/polityka-prywatnosci" className="text-gray-400 hover:text-white transition-colors">
                  Prywatność
                </Link>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-900">
              <p className="text-center text-sm font-light tracking-wider text-gray-400">
                © Syntance — Strony i sklepy, które działają.
              </p>
            </div>
          </div>
        </footer>
      </div>
      </PageTransition>
    </>
  )
}
