"use client";

import { useEffect, useRef } from "react";
import { Zap, Target, Rocket, Lock } from "lucide-react";
import dynamic from "next/dynamic";
import { useIsMobile } from "@/hooks/useIsMobile";
import AnimatedSection from "@/components/AnimatedSection";

const TiltCard = dynamic(() => import("@/components/tilt-card"), {
  ssr: false,
});

const values = [
  {
    title: "Szybciej",
    description: "Strony w 2-4 tygodnie, sklepy w 4-6 tygodni",
    proof: "AI + architektura senior level",
    icon: Zap,
    gradient: "from-blue-400 to-cyan-400",
    glowColor: "rgba(56, 189, 248, 0.3)",
  },
  {
    title: "Strategicznie",
    description: "Strategia marketingu i sprzedaży przed kodem",
    proof: "Każda złotówka ma uzasadnienie",
    icon: Target,
    gradient: "from-pink-400 to-rose-400",
    glowColor: "rgba(244, 114, 182, 0.3)",
  },
  {
    title: "Wydajniej",
    description: "PageSpeed 90+ gwarantowany",
    proof: "Next.js, zero wtyczek",
    icon: Rocket,
    gradient: "from-purple-400 to-indigo-400",
    glowColor: "rgba(168, 85, 247, 0.3)",
  },
  {
    title: "Bez ograniczeń",
    description: "Pełna własność kodu",
    proof: "Możesz zmienić wykonawcę",
    icon: Lock,
    gradient: "from-amber-400 to-orange-400",
    glowColor: "rgba(251, 191, 36, 0.3)",
  },
];

export default function ValuesStudio() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const cards = document.querySelectorAll('.value-card-studio');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('card-visible');
            observer.unobserve(entry.target);
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
    <section id="values-studio" aria-labelledby="values-heading" className="relative z-10 py-20 md:py-32 px-5 md:px-6 lg:px-12 overflow-hidden">
      {/* ─────────────────────  MOBILE  ───────────────────── */}
      <div className="md:hidden max-w-md mx-auto">
        <header className="text-center mb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-purple-300/70 mb-3">
            Dlaczego my
          </p>
          <h2 id="values-heading" className="text-3xl font-light tracking-tight leading-[1.15] mb-3 text-white">
            Jakość agencji <span className="text-gray-400">w tempie</span> freelancera
          </h2>
        </header>

        <ul className="space-y-3">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <li
                key={index}
                className="value-card-studio opacity-0 translate-y-4 transition-all duration-500 ease-out"
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                <article className="flex items-start gap-4 bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                  <span className={`shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center`}>
                    <Icon className="text-white" size={20} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className={`text-base font-medium mb-1 bg-gradient-to-r ${value.gradient} bg-clip-text text-transparent`}>
                      {value.title}
                    </h3>
                    <p className="text-sm text-gray-300 leading-snug mb-1">
                      {value.description}
                    </p>
                    {value.proof && (
                      <p className="text-xs text-gray-500 leading-snug">
                        {value.proof}
                      </p>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ─────────────────────  DESKTOP  ───────────────────── */}
      <div className="hidden md:block max-w-6xl mx-auto">
        {/* Header */}
        <AnimatedSection>
          <header className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light tracking-widest glow-text mb-6">
              Dlaczego My?
            </h2>
            <p className="text-lg font-light tracking-wide text-gray-400">
              Jakość agencji w tempie freelancera
            </p>
          </header>
        </AnimatedSection>

        {/* Cards Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="value-card-studio opacity-0 translate-y-8 scale-95 transition-all duration-700 ease-out"
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <TiltCard className="h-full">
                  <div className="group relative h-full">
                    {/* Card background with gradient border */}
                    <div className="relative h-full">
                      {/* Animated gradient border */}
                      <div className={`absolute -inset-0.5 bg-gradient-to-r opacity-0 transition-opacity duration-500 rounded-2xl blur-sm ${
                        isMobile ? '' : 'group-hover:opacity-100'
                      }`}
                        style={{
                          backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                        }}
                      ></div>
                      
                      {/* Card content */}
                      <div className={`relative h-full product-card rounded-2xl p-10 transition-all duration-500 ${
                        isMobile ? '' : 'group-hover:border-transparent'
                      }`}>
                        {/* Glow effect on hover */}
                        <div 
                          className={`absolute inset-0 opacity-0 rounded-2xl transition-opacity duration-500 -z-10 ${
                            isMobile ? '' : 'group-hover:opacity-100'
                          }`}
                          style={{
                            boxShadow: `0 0 60px ${value.glowColor}`,
                          }}
                        ></div>

                        {/* Icon */}
                        <div className="mb-6 relative">
                          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center transform transition-all duration-500 ${
                            isMobile ? '' : 'group-hover:scale-110 group-hover:rotate-3'
                          }`}>
                            <Icon className="text-white" size={32} strokeWidth={1.5} />
                          </div>
                          {/* Floating particles on hover */}
                          <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gradient-to-br transition-opacity duration-500 ${
                            isMobile ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                          }`}
                            style={{
                              backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                            }}
                          ></div>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl md:text-2xl font-light leading-relaxed mb-3">
                          <span className={`bg-gradient-to-br ${value.gradient} bg-clip-text text-transparent transition-all duration-500 tracking-wide ${
                            isMobile ? '' : 'group-hover:tracking-wider'
                          }`}>
                            {value.title}
                          </span>
                        </h3>

                        {/* Description */}
                        <p className="text-gray-400 font-light text-sm tracking-wide leading-relaxed mb-3">
                          {value.description}
                        </p>

                        {/* Proof */}
                        {value.proof && (
                          <p className="text-gray-400 font-light text-xs tracking-wide leading-relaxed">
                            {value.proof}
                          </p>
                        )}

                        {/* Animated underline */}
                        <div className={`mt-6 h-0.5 w-0 bg-gradient-to-r transition-all duration-700 ${
                          isMobile ? '' : 'group-hover:w-full'
                        }`}
                          style={{
                            backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                          }}
                        ></div>

                        {/* Decorative corner elements */}
                        <div className={`absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 opacity-0 transition-opacity duration-500 ${
                          isMobile ? '' : 'group-hover:opacity-30'
                        }`}
                          style={{
                            borderImage: `linear-gradient(to bottom right, var(--tw-gradient-stops)) 1`,
                          }}
                        ></div>
                        <div className={`absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 opacity-0 transition-opacity duration-500 ${
                          isMobile ? '' : 'group-hover:opacity-30'
                        }`}
                          style={{
                            borderImage: `linear-gradient(to top left, var(--tw-gradient-stops)) 1`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </div>
            );
          })}
        </div>
      </div>
      {/* /Desktop */}

      <style jsx>{`
        .value-card-studio.card-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      `}</style>
    </section>
  );
}

