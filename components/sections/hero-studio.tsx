import Container from "../container";

export default function HeroStudio() {
  return (
    <section className="py-20">
      <Container>
        <h1 className="text-4xl font-bold md:text-5xl">Syntance Studio</h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-600">
          Landing, który dowozi leady. Projektujemy i wdrażamy w 5–10 dni roboczych.
        </p>
      </Container>
    </section>
  );
}

