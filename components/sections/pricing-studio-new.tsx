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
      { threshold: 0.15, rootMargin: '-20% 0px -20% 0px' }
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
      className="relative z-10 py-20 md:py-32 px-5 md:px-6 lg:px-12 overflow-hidden opacity-0 translate-y-8 transition-all duration-1000"
    >
      {/* ─────────────────────  MOBILE  ───────────────────── */}
      <div className="md:hidden max-w-md mx-auto">
        <header className="text-center mb-7">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-purple-300/70 mb-3">
            Cennik
          </p>
          <h2 id="pricing-heading" className="text-3xl font-light tracking-tight leading-[1.15] text-white mb-3">
            Sprawdź cenę <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">w 2 minuty</span>
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Interaktywny konfigurator pokaże <span className="text-white">koszt i czas</span> realizacji.
          </p>
        </header>

        {/* Mocna karta CTA — najważniejsza akcja na stronie */}
        <div className="relative mb-6">
          <div
            className="absolute -inset-1 rounded-3xl opacity-30 blur-xl -z-10"
            style={{
              backgroundImage:
                "linear-gradient(to right, #a855f7, #3b82f6, #ec4899)",
            }}
            aria-hidden="true"
          />
          <div className="relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 rounded-3xl p-6 text-center">
            <h3 className="text-xl font-medium text-white mb-2">
              Gotowy zacząć?
            </h3>
            <p className="text-sm text-gray-400 font-light mb-5 leading-relaxed">
              Skonfiguruj projekt, zobacz cenę i czas. Wyślij formularz — termin ustalimy indywidualnie.
            </p>
            <a
              href="/cennik"
              className="flex items-center justify-center gap-2 w-full px-6 py-4 min-h-[52px] rounded-full bg-white text-gray-900 text-base font-semibold tracking-wide active:bg-white/90 transition-colors shadow-xl shadow-purple-500/20"
            >
              Sprawdź cenę strony
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Mini value props - 3 quick wins */}
        <ul className="grid grid-cols-3 gap-2 mb-5" aria-label="Gwarancje">
          {[
            { label: "Bez ukrytych kosztów", color: "from-blue-400 to-cyan-400" },
            { label: "Twój kod, Twoja strona", color: "from-purple-400 to-pink-400" },
            { label: "Gwarancja 30 dni", color: "from-amber-400 to-orange-400" },
          ].map((vp, i) => (
            <li
              key={i}
              className="bg-white/[0.03] border border-white/10 rounded-xl p-3 text-center"
            >
              <span className={`inline-block w-6 h-6 rounded-full bg-gradient-to-br ${vp.color} mb-2`}>
                <Check className="text-white p-1" size={24} aria-hidden="true" />
              </span>
              <p className="text-[10px] text-gray-400 leading-tight">
                {vp.label}
              </p>
            </li>
          ))}
        </ul>

        <p className="text-center text-xs text-gray-500 leading-relaxed">
          Po wdrożeniu opcjonalna opieka w abonamencie.
        </p>
      </div>

      {/* ─────────────────────  DESKTOP  ───────────────────── */}
      <div className="hidden md:block max-w-4xl mx-auto text-center">
        {/* Header */}
        <header className="mb-16">
          <h2 id="pricing-heading" className="text-4xl md:text-5xl font-light tracking-widest glow-text mb-6">
            Cennik i wycena
          </h2>
          <p className="text-lg font-light tracking-wide text-gray-400 max-w-2xl mx-auto">
            Każdy projekt jest unikalny — dlatego zaprojektowaliśmy interaktywny konfigurator, który pomoże Ci oszacować koszt i czas realizacji w kilka minut.
          </p>
        </header>

        {/* CTA Box */}
        <div className="relative group">
          {/* Gradient border effect */}
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 rounded-3xl opacity-20 transition-opacity duration-500 blur-sm ${
            isMobile ? '' : 'group-hover:opacity-40'
          }`}></div>
          
          <div className="relative product-card rounded-3xl p-12 backdrop-blur-sm">
            <h3 className="text-3xl md:text-4xl font-light tracking-wide mb-4 glow-text">
              Gotowy stworzyć coś wspaniałego?
            </h3>
            <p className="text-gray-400 font-light tracking-wide mb-8 max-w-lg mx-auto">
              Skonfiguruj projekt i poznaj szacunkową cenę. Wyślij formularz — termin ustalimy indywidualnie.
            </p>
            
            <a 
              href="/cennik"
              className="px-10 py-4 bg-white text-gray-900 rounded-full font-medium tracking-wider hover:bg-white/90 transition-all glow-box cursor-pointer group inline-flex items-center gap-2"
            >
              Sprawdź cenę strony
              <span className={`inline-block transition-transform ${
                isMobile ? '' : 'group-hover:translate-x-1'
              }`}>→</span>
            </a>

            {/* Decorative elements */}
            <div className="absolute top-6 right-6 w-20 h-20 border border-white/5 rounded-full"></div>
            <div className="absolute bottom-6 left-6 w-16 h-16 border border-white/5 rounded-full"></div>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-12 text-sm text-gray-400 font-light text-center">
          <p>Gwarancja 30 dni</p>
          <p className="mt-2">Po tym czasie opcjonalna opieka w ramach abonamentu</p>
        </div>
      </div>
      {/* /Desktop */}

      <style jsx>{`
        .section-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
}

