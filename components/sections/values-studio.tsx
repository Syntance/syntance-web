"use client";

import { useEffect, useRef } from "react";
import { Heart, Sparkles } from "lucide-react";
import TiltCard from "@/components/tilt-card";
import LotusIcon from "@/components/icons/lotus-icon";
import DiamondIcon from "@/components/icons/diamond-icon";
import dynamic from "next/dynamic";

const TiltCardLazy = dynamic(() => import("@/components/tilt-card"), {
  ssr: false,
  loading: () => <div className="opacity-50" />,
});

const values = [
  {
    title: "Harmonia w każdym detalu",
    description: "Każdy pixel ma znaczenie. Tworzymy interfejsy, które oddychają i harmonizują.",
    icon: LotusIcon,
    gradient: "from-blue-400 to-cyan-400",
    glowColor: "rgba(56, 189, 248, 0.3)",
  },
  {
    title: "Design tworzony z serca",
    description: "Projektowanie to nie tylko technika. To emocja i przekaz wplecionе w każdą linię.",
    icon: Heart,
    gradient: "from-pink-400 to-rose-400",
    glowColor: "rgba(244, 114, 182, 0.3)",
  },
  {
    title: "Technologia w służbie estetyki",
    description: "Kod i design nie walczą - współpracują. Elegancja spotyka wydajność.",
    icon: DiamondIcon,
    gradient: "from-purple-400 to-indigo-400",
    glowColor: "rgba(168, 85, 247, 0.3)",
  },
  {
    title: "Spokój zamiast chaosu",
    description: "Strony, które nie przytłaczają. Przestrzeń, jasność i intuicyjna nawigacja.",
    icon: Sparkles,
    gradient: "from-amber-400 to-orange-400",
    glowColor: "rgba(251, 191, 36, 0.3)",
  },
];

export default function ValuesStudio() {
  const cardsRef = useRef<HTMLDivElement>(null);

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
      { threshold: 0.1, rootMargin: '50px' }
    );

    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, []);

  return (
    <section id="values-studio" className="relative z-10 py-32 px-6 lg:px-12 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-light tracking-widest glow-text mb-6">
            Nasze podejście do projektowania
          </h2>
          <p className="text-lg font-light tracking-wide text-gray-400">
            Design tworzony z serca. Technologia w służbie estetyki.
          </p>
        </div>

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
                <TiltCardLazy className="h-full">
                  <div className="group relative h-full">
                    {/* Card background with gradient border */}
                    <div className="relative h-full">
                      {/* Animated gradient border */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-sm"
                        style={{
                          backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                        }}
                      ></div>
                      
                      {/* Card content */}
                      <div className="relative h-full product-card rounded-2xl p-10 transition-all duration-500 group-hover:border-transparent">
                        {/* Glow effect on hover */}
                        <div 
                          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                          style={{
                            boxShadow: `0 0 60px ${value.glowColor}`,
                          }}
                        ></div>

                        {/* Icon */}
                        <div className="mb-6 relative">
                          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${value.gradient} bg-opacity-10 flex items-center justify-center transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                            <Icon className="text-white" size={32} strokeWidth={1.5} />
                          </div>
                          {/* Floating particles on hover */}
                          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gradient-to-br opacity-0 group-hover:opacity-100 group-hover:animate-ping"
                            style={{
                              backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                            }}
                          ></div>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl md:text-2xl font-light tracking-wide leading-relaxed mb-3">
                          <span className={`bg-gradient-to-br ${value.gradient} bg-clip-text text-transparent transition-all duration-500 group-hover:tracking-wider`}>
                            {value.title}
                          </span>
                        </h3>

                        {/* Description */}
                        <p className="text-gray-400 font-light text-sm tracking-wide leading-relaxed">
                          {value.description}
                        </p>

                        {/* Animated underline */}
                        <div className="mt-6 h-0.5 w-0 group-hover:w-full bg-gradient-to-r transition-all duration-700"
                          style={{
                            backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                          }}
                        ></div>

                        {/* Decorative corner elements */}
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                          style={{
                            borderImage: `linear-gradient(to bottom right, var(--tw-gradient-stops)) 1`,
                          }}
                        ></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                          style={{
                            borderImage: `linear-gradient(to top left, var(--tw-gradient-stops)) 1`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </TiltCardLazy>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .value-card-studio.card-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      `}</style>
    </section>
  );
}

