"use client";

import { useEffect, useState } from "react";

export default function AboutSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const element = document.getElementById('o-nas');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="o-nas" 
      className="relative z-10 py-32 px-6 lg:px-12"
    >
      <div className="max-w-4xl mx-auto">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl md:text-5xl font-light tracking-wider mb-12 text-center glow-text">
            Kim jesteśmy
          </h2>
          
          <div className="space-y-8 text-center">
            <p className="text-xl md:text-2xl font-light tracking-wide text-gray-200 leading-relaxed">
              Jesteśmy studiem technologicznym, <span className="text-white font-medium">najlepsza technologia jest niewidoczna</span> — działa płynnie, wygląda pięknie i nie przeszkadza.
            </p>
            
            <p className="text-lg font-light tracking-wide text-gray-400 leading-relaxed max-w-3xl mx-auto">
              Specjalizujemy się w Next.js, headless CMS i nowoczesnym e-commerce. Każdy projekt zaczynamy od strategii, nie od kodu. Efekt? Strony z PageSpeed 90+, które realizują cele biznesowe.
            </p>
            
            <div className="pt-8 flex flex-wrap justify-center gap-8 text-sm font-light tracking-wider text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                <span>Next.js & React</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span>Headless CMS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span>MedusaJS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <span>Vercel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
