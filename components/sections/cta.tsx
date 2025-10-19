import Container from "../container";

export default function CTA() {
  return (
    <section className="py-16">
      <Container>
        <div className="rounded-2xl bg-zinc-950 p-10 text-white">
          <h3 className="text-2xl font-semibold">
            Gotowi na inteligentne tworzenie?
          </h3>
          <p className="mt-2 text-zinc-300">
            Umów bezpłatną konsultację — zaproponujemy rozwiązanie w 24h.
          </p>
          <a
            href="/contact"
            className="mt-6 inline-block rounded-lg bg-white px-5 py-3 text-zinc-900"
          >
            Skontaktuj się
          </a>
        </div>
      </Container>
    </section>
  );
}

