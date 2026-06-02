"use client";

import AnimatedSection from "@/components/AnimatedSection";
import { WebsiteProblemsGrid } from "@/components/sections/website-problems-grid";

export default function AnatomyStudio() {
  return (
    <section
      id="anatomy-studio"
      aria-labelledby="anatomy-heading"
      className="relative z-10 overflow-hidden px-5 py-20 md:px-6 md:py-32 lg:px-12"
    >
      <div className="mx-auto max-w-5xl">
        <AnimatedSection>
          <header className="mb-10 text-center md:mb-16">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-red-300/70 md:hidden">
              Problem
            </p>
            <h2
              id="anatomy-heading"
              className="mb-4 text-3xl font-light leading-[1.15] tracking-tight md:text-5xl md:tracking-wide md:glow-text"
            >
              <span className="text-gray-400 md:block">Większość stron wygląda dobrze.</span>{" "}
              <span className="text-red-400">Nie sprzedaje.</span>
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-400 md:text-xl">
              Pięć sygnałów, że strona blokuje leady — zanim klient w ogóle dojdzie do formularza.
            </p>
          </header>
        </AnimatedSection>

        <WebsiteProblemsGrid />
      </div>
    </section>
  );
}
