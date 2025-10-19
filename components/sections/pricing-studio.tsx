import Container from "../container";

const tiers = [
  {
    name: "Starter",
    price: "1 800 zł",
    features: ["1–3 sekcje", "Formularz, SSL, RODO"],
  },
  {
    name: "Biznes",
    price: "3 000 zł",
    features: ["5–7 sekcji", "SEO basic, blog"],
  },
  {
    name: "Shop Lite",
    price: "6 500 zł",
    features: ["WooCommerce", "P24/Stripe, InPost"],
  },
];

export default function PricingStudio() {
  return (
    <section className="py-16">
      <Container>
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className="rounded-xl border p-6">
              <h3 className="text-xl font-semibold">{t.name}</h3>
              <div className="mt-2 text-2xl font-bold">{t.price}</div>
              <ul className="mt-4 space-y-2 text-zinc-600">
                {t.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

