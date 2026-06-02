"use client";

import { useEffect, useRef } from "react";
import { Target, Users, Zap, Workflow, Palette, PenTool, Code2, Shield, FolderGit2 } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import AnimatedSection from "@/components/AnimatedSection";

const layers = [
  {
    level: 1,
    title: "Fundament",
    subtitle: "Strategia marketingu i sprzedaży",
    tagline: "Bez tego strona jest tylko ładnym obrazkiem.",
    gradient: "from-purple-500 to-blue-500",
    textColor: "text-purple-400",
    items: [
      { icon: Target, label: "Cel Biznesowy", desc: "Co strona ma osiągnąć?" },
      { icon: Users, label: "Buyer Persony", desc: "Do kogo mówimy?" },
      { icon: Zap, label: "UVP", desc: "Dlaczego Ty, nie konkurencja?" },
    ],
  },
  {
    level: 2,
    title: "Projektowanie",
    subtitle: "Doświadczenie",
    tagline: "Każdy ekran, tekst i przycisk ma swoje zadanie.",
    gradient: "from-blue-500 to-cyan-500",
    textColor: "text-blue-400",
    items: [
      { icon: Workflow, label: "UX / User Flow", desc: "Ścieżka do konwersji" },
      { icon: Palette, label: "UI / Design", desc: "Estetyka dopasowana do branży" },
      { icon: PenTool, label: "Copywriting", desc: "Tekst, który prowadzi do działania" },
    ],
  },
  {
    level: 3,
    title: "Development",
    subtitle: "Technologia",
    tagline: "Szybka, bezpieczna, Twoja.",
    gradient: "from-cyan-500 to-teal-500",
    textColor: "text-cyan-400",
    items: [
      { icon: Code2, label: "Next.js / PageSpeed 90+", desc: "Błyskawiczne ładowanie" },
      { icon: Shield, label: "Bezpieczeństwo", desc: "Zero wtyczek, zero dziur" },
      { icon: FolderGit2, label: "Własność kodu", desc: "Twoje repo od dnia 1" },
    ],
  },
];

export default function AnatomyStudio() {
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const cards = document.querySelectorAll('.anatomy-card');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('card-visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '-20% 0px -20% 0px' }
    );

    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, []);

  return (
    <section
      id="anatomy-studio"
      ref={sectionRef}
      aria-labelledby="anatomy-heading"
      className="relative z-10 py-20 md:py-32 px-5 md:px-6 lg:px-12 overflow-hidden"
    >
      {/* ─────────────────────  MOBILE  ───────────────────── */}
      <div className="md:hidden max-w-md mx-auto">
        <AnimatedSection>
          <header className="text-center mb-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-purple-300/70 mb-3">
              Jak pracujemy
            </p>
            <h2 id="anatomy-heading" className="text-3xl font-light tracking-tight leading-[1.15] mb-3">
              <span className="text-gray-400">Większość zaczyna od grafiki.</span>
              <br />
              <span className="text-white">My — od biznesu.</span>
            </h2>
          </header>
        </AnimatedSection>

        {/* Mobile: 3 zwarte karty pełnoszerokie, bez timeline visual'u */}
        <ol className="space-y-4">
          {layers.map((layer, index) => (
            <li
              key={layer.level}
              className="anatomy-card opacity-0 translate-y-6 transition-all duration-700 ease-out"
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <article className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`shrink-0 w-9 h-9 rounded-full bg-gradient-to-br ${layer.gradient} flex items-center justify-center text-white text-sm font-semibold`}>
                    {layer.level}
                  </span>
                  <h3 className="text-base font-medium text-white">
                    <span className={`bg-gradient-to-r ${layer.gradient} bg-clip-text text-transparent`}>
                      {layer.title}
                    </span>
                    <span className="text-gray-400 text-sm font-light"> · {layer.subtitle}</span>
                  </h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-4 italic">
                  {layer.tagline}
                </p>
                <ul className="space-y-2">
                  {layer.items.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <Icon size={14} className={`mt-0.5 ${layer.textColor} shrink-0`} aria-hidden="true" />
                        <span>
                          <span className="text-white font-medium">{item.label}</span>
                          <span className="text-gray-400"> — {item.desc}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </article>
            </li>
          ))}
        </ol>

        <div className="mt-10 text-center anatomy-card opacity-0 translate-y-6 transition-all duration-700 ease-out">
          <p className="text-base text-gray-300 mb-5 leading-relaxed">
            Efekt? <span className="text-white font-medium">Strona, która pracuje na Twój wynik.</span>
          </p>
          <a
            href="/strategia-marketingu-i-sprzedazy"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 min-h-[48px] rounded-full bg-white/[0.04] border border-white/10 text-gray-200 text-sm font-medium tracking-wide active:bg-white/[0.08] transition-colors"
          >
            Strategia marketingu i sprzedaży
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      {/* ─────────────────────  DESKTOP  ───────────────────── */}
      <div className="hidden md:block max-w-4xl mx-auto">
        <AnimatedSection>
          <header className="text-center mb-32">
            <h2 className="text-4xl md:text-5xl font-light tracking-widest glow-text mb-6">
              Większość agencji zaczyna od grafiki.
            </h2>
            <p className="text-2xl md:text-3xl font-light tracking-wide text-gray-400">
              My zaczynamy od biznesu.
            </p>
          </header>
        </AnimatedSection>

        {/* Timeline with cards */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 via-blue-500 to-cyan-500 opacity-20" />

          {/* Cards */}
          <div className="space-y-24 md:space-y-32">
            {layers.map((layer, index) => {
              const isLeft = index % 2 === 0;
              
              return (
                <div 
                  key={layer.level}
                  className={`anatomy-card opacity-0 translate-y-12 transition-all duration-1000 ease-out relative`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br ${layer.gradient} shadow-lg z-10`} />

                  {/* Card */}
                  <div className={`ml-20 md:ml-0 md:w-[calc(50%-40px)] ${isLeft ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}`}>
                    <div className="group relative">
                      {/* Glow */}
                      <div className={`absolute -inset-0.5 bg-gradient-to-r ${layer.gradient} rounded-2xl opacity-0 transition-opacity duration-500 blur-sm ${
                        isMobile ? '' : 'group-hover:opacity-20'
                      }`} />
                      
                      {/* Content */}
                      <div className="relative bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
                        {/* Level badge */}
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${layer.gradient} border border-white/10 mb-4`}>
                          <span className="text-xs font-medium text-white tracking-wider uppercase">
                            Etap {layer.level}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl md:text-3xl font-light tracking-wide mb-2">
                          <span className={`bg-gradient-to-r ${layer.gradient} bg-clip-text text-transparent`}>
                            {layer.title}
                          </span>
                          <span className="text-gray-400"> — {layer.subtitle}</span>
                        </h3>

                        {/* Tagline */}
                        <p className="text-gray-400 italic mb-8">
                          {layer.tagline}
                        </p>

                        {/* Items - simplified */}
                        <div className="space-y-4">
                          {layer.items.map((item, i) => {
                            const Icon = item.icon;
                            return (
                              <div key={i} className="flex items-center gap-4 group/item">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${layer.gradient} flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                                  isMobile ? '' : 'group-hover/item:scale-110'
                                }`}>
                                  <Icon size={18} className="text-white" />
                                </div>
                                <div>
                                  <span className="text-white font-medium">{item.label}</span>
                                  <span className="text-gray-400 ml-2">— {item.desc}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Quote + CTA — desktop only */}
        <div className="mt-32 text-center anatomy-card opacity-0 translate-y-12 transition-all duration-1000 ease-out">
          <p className="text-xl md:text-2xl font-light text-gray-400 mb-8">
            Efekt? <span className="text-white">Strona, która pracuje na Twój wynik.</span>
          </p>

          <a
            href="/strategia-marketingu-i-sprzedazy"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
          >
            <span>Strategia marketingu i sprzedaży — więcej</span>
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>

      <style jsx>{`
        .anatomy-card.card-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
}
