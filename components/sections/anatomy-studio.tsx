"use client";

import { useEffect, useRef } from "react";
import { Target, Users, Zap, MessageSquare, Brain, GitBranch, Sparkles, Gauge, Bot } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function AnatomyStudio() {
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            section.classList.add('section-visible');
            observer.unobserve(section);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(section);

    return () => {
      observer.unobserve(section);
    };
  }, []);

  return (
    <section 
      id="anatomy-studio"
      ref={sectionRef}
      aria-labelledby="anatomy-heading"
      className="relative z-10 py-32 px-6 lg:px-12 overflow-hidden opacity-0 translate-y-8 transition-all duration-1000"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="text-center mb-20">
          <h2 id="anatomy-heading" className="text-4xl md:text-5xl font-light tracking-widest glow-text mb-6">
            Większość agencji zaczyna od grafiki.<br />My zaczynamy od biznesu.
          </h2>
          <p className="text-xl font-light tracking-wide text-gray-400 max-w-2xl mx-auto">
            Dobra strona to wierzchołek góry lodowej.
          </p>
        </header>

        {/* Layers */}
        <div className="space-y-8">
          {/* Layer 1: Fundament - Strategia */}
          <div className="relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-2xl transition-opacity blur-sm ${
              isMobile ? 'opacity-30' : 'opacity-20 group-hover:opacity-30'
            }`}></div>
            
            <div className="relative product-card rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-2xl">🏗️</span>
                </div>
                <div>
                  <div className="text-sm text-purple-400 font-medium tracking-wider uppercase">Poziom 1</div>
                  <h3 className="text-2xl font-medium tracking-wide">Fundament — Strategia</h3>
                </div>
              </div>
              
              <p className="text-gray-400 mb-6 italic">
                Bez tego strona jest tylko ładnym obrazkiem.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Target size={20} className="text-purple-400" />
                    Cel Biznesowy
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Definiujemy co strona ma osiągnąć: więcej klientów? wyższa marża? mniej pytań na telefon? Bez celu nie zmierzymy sukcesu.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Users size={20} className="text-purple-400" />
                    Buyer Persony
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Opisujemy kto jest Twoim idealnym klientem, czego szuka, jakie ma obawy. Strona mówi do konkretnej osoby, nie &quot;do wszystkich&quot;.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Zap size={20} className="text-purple-400" />
                    Unikalna Wartość (UVP)
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Odpowiadamy na pytanie: &quot;Dlaczego klient ma wybrać Ciebie, a nie konkurencję?&quot; To serce całej komunikacji.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Layer 2: Mechanika - Konwersja */}
          <div className="relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-2xl transition-opacity blur-sm ${
              isMobile ? 'opacity-30' : 'opacity-20 group-hover:opacity-30'
            }`}></div>
            
            <div className="relative product-card rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-2xl">⚙️</span>
                </div>
                <div>
                  <div className="text-sm text-blue-400 font-medium tracking-wider uppercase">Poziom 2</div>
                  <h3 className="text-2xl font-medium tracking-wide">Mechanika — Konwersja</h3>
                </div>
              </div>
              
              <p className="text-gray-400 mb-6 italic">
                To, co zmienia odwiedzającego w klienta.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <MessageSquare size={20} className="text-blue-400" />
                    Copywriting
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Tekst, który sprzedaje. Nie &quot;ładne słowa&quot;, ale komunikaty oparte na psychologii i bólach klienta.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Brain size={20} className="text-blue-400" />
                    Psychologia sprzedaży
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Social proof, pilność, obiekcje — elementy, które budują zaufanie i przyspieszają decyzję.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <GitBranch size={20} className="text-blue-400" />
                    Lejek (User Flow)
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Ścieżka od wejścia do kontaktu. Każdy klik ma cel. Zero ślepych zaułków.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Layer 3: Efekt końcowy - Tech & Design */}
          <div className="relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 rounded-2xl transition-opacity blur-sm ${
              isMobile ? 'opacity-30' : 'opacity-20 group-hover:opacity-30'
            }`}></div>
            
            <div className="relative product-card rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
                <div>
                  <div className="text-sm text-cyan-400 font-medium tracking-wider uppercase">Poziom 3</div>
                  <h3 className="text-2xl font-medium tracking-wide">Efekt końcowy — Tech & Design</h3>
                </div>
              </div>
              
              <p className="text-gray-400 mb-6 italic">
                To, co buduje zaufanie i zachwyt.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Sparkles size={20} className="text-cyan-400" />
                    Design premium
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Estetyka, która mówi &quot;tu jest profesjonalista&quot;. Dopasowana do Twojej branży i klienta.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Gauge size={20} className="text-cyan-400" />
                    Szybkość (Next.js)
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    PageSpeed 90+. Strona ładuje się błyskawicznie. Google to nagradza, klient nie ucieka.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Bot size={20} className="text-cyan-400" />
                    AEO (AI Ready)
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Struktura czytelna dla ChatGPT i Perplexity. Twoja strona pojawia się w odpowiedziach AI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Quote */}
        <div className="mt-16 text-center">
          <div className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 border border-white/10">
            <p className="text-lg font-light text-gray-300 italic">
              <span className="text-2xl mr-2">💎</span>
              <strong>Efekt:</strong> Strona, która nie tylko wygląda, ale pracuje na Twój wynik.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .section-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
}
