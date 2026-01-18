"use client";
import Link from "next/link";
import Container from "./container";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b bg-white/70 backdrop-blur">
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold">
          Syntance
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/#o-nas">O nas</Link>
          <Link href="/cennik">Cennik</Link>
          <Link
            href="#contact"
            className="rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand/90 transition-colors"
          >
            Wyceń projekt
          </Link>
        </nav>
      </Container>
    </header>
  );
}

