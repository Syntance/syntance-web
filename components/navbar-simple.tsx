"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import SyntanceLogo from "@/components/syntance-logo";

export default function NavbarSimple() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-4 sm:py-6 sm:px-6 lg:px-12 bg-black/30 transition-all duration-300 safe-pt isolate">
      <div className="pointer-events-none absolute inset-0 -z-10 backdrop-blur-md" aria-hidden="true" />
      <div className="relative flex justify-between items-center">
        <Link
          href="/"
          className="text-white hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm"
          aria-label="Syntance — strona główna"
        >
          <SyntanceLogo priority className="h-10 sm:h-11" />
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

