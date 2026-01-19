"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function PricingStudioNew() {
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
      id="pricing-studio"
      ref={sectionRef}
      aria-labelledby="pricing-heading"
      className="relative z-10 py-32 px-6 lg:px-12 overflow-hidden opacity-0 translate-y-8 transition-all duration-1000"
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <header className="mb-16">
          <h2 id="pricing-heading" className="text-4xl md:text-5xl font-light tracking-widest glow-text mb-6">
            Cennik i wycena
          </h2>
          <p className="text-lg font-light tracking-wide text-gray-400 max-w-2xl mx-auto">
            Każdy projekt jest unikalny — dlatego zaprojektowaliśmy interaktywny konfigurator, który pomoże Ci oszacować koszt i czas realizacji w kilka minut.
          </p>
        </header>

        {/* Value propositions */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="product-card rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 bg-opacity-10 flex items-center justify-center mx-auto mb-4">
              <Check className="text-blue-400" size={24} />
            </div>
            <h3 className="text-lg font-medium mb-2">Transparentność</h3>
            <p className="text-sm text-gray-400 font-light">
              Jasna wycena bez ukrytych kosztów
            </p>
          </div>

          <div className="product-card rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 bg-opacity-10 flex items-center justify-center mx-auto mb-4">
              <Check className="text-purple-400" size={24} />
            </div>
            <h3 className="text-lg font-medium mb-2">Elastyczność</h3>
            <p className="text-sm text-gray-400 font-light">
              Dopasowanie do budżetu i potrzeb
            </p>
          </div>

          <div className="product-card rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 bg-opacity-10 flex items-center justify-center mx-auto mb-4">
              <Check className="text-amber-400" size={24} />
            </div>
            <h3 className="text-lg font-medium mb-2">Wartość</h3>
            <p className="text-sm text-gray-400 font-light">
              Inwestycja, która się zwraca
            </p>
          </div>
        </div>

        {/* CTA Box */}
        <div className="relative group">
          {/* Gradient border effect */}
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 rounded-3xl transition-opacity duration-500 blur-sm ${
            isMobile ? 'opacity-40' : 'opacity-20 group-hover:opacity-40'
          }`}></div>
          
          <div className="relative product-card rounded-3xl p-12 backdrop-blur-sm">
            <h3 className="text-3xl md:text-4xl font-light tracking-wide mb-4 glow-text">
              Gotowy stworzyć coś wspaniałego?
            </h3>
            <p className="text-gray-400 font-light tracking-wide mb-8 max-w-lg mx-auto">
              Skonfiguruj projekt i poznaj szacunkową cenę. Zarezerwuj termin od razu.
            </p>
            
            <a 
              href="/cennik"
              className="px-10 py-4 bg-white text-gray-900 rounded-full font-medium tracking-wider hover:bg-opacity-90 transition-all glow-box cursor-pointer group inline-flex items-center gap-2"
            >
              Sprawdź cenę strony
              <span className={`inline-block transition-transform ${
                isMobile ? 'translate-x-1' : 'group-hover:translate-x-1'
              }`}>→</span>
            </a>

            {/* Decorative elements */}
            <div className="absolute top-6 right-6 w-20 h-20 border border-white/5 rounded-full"></div>
            <div className="absolute bottom-6 left-6 w-16 h-16 border border-white/5 rounded-full"></div>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-12 text-sm text-gray-500 font-light text-center">
          <p>Gwarancja 30 dni</p>
          <p className="mt-2">Po tym czasie opcjonalna opieka w ramach abonamentu</p>
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

