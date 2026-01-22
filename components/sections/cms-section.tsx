'use client';

import { useEffect } from 'react';
import { Edit3, FileText, BookOpen, CheckCircle } from 'lucide-react';

export default function CMSSection() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('feature-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const features = document.querySelectorAll('.cms-feature');
    features.forEach((feature) => observer.observe(feature));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <Edit3 className="w-6 h-6" />,
      title: 'Edycja tekstów, zdjęć, meta opisów',
      description: 'Zmiana treści bez konieczności ingerencji w kod. Prosty edytor wizualny.'
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Dodawanie nowych podstron / postów',
      description: 'Twórz nowe treści samodzielnie. Idealne dla bloga lub aktualności.'
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Szkolenie + dokumentacja w pakiecie',
      description: 'Przeprowadzimy Cię krok po kroku przez obsługę panelu CMS.'
    }
  ];

  return (
    <section 
      id="cms-section" 
      aria-labelledby="cms-heading" 
      className="relative z-10 py-32 px-6 lg:px-12 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 
            id="cms-heading" 
            className="text-4xl md:text-5xl font-light tracking-widest glow-text mb-6"
          >
            Chcesz edytować treści bez programisty?
          </h2>
          <p className="text-xl md:text-2xl font-light tracking-wide text-gray-300 max-w-3xl mx-auto">
            Możesz zamówić opcjonalny panel CMS — prosty jak Word.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="cms-feature opacity-0 translate-y-8 transition-all duration-700 ease-out"
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="relative group h-full">
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity blur" />
                
                <div className="relative bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 h-full hover:border-purple-500/30 transition-all">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:text-purple-300 group-hover:bg-purple-500/20 transition-all">
                    {feature.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-medium tracking-wide mb-3 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Card */}
        <div className="relative group max-w-4xl mx-auto">
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity blur-xl" />
          
          <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 border border-purple-500/30 rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Left side - Icon */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-purple-400" />
                </div>
              </div>

              {/* Right side - Content */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-medium tracking-wide mb-3 text-white">
                  Opcjonalnie dołączasz panel CMS (Sanity)
                </h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Panel administracyjny to dodatkowa usługa dostępna w konfiguratorze cennika. 
                  Decydujesz, czy chcesz samodzielnie zarządzać treścią, czy wolisz powierzyć to nam.
                </p>
                <a 
                  href="/cennik" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 text-purple-300 hover:text-purple-200 rounded-lg transition-all group/btn"
                >
                  <span>Sprawdź cenę w konfiguratorze</span>
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
        .cms-feature.feature-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
}
