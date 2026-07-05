"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";

type PricingStudioNewProps = {
  sectionId?: string;
  headingId?: string;
};

const CONFIGURATOR_DESCRIPTION =
  "Interaktywny konfigurator pokaże koszt i orientacyjny czas realizacji.";

export default function PricingStudioNew({
  sectionId = "pricing-studio",
  headingId = "pricing-heading",
}: PricingStudioNewProps = {}) {
  const sectionRef = useRef<HTMLElement>(null);

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
      id={sectionId}
      ref={sectionRef}
      aria-labelledby={headingId}
      className="relative z-10 py-20 md:py-32 px-5 md:px-6 lg:px-12 overflow-hidden opacity-0 translate-y-8 transition-all duration-1000"
    >
      {/* ─────────────────────  MOBILE  ───────────────────── */}
      <div className="md:hidden max-w-md mx-auto">
        <header className="text-center mb-7">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-purple-300/70 mb-3">
            Cennik
          </p>
          <h2 id={headingId} className="text-3xl font-light tracking-tight leading-[1.15] text-white mb-3">
            Sprawdź cenę <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">w 2 minuty</span>
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            {CONFIGURATOR_DESCRIPTION}
          </p>
          <a
            href="/cennik"
            className="flex items-center justify-center gap-2 w-full px-6 py-4 min-h-[52px] rounded-full bg-white text-gray-900 text-base font-semibold tracking-wide active:bg-white/90 transition-colors shadow-xl shadow-purple-500/20"
          >
            Sprawdź cenę strony
            <span aria-hidden="true">→</span>
          </a>
        </header>

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
        <header className="mb-16">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-purple-300/70 mb-3">
            Cennik
          </p>
          <h2 className="text-4xl md:text-5xl font-light tracking-widest glow-text mb-6">
            Sprawdź cenę{' '}
            <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              w 2 minuty
            </span>
          </h2>
          <p className="text-lg font-light tracking-wide text-gray-400 max-w-2xl mx-auto mb-8">
            {CONFIGURATOR_DESCRIPTION}
          </p>
          <a
            href="/cennik"
            className="group inline-flex items-center gap-2 px-10 py-4 bg-white text-gray-900 rounded-full font-medium tracking-wider hover:bg-white/90 transition-all glow-box cursor-pointer"
          >
            Sprawdź cenę strony
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </a>
        </header>

        <div className="text-sm text-gray-400 font-light text-center">
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
