"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function NavbarSimple() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-4 sm:py-6 sm:px-6 lg:px-12 backdrop-blur-md bg-black/30 transition-all duration-300 safe-pt">
      <div className="flex justify-between items-center">
        <Link
          href="/"
          className="text-xl sm:text-2xl font-medium tracking-widest glow-text hover:opacity-80 transition-opacity"
        >
          Syntance
        </Link>

        <div className="hidden md:flex items-center gap-8 mr-12">
          <Link
            href="/"
            className="text-sm font-light tracking-wider text-white hover:text-purple-300 transition-colors"
          >
            Strona główna
          </Link>
        </div>

        <button
          className="md:hidden tap-target text-white -mr-2 cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={mobileMenuOpen}
        >
          <Menu size={24} aria-hidden="true" />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-2">
          <Link
            href="/"
            className="block tap-target justify-start text-base font-light tracking-wider text-gray-300 hover:text-white active:text-purple-300 transition-colors py-3 border-b border-white/10"
            onClick={() => setMobileMenuOpen(false)}
          >
            Strona główna
          </Link>
        </div>
      )}
    </nav>
  );
}

