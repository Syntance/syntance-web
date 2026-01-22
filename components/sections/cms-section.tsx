'use client';

import { useEffect } from 'react';
import { Edit3, FileText, BookOpen, CheckCircle } from 'lucide-react';
import GradientText from '@/components/GradientText';
import { useIsMobile } from '@/hooks/useIsMobile';

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
      { threshold: 0.1, rootMargin: '50px' }
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
      className="relative z-10 py-24 px-6 lg:px-12"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header - spójny z resztą strony */}
        <header className="text-center mb-16">
          <h2 
            id="cms-heading" 
            className="text-4xl md:text-5xl font-light tracking-widest glow-text mb-6"
          >
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
                    className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl transition-opacity duration-500 blur-sm ${
                      isMobile ? 'opacity-30' : 'opacity-0 group-hover:opacity-40'
                    }`}
                  />
                  
                  {/* Card content */}
                  <div className={`relative h-full bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8 transition-all duration-500 ${
                    isMobile ? 'border-transparent' : 'group-hover:border-transparent'
                  }`}>
                    {/* Glow effect */}
                    <div 
                      className={`absolute inset-0 rounded-2xl transition-opacity duration-500 -z-10 ${
                        isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      style={{ boxShadow: `0 0 40px ${feature.glowColor}` }}
                    />

                    {/* Icon */}
                    <div className="mb-6">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 flex items-center justify-center transform transition-all duration-500 ${
                        isMobile ? 'scale-110 rotate-3' : 'group-hover:scale-110 group-hover:rotate-3'
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
                    <div className={`mt-6 h-0.5 bg-gradient-to-r ${feature.gradient} transition-all duration-700 ${
                      isMobile ? 'w-full opacity-30' : 'w-0 group-hover:w-full opacity-50'
                    }`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA - jak quote w tech-comparison */}
        <div className="relative max-w-3xl mx-auto cms-card opacity-0 translate-y-8 scale-95 transition-all duration-700 ease-out" style={{ transitionDelay: '300ms' }}>
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-2xl transition-opacity blur-lg ${
            isMobile ? 'opacity-30' : 'opacity-20 hover:opacity-30'
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
                  href="/cennik" 
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

      <style jsx>{`
        .cms-card.card-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      `}</style>
    </section>
  );
}
