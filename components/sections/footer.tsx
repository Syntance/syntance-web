import Container from "../container";

export default function Footer() {
  return (
    <footer className="border-t py-10">
      <Container className="flex flex-col items-center gap-2 text-sm text-zinc-600 md:flex-row md:justify-between">
        <span>© {new Date().getFullYear()} Syntance</span>
        <div className="flex gap-4">
          <a href="/studio">Studio</a>
          <a href="/contact">Kontakt</a>
        </div>
      </Container>
    </footer>
  );
}

