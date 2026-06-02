"use client";

import { useEffect } from "react";
import AnimatedSection from "@/components/AnimatedSection";

export const websiteProblemCards = [
  {
    label: "Czym się zajmujesz",
    headline: "Po 5 sekundach klient nadal nie wie, co sprzedajesz i dla kogo.",
    consequence:
      'Hero pełen ogólników: „kompleksowe rozwiązania”, „indywidualne podejście”. Klient nie dopasowuje tego do swojego problemu, więc cofa się do Google i klika konkurenta.',
  },
  {
    label: "Lejek",
    headline: "Sekcje ułożone losowo, nie wzdłuż drogi zakupowej klienta.",
    consequence:
      '„O nas”, „Galeria”, „Zespół”, „Blog” w przypadkowej kolejności. Żadna nie odpowiada na pytanie, które klient zadaje na swoim etapie decyzji — scrolluje i wychodzi bez akcji.',
  },
  {
    label: "CTA",
    headline:
      'CTA nie prowadzi do żadnego założonego rezultatu — wszędzie tylko „Kontakt”.',
    consequence:
      "Brak jednej zaplanowanej akcji na danym etapie (pobierz / umów / zamów audyt). Klient gotowy do działania nie wie, co ma zrobić, więc nie robi nic.",
  },
  {
    label: "Performance",
    headline:
      "WordPress + 15 wtyczek: 4 s ładowania na telefonie, PageSpeed poniżej 40/100.",
    consequence:
      "Każda sekunda powyżej 1 s to ok. −17% konwersji i wyższy koszt leada w Google Ads. Klient z reklamy zamyka kartę, zanim doczyta hero.",
  },
  {
    label: "Spójność",
    headline: "Strona, oferta PDF i profil na LinkedIn mówią trzema różnymi głosami.",
    consequence:
      "Inny ton, inne UVP, inne kolory w każdym kanale. Klient czuje rozjazd, traci zaufanie i pyta znajomych o rekomendację zamiast wypełnić formularz.",
  },
] as const;

export const websiteProblemEffect =
  "Efekt: ruch jest, leadów nie ma. Marketing pyta sprzedaży gdzie konwersje, sprzedaż pyta marketingu gdzie ruch. Budżet reklamowy płaci za bounce.";

function ProblemIcon() {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 text-red-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M7 7l10 10M17 7L7 17" />
      </svg>
    </span>
  );
}

function ProblemCard({
  label,
  headline,
  consequence,
  className = "",
}: {
  label: string;
  headline: string;
  consequence: string;
  className?: string;
}) {
  return (
    <article
      className={`problem-card rounded-2xl border border-red-500/20 bg-red-500/5 p-6 transition-colors hover:border-red-500/35 ${className}`}
    >
      <div className="flex items-start gap-4">
        <ProblemIcon />
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-red-300/70">
            {label}
          </p>
          <p className="mb-3 text-base font-medium leading-snug text-white md:text-lg">
            {headline}
          </p>
          <p className="text-sm italic leading-relaxed text-gray-400 md:text-[15px]">
            {consequence}
          </p>
        </div>
      </div>
    </article>
  );
}

type WebsiteProblemsGridProps = {
  animate?: boolean;
};

export function WebsiteProblemsGrid({ animate = true }: WebsiteProblemsGridProps) {
  useEffect(() => {
    if (!animate) return;

    const cards = document.querySelectorAll(".problem-card-item");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("problem-card-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "-10% 0px -10% 0px" }
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [animate]);

  const cardVisibilityClass = animate
    ? "problem-card-item opacity-0 translate-y-6 transition-all duration-700 ease-out"
    : "";

  return (
    <div>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {websiteProblemCards.map((card, index) => (
          <li
            key={card.label}
            className={cardVisibilityClass}
            style={animate ? { transitionDelay: `${index * 80}ms` } : undefined}
          >
            <ProblemCard {...card} />
          </li>
        ))}
      </ul>

      {animate ? (
        <AnimatedSection delay={450} className="mt-8 md:mt-10">
          <EffectBar />
        </AnimatedSection>
      ) : (
        <div className="mt-8 md:mt-10">
          <EffectBar />
        </div>
      )}

      <style jsx>{`
        .problem-card-item.problem-card-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

export function EffectBar() {
  return (
    <aside className="rounded-2xl border border-red-500/25 bg-gradient-to-r from-red-500/10 via-red-500/5 to-orange-500/10 px-6 py-5 md:px-8 md:py-6">
      <blockquote className="text-base leading-relaxed text-gray-200 md:text-lg">
        <span className="font-medium text-white">Efekt:</span>{" "}
        {websiteProblemEffect.replace(/^Efekt:\s*/, "")}
      </blockquote>
    </aside>
  );
}
