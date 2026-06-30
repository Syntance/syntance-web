import Link from 'next/link'
import Container from "../container";

export default function Footer() {
  return (
    <footer className="border-t py-10 bg-black">
      <Container className="flex flex-col items-center gap-2 text-sm text-zinc-600 md:flex-row md:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">© {new Date().getFullYear()} Syntance</span>
        </div>
        <div className="flex gap-4">
          <Link href="/#o-nas" className="hover:text-white transition-colors">O nas</Link>
          <Link href="/polityka-prywatnosci" className="hover:text-white transition-colors">Polityka Prywatności</Link>
          <Link href="/regulamin" className="hover:text-white transition-colors">Regulamin</Link>
        </div>
      </Container>
    </footer>
  );
}

