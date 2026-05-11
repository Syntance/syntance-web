'use client';

import { useEffect } from 'react';
import { Edit3, FileText, BookOpen, CheckCircle } from 'lucide-react';
import GradientText from '@/components/GradientText';
import { useIsMobile } from '@/hooks/useIsMobile';
import AnimatedSection from '@/components/AnimatedSection';

const features = [
  {
    icon: Edit3,
    title: 'Edycja tekstów i zdjęć',
    description: 'Zmiana treści, meta opisów i obrazów bez dotykania kodu.',
    gradient: 'from-purple-500 to-blue-500',
    glowColor: 'rgba(139, 92, 246, 0.3)',
  },
  {
    icon: FileText,
    title: 'Nowe podstrony i posty',
    description: 'Twórz nowe treści samodzielnie. Idealne dla bloga lub aktualności.',
    gradient: 'from-blue-500 to-cyan-500',
    glowColor: 'rgba(59, 130, 246, 0.3)',
  },
  {
    icon: BookOpen,
    title: 'Szkolenie + dokumentacja',
    description: 'Przeprowadzimy Cię przez obsługę panelu krok po kroku.',
    gradient: 'from-cyan-500 to-teal-500',
    glowColor: 'rgba(34, 211, 238, 0.3)',
  },
];

export default function CMSSection() {
  const isMobile = useIsMobile();

  useEffect(() => {
    const cards = document.querySelectorAll('.cms-card');
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
    <section
      id="cms-section"
      aria-labelledby="cms-heading"
      className="relative z-10 py-20 md:py-24 px-5 md:px-6 lg:px-12"
    >
      {/* ─────────────────────  MOBILE  ───────────────────── */}
      <div className="md:hidden max-w-md mx-auto">
        <header className="text-center mb-7">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-purple-300/70 mb-3">
            Panel CMS
          </p>
          <h2 id="cms-heading" className="text-3xl font-light tracking-tight leading-[1.15] text-white mb-3">
            Edytuj sam z <GradientText className="font-medium">Sanity</GradientText>
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Panel <span className="text-white">prosty jak Word</span>. Używają go Figma, Shopify i Sonos.
          </p>
        </header>

        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <li key={index} className="flex items-start gap-3.5 bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                <span className={`shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                  <Icon className="text-white" size={18} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-sm font-medium mb-1 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4 mb-4">
          <p className="text-sm text-gray-300 leading-relaxed mb-3">
            <CheckCircle size={14} className="inline-block text-purple-400 mr-1.5 -mt-0.5" aria-hidden="true" />
            <span className="text-white font-medium">Panel CMS to opcja w konfiguratorze.</span>
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Decydujesz, czy chcesz samodzielnie zarządzać treścią.
          </p>
        </div>

        <a
          href="/cennik?highlight=cms"
          className="flex items-center justify-center gap-2 w-full px-6 py-3.5 min-h-[48px] rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium tracking-wide active:opacity-90 transition-opacity"
        >
          Sprawdź cenę w konfiguratorze
          <span aria-hidden="true">→</span>
        </a>
      </div>

      {/* ─────────────────────  DESKTOP  ───────────────────── */}
      <div className="hidden md:block max-w-6xl mx-auto">
        {/* Header - spójny z resztą strony */}
        <AnimatedSection>
          <header className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light tracking-widest glow-text mb-6">
              Edytuj sam z <GradientText>Sanity CMS</GradientText>
            </h2>
            <p className="text-xl font-light tracking-wide text-gray-400 max-w-3xl mx-auto mb-4">
              Chcesz edytować treści bez programisty? Panel CMS — prosty jak Word.
            </p>
            
            {/* Info box - jak w tech-comparison */}
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 max-w-3xl mx-auto">
              <p className="text-gray-400 leading-relaxed">
                <span className="font-medium text-white">Sanity CMS</span> to nowoczesny panel administracyjny 
                używany przez <GradientText className="font-medium">Figma, Shopify i Sonos</GradientText>. 
                Szybki, intuicyjny i bezpieczny.
              </p>
            </div>
          </header>
        </AnimatedSection>

        {/* Features Grid - styl jak values-studio */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="cms-card opacity-0 translate-y-8 scale-95 transition-all duration-700 ease-out"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="group relative h-full">
                  {/* Animated gradient border */}
                  <div 
                    className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-0 transition-opacity duration-500 blur-sm ${
                      isMobile ? '' : 'group-hover:opacity-40'
                    }`}
                  />
                  
                  {/* Card content */}
                  <div className={`relative h-full bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8 transition-all duration-500 ${
                    isMobile ? '' : 'group-hover:border-transparent'
                  }`}>
                    {/* Glow effect */}
                    <div 
                      className={`absolute inset-0 opacity-0 rounded-2xl transition-opacity duration-500 -z-10 ${
                        isMobile ? '' : 'group-hover:opacity-100'
                      }`}
                      style={{ boxShadow: `0 0 40px ${feature.glowColor}` }}
                    />

                    {/* Icon */}
                    <div className="mb-6">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center transform transition-all duration-500 ${
                        isMobile ? '' : 'group-hover:scale-110 group-hover:rotate-3'
                      }`}>
                        <Icon className="text-white" size={28} strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-light tracking-wide mb-3">
                      <span className={`bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`}>
                        {feature.title}
                      </span>
                    </h3>

                    {/* Description */}
                    <p className="text-gray-400 font-light text-sm tracking-wide leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Animated underline */}
                    <div className={`mt-6 h-0.5 w-0 bg-gradient-to-r ${feature.gradient} opacity-50 transition-all duration-700 ${
                      isMobile ? '' : 'group-hover:w-full'
                    }`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA - jak quote w tech-comparison */}
        <div className="relative max-w-3xl mx-auto cms-card opacity-0 translate-y-8 scale-95 transition-all duration-700 ease-out" style={{ transitionDelay: '300ms' }}>
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-2xl opacity-20 transition-opacity blur-lg ${
            isMobile ? '' : 'hover:opacity-30'
          }`} />
          <div className="relative p-8 md:p-10 rounded-2xl bg-gray-900 border border-purple-500/30">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-purple-400" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <p className="text-lg text-gray-400 leading-relaxed mb-4">
                  <span className="font-medium text-white">Panel CMS to opcja w konfiguratorze.</span>{' '}
                  Decydujesz czy chcesz samodzielnie zarządzać treścią.
                </p>
                <a 
                  href="/cennik?highlight=cms" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 border border-purple-500/30 hover:border-purple-500/50 text-white rounded-lg transition-all group/btn"
                >
                  <span className="font-light tracking-wide">Sprawdź cenę w konfiguratorze</span>
                  <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Desktop */}

      <style jsx>{`
        .cms-card.card-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      `}</style>
    </section>
  );
}
