"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import GooeyNav from "@/components/ui/gooey-nav";

export default function NavbarNew() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  const navItems = [
    { label: "Wizja", href: "#hero" },
    { label: "Filozofia", href: "#manifest" },
    { label: "Produkty", href: "#products" },
    { label: "Studia Przypadków", href: "#cases" },
    { label: "Kontakt", href: "/contact" },
  ];

  const sectionIds = ['hero', 'manifest', 'products', 'cases', 'contact'];

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const index = sectionIds.indexOf(sectionId);
          if (index !== -1) {
            setActiveSection(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sectionIds.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-6 px-6 lg:px-12 backdrop-blur-md bg-black/30 transition-all duration-300">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-2xl font-medium tracking-widest glow-text">
          Syntance
        </Link>
        
        <div className="hidden md:flex">
          <GooeyNav 
            items={navItems}
            particleCount={15}
            particleDistances={[90, 10]}
            particleR={100}
            initialActiveIndex={0}
            externalActiveIndex={activeSection}
            animationTime={600}
            timeVariance={300}
            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
          />
        </div>
        
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-6 space-y-4">
          <a 
            href="#hero" 
            className="block text-sm font-light tracking-wider hover:text-purple-300 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Wizja
          </a>
          <a 
            href="#manifest" 
            className="block text-sm font-light tracking-wider hover:text-purple-300 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Filozofia
          </a>
          <a 
            href="#products" 
            className="block text-sm font-light tracking-wider hover:text-purple-300 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Produkty
          </a>
          <a 
            href="#cases" 
            className="block text-sm font-light tracking-wider hover:text-purple-300 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Studia Przypadków
          </a>
          <Link 
            href="/contact" 
            className="block text-sm font-light tracking-wider hover:text-purple-300 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Kontakt
          </Link>
        </div>
      )}
    </nav>
  );
}

