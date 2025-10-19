# 💡 Przykłady użycia - Syntance Web

Praktyczne przykłady rozbudowy projektu.

## 📄 Dodawanie nowej strony

### 1. Utwórz plik strony

```tsx
// app/(marketing)/o-nas/page.tsx
import Navbar from "@/components/navbar";
import Container from "@/components/container";
import Footer from "@/components/sections/footer";

export const metadata = {
  title: "O nas",
  description: "Poznaj zespół Syntance",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="py-20">
        <Container>
          <h1 className="text-4xl font-bold">O nas</h1>
          <p className="mt-4 text-lg text-zinc-600">
            Jesteśmy zespołem pasjonatów technologii...
          </p>
        </Container>
      </main>
      <Footer />
    </>
  );
}
```

### 2. Dodaj do nawigacji

```tsx
// components/navbar.tsx
<nav className="flex items-center gap-6 text-sm">
  <Link href="/studio">Studio</Link>
  <Link href="/o-nas">O nas</Link>  {/* NOWE */}
  <Link href="/contact">Kontakt</Link>
</nav>
```

### 3. Dodaj do sitemap

```tsx
// app/sitemap.ts
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://syntance.com";
  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/studio`, lastModified: new Date() },
    { url: `${base}/o-nas`, lastModified: new Date() },  // NOWE
    { url: `${base}/contact`, lastModified: new Date() },
  ];
}
```

## 🎨 Tworzenie nowej sekcji

### Sekcja z testimonials

```tsx
// components/sections/testimonials.tsx
import Container from "../container";

const testimonials = [
  {
    name: "Jan Kowalski",
    company: "TechCorp",
    text: "Syntance zrealizowało naszą stronę w rekordowym czasie!",
  },
  {
    name: "Anna Nowak",
    company: "ShopPro",
    text: "Profesjonalizm i jakość na najwyższym poziomie.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-zinc-50">
      <Container>
        <h2 className="text-3xl font-bold text-center">
          Co mówią nasi klienci
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-zinc-600">"{t.text}"</p>
              <div className="mt-4">
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-zinc-500">{t.company}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

### Użycie w stronie

```tsx
// app/page.tsx
import Testimonials from "@/components/sections/testimonials";

export default function Page() {
  return (
    <>
      <Navbar />
      <HeroHome />
      <FeaturesGrid />
      <Testimonials />  {/* NOWE */}
      <CTA />
      <Footer />
    </>
  );
}
```

## 🎭 Animacje z Framer Motion

### Animowana sekcja

```tsx
"use client";
import { motion } from "framer-motion";
import Container from "../container";

export default function AnimatedHero() {
  return (
    <section className="py-24">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold md:text-6xl">
            Witaj w <span className="text-brand">Syntance</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg text-zinc-600"
        >
          Inteligentne tworzenie dla nowoczesnego web.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex gap-3"
        >
          <a href="/studio" className="rounded-lg bg-brand px-5 py-3 text-white">
            Rozpocznij
          </a>
        </motion.div>
      </Container>
    </section>
  );
}
```

### Animowane karty (stagger)

```tsx
"use client";
import { motion } from "framer-motion";
import Container from "../container";

const features = [
  { title: "Szybkość", desc: "Błyskawiczne ładowanie" },
  { title: "SEO", desc: "Optymalizacja pod Google" },
  { title: "Design", desc: "Nowoczesny i responsywny" },
  { title: "Wsparcie", desc: "24/7 pomoc techniczna" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AnimatedFeatures() {
  return (
    <section className="py-16">
      <Container>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="rounded-xl border p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-zinc-600">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
```

## 🔘 Użycie shadcn/ui

### Formularz z walidacją (Zod)

```tsx
"use client";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(2, "Imię musi mieć min. 2 znaki"),
  email: z.string().email("Nieprawidłowy email"),
  message: z.string().min(10, "Wiadomość musi mieć min. 10 znaków"),
});

export default function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    };

    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Wyślij formularz
    console.log("Wysyłam:", data);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Imię i nazwisko</Label>
        <Input id="name" name="name" placeholder="Jan Kowalski" />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="jan@example.com" />
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
      </div>

      <div>
        <Label htmlFor="message">Wiadomość</Label>
        <Textarea id="message" name="message" placeholder="Twoja wiadomość..." />
        {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
      </div>

      <Button type="submit">Wyślij</Button>
    </form>
  );
}
```

### Dialog z ofertą

```tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function OfferDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Zobacz ofertę</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nasza oferta</DialogTitle>
          <DialogDescription>
            Wybierz pakiet dopasowany do Twoich potrzeb
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Starter</h3>
            <p className="text-2xl font-bold">1 800 zł</p>
            <ul className="mt-2 space-y-1 text-sm text-zinc-600">
              <li>• 1-3 sekcje</li>
              <li>• Formularz kontaktowy</li>
              <li>• SSL + RODO</li>
            </ul>
            <Button className="mt-4 w-full">Wybierz</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## 🎯 Server Actions (Next.js 14)

### Formularz z Server Action

```tsx
// app/actions.ts
"use server";

export async function submitContact(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  // Walidacja
  if (!name || !email || !message) {
    return { success: false, error: "Wszystkie pola są wymagane" };
  }

  // Tutaj: zapis do bazy, wysłanie emaila, etc.
  console.log("Otrzymano:", { name, email, message });

  return { success: true };
}
```

```tsx
// app/(marketing)/contact/page.tsx
import { submitContact } from "@/app/actions";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <form action={submitContact} className="space-y-4">
      <input name="name" placeholder="Imię" className="..." />
      <input name="email" type="email" placeholder="Email" className="..." />
      <textarea name="message" placeholder="Wiadomość" className="..." />
      <Button type="submit">Wyślij</Button>
    </form>
  );
}
```

## 🖼️ Optymalizacja obrazów

### Next.js Image

```tsx
import Image from "next/image";
import Container from "../container";

export default function TeamSection() {
  return (
    <section className="py-16">
      <Container>
        <h2 className="text-3xl font-bold">Nasz zespół</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="text-center">
            <Image
              src="/team/jan.jpg"
              alt="Jan Kowalski"
              width={200}
              height={200}
              className="mx-auto rounded-full"
            />
            <h3 className="mt-4 font-semibold">Jan Kowalski</h3>
            <p className="text-sm text-zinc-600">CEO & Founder</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
```

## 🌐 Integracja z Deepsite v2

### Wklejanie wygenerowanej sekcji

1. Wygeneruj sekcję w Deepsite v2
2. Skopiuj kod
3. Utwórz nowy plik:

```tsx
// components/sections/deepsite-hero.tsx
// [WKLEJ KOD Z DEEPSITE V2]

import Container from "../container";

export default function DeepsiteHero() {
  // Kod wygenerowany przez Deepsite v2
  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Container>
        {/* Zawartość z Deepsite */}
      </Container>
    </section>
  );
}
```

4. Dodaj do strony:

```tsx
import DeepsiteHero from "@/components/sections/deepsite-hero";

export default function Page() {
  return (
    <>
      <Navbar />
      <DeepsiteHero />
      <Footer />
    </>
  );
}
```

## 📊 Analytics i tracking

### Custom event tracking

```tsx
"use client";
import { track } from "@vercel/analytics";

export default function CTAButton() {
  const handleClick = () => {
    track("cta_clicked", { location: "homepage" });
  };

  return (
    <button onClick={handleClick} className="...">
      Rozpocznij projekt
    </button>
  );
}
```

## 🎨 Custom komponenty UI

### Badge component

```tsx
// components/ui/badge.tsx
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        {
          "bg-zinc-100 text-zinc-800": variant === "default",
          "bg-green-100 text-green-800": variant === "success",
          "bg-yellow-100 text-yellow-800": variant === "warning",
        }
      )}
    >
      {children}
    </span>
  );
}
```

### Użycie

```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="success">Nowe</Badge>
<Badge variant="warning">Popularne</Badge>
```

## 🔗 Przydatne wzorce

### Loading state

```tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SubmitButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? "Wysyłanie..." : "Wyślij"}
    </Button>
  );
}
```

### Error boundary

```tsx
// app/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Coś poszło nie tak!</h2>
        <p className="mt-2 text-zinc-600">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 rounded-lg bg-brand px-4 py-2 text-white"
        >
          Spróbuj ponownie
        </button>
      </div>
    </div>
  );
}
```

---

**Więcej przykładów:** Zobacz oficjalną dokumentację [Next.js](https://nextjs.org/docs) i [shadcn/ui](https://ui.shadcn.com/)

