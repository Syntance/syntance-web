"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Target, Users, Zap, MessageSquare, Brain, GitBranch, Sparkles, Gauge, Bot } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import TextType from "@/components/TextType";

const layers = [
  {
    level: 1,
    title: "Fundament",
    subtitle: "Strategia",
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
    title: "Mechanika",
    subtitle: "Konwersja",
    tagline: "To, co zmienia odwiedzającego w klienta.",
    gradient: "from-blue-500 to-cyan-500",
    textColor: "text-blue-400",
    items: [
      { icon: MessageSquare, label: "Copywriting", desc: "Tekst, który sprzedaje" },
      { icon: Brain, label: "Psychologia", desc: "Zaufanie i decyzja" },
      { icon: GitBranch, label: "User Flow", desc: "Ścieżka do kontaktu" },
    ],
  },
  {
    level: 3,
    title: "Efekt końcowy",
    subtitle: "Tech & Design",
    tagline: "To, co buduje zaufanie i zachwyt.",
    gradient: "from-cyan-500 to-teal-500",
    textColor: "text-cyan-400",
    items: [
      { icon: Sparkles, label: "Design premium", desc: "Estetyka profesjonalisty" },
      { icon: Gauge, label: "PageSpeed 90+", desc: "Błyskawiczne ładowanie" },
      { icon: Bot, label: "AI Ready", desc: "Widoczność w ChatGPT" },
    ],
  },
];

export default function AnatomyStudio() {
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const [typingComplete, setTypingComplete] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Callback when typing animation finishes
  const handleTypingComplete = useCallback(() => {
    setTypingComplete(true);
  }, []);

  // Observe scroll to reveal content
  useEffect(() => {
    if (!typingComplete) return;
    
    // Small delay then show content
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [typingComplete]);

  // Observe individual cards
  useEffect(() => {
    if (!showContent) return;
    
    const cards = document.querySelectorAll('.anatomy-card');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('card-visible');
          }
        });
      },
      { threshold: 0.2, rootMargin: '-50px' }
    );

    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, [showContent]);

  return (
    <section 
      id="anatomy-studio"
      ref={sectionRef}
      aria-labelledby="anatomy-heading"
      className="relative z-10"
    >
      {/* Intro Section - Sticky with TextType */}
      <div 
        ref={introRef}
        className="min-h-screen flex items-center justify-center px-6 lg:px-12 bg-black sticky top-0"
      >
        <div className="text-center max-w-4xl mx-auto">
          <h2 id="anatomy-heading" className="text-4xl md:text-5xl lg:text-6xl font-light tracking-widest glow-text">
            <TextType
              text="Większość agencji zaczyna od grafiki."
              typingSpeed={40}
              initialDelay={500}
              showCursor={true}
              cursorCharacter="_"
              cursorClassName="text-purple-400"
              loop={false}
              startOnVisible={true}
              onSentenceComplete={handleTypingComplete}
            />
          </h2>
          
          {/* Second line - appears after typing */}
          <div className={`mt-8 transition-all duration-1000 ${
            typingComplete 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}>
            <p className="text-2xl md:text-3xl lg:text-4xl font-light tracking-wide bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              My zaczynamy od biznesu.
            </p>
          </div>
          
          {/* Scroll indicator */}
          <div className={`mt-16 transition-all duration-1000 delay-500 ${
            typingComplete 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <span className="text-sm tracking-wider uppercase">Przewiń w dół</span>
              <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
                <div className="w-1.5 h-3 bg-gray-500 rounded-full mt-2 animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - Revealed on scroll */}
      <div 
        ref={contentRef}
        className={`relative bg-black transition-opacity duration-1000 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="py-32 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
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
                      style={{ transitionDelay: `${index * 150}ms` }}
                    >
                      {/* Timeline dot */}
                      <div className={`absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br ${layer.gradient} shadow-lg z-10`}>
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${layer.gradient} animate-ping opacity-30`} />
                      </div>

                      {/* Card */}
                      <div className={`ml-20 md:ml-0 md:w-[calc(50%-40px)] ${isLeft ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}`}>
                        <div className="group relative">
                          {/* Glow */}
                          <div className={`absolute -inset-0.5 bg-gradient-to-r ${layer.gradient} rounded-2xl transition-opacity duration-500 blur-sm ${
                            isMobile ? 'opacity-20' : 'opacity-0 group-hover:opacity-20'
                          }`} />
                          
                          {/* Content */}
                          <div className="relative bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
                            {/* Level badge */}
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${layer.gradient} bg-opacity-10 border border-white/10 mb-4`}>
                              <span className={`text-xs font-medium ${layer.textColor} tracking-wider uppercase`}>
                                Poziom {layer.level}
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
                            <p className="text-gray-500 italic mb-8">
                              {layer.tagline}
                            </p>

                            {/* Items - simplified */}
                            <div className="space-y-4">
                              {layer.items.map((item, i) => {
                                const Icon = item.icon;
                                return (
                                  <div key={i} className="flex items-center gap-4 group/item">
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${layer.gradient} bg-opacity-10 flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                                      isMobile ? '' : 'group-hover/item:scale-110'
                                    }`}>
                                      <Icon size={18} className={layer.textColor} />
                                    </div>
                                    <div>
                                      <span className="text-white font-medium">{item.label}</span>
                                      <span className="text-gray-500 ml-2">— {item.desc}</span>
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

            {/* Bottom Quote */}
            <div className="mt-32 text-center anatomy-card opacity-0 translate-y-12 transition-all duration-1000 ease-out" style={{ transitionDelay: '450ms' }}>
              <p className="text-xl md:text-2xl font-light text-gray-400">
                Efekt? <span className="text-white">Strona, która pracuje na Twój wynik.</span>
              </p>
            </div>
          </div>
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
