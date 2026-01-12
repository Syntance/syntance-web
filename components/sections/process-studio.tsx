"use client";

import { useEffect, useRef } from "react";
import { Search, Palette, Code, HeartHandshake } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Poznajemy Twój biznes",
    description: "Zanim napiszemy linijkę kodu, rozumiemy cel, klienta i rynek.",
    icon: Search,
    gradient: "from-blue-400 to-cyan-400",
  },
  {
    number: "02",
    title: "Projektujemy doświadczenie",
    description: "Tworzymy wireframes i prototypy. Design to nie tylko wygląd - to przemyślana ścieżka użytkownika.",
    icon: Palette,
    gradient: "from-purple-400 to-pink-400",
  },
  {
    number: "03",
    title: "Budujemy i wdrażamy",
    description: "Kod, testy, optymalizacja. Rozwijamy projekt z dbałością o każdy detal i wydajność.",
    icon: Code,
    gradient: "from-amber-400 to-orange-400",
  },
  {
    number: "04",
    title: "Opiekujemy się stroną",
    description: "Nie znikamy po wdrożeniu. Wspieramy, aktualizujemy i rozwijamy Twój projekt.",
    note: "30 dni gwarancji + opcja opieki w ramach abonamentu",
    icon: HeartHandshake,
    gradient: "from-pink-400 to-rose-400",
  },
];

export default function ProcessStudio() {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const steps = document.querySelectorAll('.process-step');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('step-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '50px' }
    );

    steps.forEach((step) => observer.observe(step));

    return () => {
      steps.forEach((step) => observer.unobserve(step));
    };
  }, []);

  return (
    <section id="process-studio" className="relative z-10 py-32 px-6 lg:px-12 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-light tracking-widest glow-text mb-6">
            Jak pracujemy
          </h2>
          <p className="text-lg font-light tracking-wide text-gray-400">
            Proces, który łączy design ze strategią
          </p>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Connecting Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 opacity-20"></div>

          {/* Steps */}
          <div className="space-y-16">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="process-step opacity-0 translate-x-8 transition-all duration-700 ease-out relative"
                  style={{ 
                    transitionDelay: `${index * 150}ms`,
                  }}
                >
                  <div className="flex items-start gap-6">
                    {/* Icon Circle */}
                    <div className="relative flex-shrink-0">
                      {/* Glow */}
                      <div 
                        className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.gradient} blur-xl opacity-30`}
                      ></div>
                      {/* Icon container */}
                      <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${step.gradient} bg-opacity-10 border-2 border-white/10 flex items-center justify-center backdrop-blur-sm`}>
                        <Icon className="text-white" size={24} strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-sm font-mono font-medium bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent`}>
                          {step.number}
                        </span>
                        <div className={`h-px flex-1 bg-gradient-to-r ${step.gradient} opacity-20`}></div>
                      </div>
                      
                      <h3 className="text-2xl font-light tracking-wide mb-2 glow-text">
                        {step.title}
                      </h3>
                      
                      {step.subtitle && (
                        <p className="text-sm text-gray-500 font-light italic mb-3">
                          {step.subtitle}
                        </p>
                      )}
                      
                      <p className="text-gray-400 font-light tracking-wide leading-relaxed">
                        {step.description}
                      </p>
                      
                      {step.note && (
                        <p className="text-sm text-gray-500 font-light italic mt-2">
                          ({step.note})
                        </p>
                      )}

                      {/* Decorative element */}
                      <div className="mt-4 inline-flex items-center gap-2 text-sm text-gray-500">
                        <div className={`w-8 h-0.5 bg-gradient-to-r ${step.gradient}`}></div>
                        <span className="font-light">Krok {index + 1} z 4</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .process-step.step-visible {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>
    </section>
  );
}

