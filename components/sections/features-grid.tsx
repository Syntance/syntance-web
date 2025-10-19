import Container from "../container";

const features = [
  { title: "Next.js 14", desc: "SSR/ISR, szybkość i SEO." },
  {
    title: "Deepsite v2",
    desc: "Generujemy sekcje i kod, skracając time-to-cash.",
  },
  { title: "Tailwind + shadcn", desc: "Spójny design system i komponenty." },
  {
    title: "Core Web Vitals",
    desc: "Lighthouse 90+ mobile jako standard.",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="py-16">
      <Container>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border p-6">
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-zinc-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

