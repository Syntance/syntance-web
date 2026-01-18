import Container from "../container";

export default function HeroHome() {
  return (
    <section className="py-24">
      <Container>
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Syntance.{" "}
            <span className="text-brand">Inteligentne tworzenie.</span>
          </h1>
          <p className="mt-6 text-lg text-zinc-600">
            Inteligentne tworzenie — od szkicu AI do produkcji w dni.
          </p>
          <div className="mt-8 flex gap-3">
            <a
              href="/cennik"
              className="rounded-lg bg-brand px-5 py-3 text-white"
            >
              Sprawdź cenę
            </a>
            <a href="#contact" className="rounded-lg border px-5 py-3">
              Porozmawiajmy
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}

