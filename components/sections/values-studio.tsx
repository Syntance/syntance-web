"use client";

import { useEffect } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import { TechStackBadgeList } from "@/components/sections/tech-stack-badge";
import type { StackBadgeRecord } from "@/lib/data/stack-badges";

const values = [
  {
    title: "Szybciej",
    description: "Strony w 2-4 tygodnie, sklepy w 4-8 tygodni",
    proof: "Sprawdzony proces i gotowe komponenty",
    accentColor: "text-cyan-400",
    lineColor: "from-cyan-400/80 to-cyan-400/0",
  },
  {
    title: "Bez ryzyka",
    description: "Stała cena ustalona jeszcze przed startem",
    proof: "Zaczynasz od 30% zadatku — resztę płacisz dopiero przy odbiorze",
    accentColor: "text-rose-400",
    lineColor: "from-rose-400/80 to-rose-400/0",
  },
  {
    title: "Wydajniej",
    description: "PageSpeed 90+ gwarantowany",
    proof: "Next.js, zero wtyczek",
    accentColor: "text-purple-400",
    lineColor: "from-purple-400/80 to-purple-400/0",
  },
  {
    title: "Pełna własność kodu",
    description: "Możesz zmienić wykonawcę",
    proof: "Możliwość utrzymania w ramach abonamentu",
    accentColor: "text-orange-400",
    lineColor: "from-orange-400/80 to-orange-400/0",
  },
] as const;

type ValuesStudioProps = {
  stackBadges: StackBadgeRecord[];
};

function TechStackBadges({
  badges,
  className = "",
}: {
  badges: StackBadgeRecord[];
  className?: string;
}) {
  const visibleBadges = badges
    .filter((badge) => badge.showInValues)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return <TechStackBadgeList badges={visibleBadges} className={className} />;
}

function ValuesGrid({ className = "" }: { className?: string }) {
  return (
    <ul
      className={`mx-auto grid max-w-5xl grid-cols-1 justify-items-center gap-x-12 gap-y-12 sm:grid-cols-2 sm:gap-x-16 sm:gap-y-16 md:gap-y-20 ${className}`}
      aria-label="Dlaczego warto wybrać Syntance"
    >
      {values.map((value, index) => (
        <li
          key={value.title}
          className="value-row-studio w-full max-w-sm opacity-0 sm:max-w-xs md:max-w-sm"
          style={{ transitionDelay: `${index * 100}ms` }}
        >
          <article className="text-center">
            <h3
              className={`mb-3 text-2xl font-light leading-tight antialiased md:mb-4 md:text-[1.75rem] md:leading-snug ${value.accentColor}`}
            >
              {value.title}
            </h3>

            <p className="mb-2 text-base leading-relaxed text-gray-100 antialiased md:text-lg md:leading-relaxed">
              {value.description}
            </p>

            {value.proof && (
              <p className="text-sm leading-relaxed text-gray-400 antialiased md:text-[15px]">
                {value.proof}
              </p>
            )}

            <span
              className={`value-accent-line mx-auto mt-5 block h-px w-0 bg-gradient-to-r transition-[width] duration-1000 ease-out md:mt-6 ${value.lineColor}`}
              aria-hidden="true"
            />
          </article>
        </li>
      ))}
    </ul>
  );
}

export default function ValuesStudio({ stackBadges }: ValuesStudioProps) {
  useEffect(() => {
    const rows = document.querySelectorAll(".value-row-studio");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("value-row-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "-10% 0px -10% 0px" },
    );

    rows.forEach((row) => observer.observe(row));

    return () => {
      rows.forEach((row) => observer.unobserve(row));
    };
  }, []);

  return (
    <section
      id="values-studio"
      aria-labelledby="values-heading"
      className="relative z-10 overflow-hidden px-5 py-20 md:px-6 md:py-28 lg:px-12 lg:py-32"
    >
      {/* ─────────────────────  MOBILE  ───────────────────── */}
      <div className="md:hidden">
        <header className="mx-auto mb-14 max-w-md text-center">
          <h2
            id="values-heading"
            className="glow-text mb-4 text-3xl font-light leading-[1.15] tracking-tight text-white"
          >
            Dlaczego My?
          </h2>
          <p className="text-base font-light leading-relaxed tracking-wide text-gray-300">
            Udowadniamy, że jakość można dostarczyć szybko i w uczciwej cenie.
          </p>
          <TechStackBadges badges={stackBadges} className="mt-6" />
        </header>

        <ValuesGrid />
      </div>

      {/* ─────────────────────  DESKTOP  ───────────────────── */}
      <div className="hidden md:block">
        <AnimatedSection>
          <header className="mx-auto mb-24 max-w-6xl text-center">
            <h2 className="glow-text mb-6 text-4xl font-light tracking-widest md:text-5xl">
              Dlaczego My?
            </h2>
            <p className="text-lg font-light tracking-wide text-gray-300">
              Udowadniamy, że jakość można dostarczyć szybko i w uczciwej cenie.
            </p>
            <TechStackBadges badges={stackBadges} className="mt-8" />
          </header>
        </AnimatedSection>

        <ValuesGrid />
      </div>

      <style jsx global>{`
        .value-row-studio {
          transform: translateY(1.25rem);
          transition:
            opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .value-row-studio.value-row-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .value-row-studio.value-row-visible .value-accent-line {
          width: 3.5rem;
        }

        @media (min-width: 768px) {
          .value-row-studio.value-row-visible .value-accent-line {
            width: 4.5rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .value-row-studio {
            opacity: 1;
            transform: none;
            transition: none;
          }

          .value-row-studio .value-accent-line {
            width: 3.5rem;
          }
        }
      `}</style>
    </section>
  );
}
