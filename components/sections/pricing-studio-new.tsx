"use client";

import { useCallback, useEffect, useRef } from "react";
import { ArrowDown, Check } from "lucide-react";

const CONTACT_CTA_GLOW_STYLE = {
  backgroundImage: "linear-gradient(to right, #ffaa40, #9c40ff, #ffaa40)",
  backgroundSize: "300% 100%",
} as const;

function ContactScrollCta({ onClick }: { onClick: () => void }) {
  return (
    <div className="relative group w-fit max-w-full shrink-0">
      <div
        className="absolute -inset-1 rounded-full blur-md opacity-25 group-hover:opacity-40 transition-opacity animate-gradient -z-10"
        style={CONTACT_CTA_GLOW_STYLE}
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={onClick}
        className="relative z-10 inline-flex items-center gap-2 px-8 py-3 bg-gray-900/80 backdrop-blur-sm border border-gray-700 text-white rounded-full font-medium tracking-wider hover:bg-gray-800/80 transition-all cursor-pointer"
      >
        Napisz do nas
        <ArrowDown
          className="h-4 w-4 shrink-0 transition-transform group-hover:translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

type PricingStudioNewProps = {
  sectionId?: string;
  headingId?: string;
  /** Anchor sekcji kontaktu pod CTA (domyślnie #contact na stronie głównej). */
  contactHref?: string;
};

export default function PricingStudioNew({
  sectionId = "pricing-studio",
  headingId = "pricing-heading",
  contactHref = "#contact",
}: PricingStudioNewProps = {}) {
  const sectionRef = useRef<HTMLElement>(null);

  const scrollToContact = useCallback(() => {
    const targetId = contactHref.startsWith("#") ? contactHref.slice(1) : null;
    if (!targetId) {
      if (contactHref.startsWith("/") || contactHref.startsWith("http")) {
        window.location.href = contactHref;
      }
      return;
    }

    const element = document.getElementById(targetId);
    if (!element) return;

    const navbarHeight = 100;
    const elementTop = element.getBoundingClientRect().top + window.scrollY;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: elementTop - navbarHeight,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [contactHref]);

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
          <p className="text-sm text-gray-400 leading-relaxed">
            Interaktywny konfigurator pokaże <span className="text-white">koszt i czas</span> realizacji.
          </p>
        </header>

        {/* CTA — bez calloutu, dwa przyciski */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <ContactScrollCta onClick={scrollToContact} />
          <a
            href="/cennik"
            className="inline-flex w-fit max-w-full shrink-0 items-center justify-center px-8 py-3 min-h-[48px] rounded-full bg-white text-gray-900 font-semibold tracking-wider active:bg-white/90 transition-colors shadow-xl shadow-purple-500/20"
          >
            Sprawdź cenę
          </a>
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
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-purple-300/70 mb-3">
            Cennik
          </p>
          <h2 className="text-4xl md:text-5xl font-light tracking-widest glow-text mb-6">
            Sprawdź cenę{' '}
            <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              w 2 minuty
            </span>
          </h2>
          <p className="text-lg font-light tracking-wide text-gray-400 max-w-2xl mx-auto">
            Interaktywny konfigurator pokaże <span className="text-white">koszt i czas</span> realizacji.
          </p>
        </header>

        {/* CTA — bez calloutu */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <ContactScrollCta onClick={scrollToContact} />
          <a
            href="/cennik"
            className="inline-flex w-fit max-w-full shrink-0 items-center justify-center px-10 py-4 min-h-[52px] bg-white text-gray-900 rounded-full font-medium tracking-wider hover:bg-white/90 transition-all glow-box cursor-pointer"
          >
            Sprawdź cenę
          </a>
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

