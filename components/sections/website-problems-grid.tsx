"use client";

import { useEffect } from "react";

export const websiteProblemCards = [
  {
    label: "Czym się zajmujesz",
    headline: "Po 5 sekundach klient nadal nie wie, co sprzedajesz i dla kogo.",
  },
  {
    label: "Lejek",
    headline: "Sekcje ułożone losowo, nie wzdłuż drogi zakupowej klienta.",
  },
  {
    label: "CTA",
    headline:
      'CTA nie prowadzi do żadnego założonego rezultatu — wszędzie tylko „Kontakt”.',
  },
  {
    label: "Performance",
    headline:
      "WordPress + 15 wtyczek: 4 s ładowania na telefonie, PageSpeed poniżej 40/100.",
  },
  {
    label: "Spójność",
    headline: "Strona, oferta PDF i profil na LinkedIn mówią trzema różnymi głosami.",
  },
] as const;

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
  className = "",
}: {
  label: string;
  headline: string;
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
          <p className="text-base font-medium leading-snug text-white md:text-lg">
            {headline}
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

      <style jsx>{`
        .problem-card-item.problem-card-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
