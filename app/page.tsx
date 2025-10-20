"use client";

import VantaBackground from "@/components/vanta-background";
import NavbarNew from "@/components/navbar-new";
import InteractiveFluidBox from "@/components/interactive-fluid-box";
import WhySyntance from "@/components/sections/why-syntance";
import TiltCard from "@/components/tilt-card";
import { Wind, Layers, Globe, Twitter, Linkedin, Github } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    // Manifest animation on scroll
    const manifestLines = document.querySelectorAll('.manifest-line');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    manifestLines.forEach(line => observer.observe(line));

    return () => {
      manifestLines.forEach(line => observer.unobserve(line));
    };
  }, []);

  return (
    <div className="min-h-screen">
      <VantaBackground />

      <NavbarNew />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 lg:px-12 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-light tracking-widest leading-tight mb-6 glow-text">
            Technologia która{" "}
            <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
              zachwyca
            </span>
            ,<br />
            nie przytłacza.
          </h1>
          <p className="text-lg md:text-xl font-light tracking-wider text-gray-300 mb-12">
            Piękno. Inteligencja. Płynność.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-3 bg-white text-gray-900 rounded-full font-medium tracking-wider hover:bg-opacity-90 transition-all glow-box">
              Rozpocznij
            </button>
            <button className="px-8 py-3 border border-purple-300 text-purple-300 rounded-full font-medium tracking-wider hover:bg-purple-900 hover:bg-opacity-20 transition-all">
              Demo
            </button>
          </div>
        </div>
      </section>

      {/* Manifest Section */}
      <section id="manifest" className="relative z-10 py-20 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="opacity-0 transform translate-y-10 transition-all duration-500 ease-out manifest-line">
            <p className="text-2xl md:text-3xl font-light tracking-wide leading-relaxed glow-text">
              Tworzymy technologię, która inspiruje i uspokaja.
            </p>
          </div>
          <div className="opacity-0 transform translate-y-10 transition-all duration-500 ease-out delay-200 manifest-line">
            <p className="text-2xl md:text-3xl font-light tracking-wide leading-relaxed glow-text">
              Działamy w tle, zapewniając czyste i piękne doświadczenia.
            </p>
          </div>
          <div className="opacity-0 transform translate-y-10 transition-all duration-500 ease-out delay-400 manifest-line">
            <p className="text-2xl md:text-3xl font-light tracking-wide leading-relaxed glow-text">
              Inteligencja, która nie krzyczy, ale świeci.
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="relative z-10 py-32 px-6 lg:px-12 overflow-hidden">
        <h2 className="text-3xl md:text-4xl font-light tracking-wider text-center mb-16 glow-text">
          Nasze Systemy
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Product 1 */}
          <TiltCard>
            <div className="product-card rounded-xl p-8">
              <div className="w-16 h-16 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center mb-6">
                <Wind className="text-blue-300" size={32} />
              </div>
              <h3 className="text-xl font-medium tracking-wider mb-3">OZE Asystent</h3>
              <p className="text-gray-300 font-light tracking-wide mb-6">
                Inteligentny system do automatyzacji i optymalizacji procesów w branży OZE.
              </p>
              <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mb-6"></div>
              <button className="text-sm font-medium tracking-wider text-blue-300 hover:text-blue-200 transition-colors">
                Learn More →
              </button>
            </div>
          </TiltCard>

          {/* Product 2 */}
          <TiltCard>
            <div className="product-card rounded-xl p-8">
              <div className="w-16 h-16 rounded-full bg-purple-500 bg-opacity-20 flex items-center justify-center mb-6">
                <Layers className="text-purple-300" size={32} />
              </div>
              <h3 className="text-xl font-medium tracking-wider mb-3">FlowCRM</h3>
              <p className="text-gray-300 font-light tracking-wide mb-6">
                Seamless customer relationship orchestration
              </p>
              <div className="h-1 w-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full mb-6"></div>
              <button className="text-sm font-medium tracking-wider text-purple-300 hover:text-purple-200 transition-colors">
                Learn More →
              </button>
            </div>
          </TiltCard>

          {/* Product 3 */}
          <TiltCard>
            <div className="product-card rounded-xl p-8">
              <div className="w-16 h-16 rounded-full bg-teal-500 bg-opacity-20 flex items-center justify-center mb-6">
                <Globe className="text-teal-300" size={32} />
              </div>
              <h3 className="text-xl font-medium tracking-wider mb-3">Syntance Web</h3>
              <p className="text-gray-300 font-light tracking-wide mb-6">
                Intelligent web presence infrastructure
              </p>
              <div className="h-1 w-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full mb-6"></div>
              <button className="text-sm font-medium tracking-wider text-teal-300 hover:text-teal-200 transition-colors">
                Learn More →
              </button>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* Experience Section - Interactive Light */}
      <section className="relative z-10 py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative inline-block mb-16">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 blur-2xl opacity-30 animate-pulse"></div>
            <h2 className="relative text-3xl md:text-5xl font-light tracking-widest glow-text">
              Zobacz spokój w akcji
            </h2>
          </div>
          <p className="text-lg font-light tracking-wide text-gray-300 max-w-2xl mx-auto mb-12">
            Porusz myszką, i poczuj Flow
          </p>
          <InteractiveFluidBox />
        </div>
      </section>

      {/* Why Syntance Section */}
      <WhySyntance />

      {/* Case Studies */}
      <section id="cases" className="relative z-10 py-32 px-6 lg:px-12">
        <h2 className="text-3xl md:text-4xl font-light tracking-wider text-center mb-16 glow-text">
          Transformacje
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Case 1 */}
          <div className="group relative overflow-hidden rounded-2xl h-96">
            <Image
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop"
              alt="Case Study"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
            <div className="absolute bottom-0 left-0 p-8">
              <h3 className="text-2xl font-medium tracking-wider mb-2">Nexus Financial</h3>
              <p className="text-gray-300 font-light tracking-wide">450% ROI in first year</p>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="px-6 py-2 bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm border border-white border-opacity-20 rounded-full text-white font-medium tracking-wider hover:bg-opacity-20 transition-all">
                Zobacz
              </button>
            </div>
          </div>

          {/* Case 2 */}
          <div className="group relative overflow-hidden rounded-2xl h-96">
            <Image
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=630&fit=crop"
              alt="Case Study"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
            <div className="absolute bottom-0 left-0 p-8">
              <h3 className="text-2xl font-medium tracking-wider mb-2">Aurora Health</h3>
              <p className="text-gray-300 font-light tracking-wide">80% process automation</p>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="px-6 py-2 bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm border border-white border-opacity-20 rounded-full text-white font-medium tracking-wider hover:bg-opacity-20 transition-all">
                View Case
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-900 pt-16 pb-12 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-medium tracking-widest glow-text mb-6 md:mb-0">
              Syntance
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-900">
            <p className="text-center text-sm font-light tracking-wider text-gray-500">
              © Syntance Technologies — Inteligentne rozwiązania dla nowoczesnych marek.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
