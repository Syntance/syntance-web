"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

const projects = [
  {
    name: "Syntance AI Dashboard",
    type: "System",
    image: "/images/syntance-ai-dashboard-1440x900.avif",
    description: "Dashboard AI do zarządzania projektami",
  },
  {
    name: "Syntance Web Showcase",
    type: "Website",
    image: "/images/syntance-web-development-showcase-1280x720.webp",
    description: "Showcase technologii webowych",
  },
  {
    name: "Syntance Studio",
    type: "Website",
    image: "/images/syntance-studio-hero-1920x1080.webp",
    description: "Landing page dla Syntance Studio",
  },
  {
    name: "E-commerce Platform",
    type: "E-commerce",
    image: "/images/syntance-studio-hero-1920x1080.webp",
    description: "Nowoczesny sklep online",
  },
  {
    name: "Business Website",
    type: "Website",
    image: "/images/syntance-web-development-showcase-1280x720.webp",
    description: "Strona firmowa z animacjami",
  },
  {
    name: "Custom System",
    type: "System",
    image: "/images/syntance-ai-dashboard-1440x900.avif",
    description: "Dedykowany system CRM",
  },
];

export default function PortfolioStudio() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = document.querySelectorAll('.portfolio-card');
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
    <section id="portfolio-studio" className="relative z-10 py-32 px-6 lg:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-light tracking-widest glow-text mb-6">
            Nasze realizacje
          </h2>
          <p className="text-lg font-light tracking-wide text-gray-400">
            Strony i sklepy, które nie tylko wyglądają, ale działają.
          </p>
        </div>

        {/* Portfolio Grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div
              key={index}
              className="portfolio-card opacity-0 translate-y-8 transition-all duration-700 ease-out"
              style={{ 
                transitionDelay: `${index * 80}ms`,
              }}
            >
              <div className="group relative h-full overflow-hidden rounded-2xl product-card border border-gray-800 hover:border-gray-700 transition-all duration-500">
                {/* Image */}
                <div className="relative h-64 overflow-hidden bg-gray-900">
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Hover icon */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <ExternalLink size={18} className="text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium tracking-wide text-white">
                      {project.name}
                    </h3>
                    <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-gray-800">
                      {project.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 font-light">
                    {project.description}
                  </p>

                  {/* Gradient line */}
                  <div className="mt-4 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-700"></div>
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                  style={{
                    boxShadow: '0 0 40px rgba(168, 85, 247, 0.2)',
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button className="px-8 py-3 bg-white bg-opacity-5 border border-gray-700 text-white rounded-full font-medium tracking-wider hover:bg-opacity-10 transition-all glow-box cursor-pointer group">
            Zobacz więcej projektów
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .portfolio-card.card-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
}

