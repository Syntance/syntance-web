"use client";

import dynamic from "next/dynamic";
import VantaBackground from "@/components/vanta-background";
import NavbarStudio from "@/components/navbar-studio";
import { Twitter, Linkedin, Github } from "lucide-react";

// Import sections
const HeroStudio = dynamic(() => import("@/components/sections/hero-studio"));
const ValuesStudio = dynamic(() => import("@/components/sections/values-studio"));
const PortfolioStudio = dynamic(() => import("@/components/sections/portfolio-studio"));
const ProcessStudio = dynamic(() => import("@/components/sections/process-studio"));
const PricingStudioNew = dynamic(() => import("@/components/sections/pricing-studio-new"));

export default function StudioPage() {
  return (
    <div className="min-h-screen">
      <VantaBackground />
      <NavbarStudio />
      
      <HeroStudio />
      <ValuesStudio />
      <PortfolioStudio />
      <ProcessStudio />
      <PricingStudioNew />
      
      {/* Contact Section - Same as syntance.com */}
      <section id="contact" className="relative z-10 px-6 lg:px-12 py-32">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light tracking-wider mb-8 text-center glow-text">
            Porozmawiajmy
          </h2>
          <p className="text-xl text-gray-300 font-light tracking-wide text-center mb-16">
            Gotowi do stworzenia czegoś wyjątkowego?
          </p>
          
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-medium tracking-wider mb-4">Email</h3>
                <a href="mailto:kontakt@syntance.com" className="text-gray-300 hover:text-white transition-colors text-lg">
                  kontakt@syntance.com
                </a>
              </div>
              
              <div>
                <h3 className="text-xl font-medium tracking-wider mb-4">Telefon</h3>
                <a href="tel:+48662519544" className="text-gray-300 hover:text-white transition-colors text-lg">
                  +48 662 519 544
                </a>
              </div>
              
              <div>
                <h3 className="text-xl font-medium tracking-wider mb-4">Social Media</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter/X - Śledź nas na Twitter">
                    <Twitter size={24} />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn - Połącz się z nami na LinkedIn">
                    <Linkedin size={24} />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="GitHub - Zobacz nasze projekty na GitHub">
                    <Github size={24} />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Contact Form Placeholder */}
            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Imię i nazwisko"
                  className="w-full px-6 py-4 bg-white bg-opacity-5 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-6 py-4 bg-white bg-opacity-5 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
                />
              </div>
              <div>
                <textarea
                  placeholder="Wiadomość"
                  rows={5}
                  className="w-full px-6 py-4 bg-white bg-opacity-5 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors resize-none"
                ></textarea>
              </div>
              <button className="w-full px-8 py-4 bg-white text-gray-900 rounded-lg font-medium tracking-wider hover:bg-opacity-90 transition-all glow-box">
                Wyślij wiadomość
              </button>
            </div>
          </div>
          
          {/* Brand connection */}
          <div className="text-center pt-8 border-t border-gray-800">
            <p className="text-gray-400 font-light tracking-wide mb-4">
              Syntance Studio jest częścią marki Syntance — technologii, która zachwyca, nie przytłacza.
            </p>
            <a href="/" className="inline-flex items-center text-gray-300 hover:text-white transition-colors font-medium">
              Poznaj Syntance →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-900 pt-16 pb-12 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-medium tracking-widest glow-text mb-6 md:mb-0">
              Syntance Studio
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter/X">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="GitHub">
                <Github size={20} />
              </a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-900">
            <p className="text-center text-sm font-light tracking-wider text-gray-500">
              © Syntance Studio — Strony i sklepy, które działają.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

