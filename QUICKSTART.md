# 🚀 Quick Start - Syntance Web

Szybki start dla projektu Syntance Web.

## 📋 Wymagania

- Node.js 18+ 
- pnpm (zalecane) lub npm
- Git

## ⚡ Instalacja (5 minut)

### 1. Sklonuj repozytorium

```bash
git clone https://github.com/Syntance/syntance-web.git
cd syntance-web
```

### 2. Zainstaluj zależności

```bash
pnpm install
```

### 3. Skonfiguruj shadcn/ui

```bash
npx shadcn-ui@latest init --yes
npx shadcn-ui@latest add button card input textarea navigation-menu
```

### 4. Utwórz plik środowiskowy

```bash
cp .env.example .env.local
```

Edytuj `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Uruchom serwer deweloperski

```bash
pnpm dev
```

Otwórz http://localhost:3000 🎉

## 📁 Struktura projektu

```
syntance-web/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Strona główna (/)
│   ├── (marketing)/
│   │   ├── studio/        # /studio
│   │   └── contact/       # /contact
│   ├── layout.tsx         # Layout główny
│   ├── globals.css        # Style globalne
│   ├── sitemap.ts         # SEO: sitemap
│   └── robots.ts          # SEO: robots.txt
├── components/
│   ├── navbar.tsx         # Nawigacja
│   ├── container.tsx      # Wrapper kontener
│   ├── sections/          # Sekcje strony
│   │   ├── hero-home.tsx
│   │   ├── hero-studio.tsx
│   │   ├── features-grid.tsx
│   │   ├── pricing-studio.tsx
│   │   ├── cta.tsx
│   │   └── footer.tsx
│   └── ui/                # shadcn/ui komponenty
├── lib/
│   ├── utils.ts           # Utility functions (cn)
│   └── seo.ts             # SEO helpers
└── public/                # Statyczne pliki
```

## 🎯 Główne funkcje

### Routing

- `/` - Strona główna
- `/studio` - Strona Studio (również: studio.syntance.com)
- `/contact` - Formularz kontaktowy

### Komponenty

Wszystkie sekcje są w `components/sections/`:

```tsx
import HeroHome from "@/components/sections/hero-home";
import FeaturesGrid from "@/components/sections/features-grid";
import CTA from "@/components/sections/cta";
```

### Dodawanie nowej sekcji

1. Utwórz plik w `components/sections/new-section.tsx`:

```tsx
import Container from "../container";

export default function NewSection() {
  return (
    <section className="py-16">
      <Container>
        <h2 className="text-3xl font-bold">Nowa sekcja</h2>
        <p className="mt-4 text-zinc-600">Treść sekcji...</p>
      </Container>
    </section>
  );
}
```

2. Dodaj do strony:

```tsx
import NewSection from "@/components/sections/new-section";

export default function Page() {
  return (
    <>
      <Navbar />
      <NewSection />
      <Footer />
    </>
  );
}
```

## 🎨 Stylowanie

### Tailwind CSS

Projekt używa Tailwind CSS z custom kolorami:

```tsx
<div className="bg-brand text-white">Brand color</div>
<div className="bg-brand-dark">Brand dark</div>
```

### shadcn/ui

```tsx
import { Button } from "@/components/ui/button";

<Button>Kliknij mnie</Button>
<Button variant="outline">Outline</Button>
```

### Framer Motion

```tsx
"use client";
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Animowana zawartość
</motion.div>
```

## 📝 Skrypty

```bash
pnpm dev          # Serwer deweloperski (port 3000)
pnpm build        # Build produkcyjny
pnpm start        # Uruchom build produkcyjny
pnpm lint         # Sprawdź kod (ESLint)
pnpm format       # Formatuj kod (Prettier)
```

## 🔧 Konfiguracja

### Zmiana kolorów brand

Edytuj `tailwind.config.ts`:

```ts
colors: {
  brand: {
    DEFAULT: "#246BFD",  // Twój kolor
    dark: "#0B1530"      // Ciemny wariant
  }
}
```

### Zmiana metadanych SEO

Edytuj `app/layout.tsx`:

```ts
export const metadata: Metadata = {
  title: "Twój tytuł",
  description: "Twój opis",
  // ...
};
```

### Dodanie nowej strony

1. Utwórz `app/(marketing)/nowa-strona/page.tsx`:

```tsx
import Navbar from "@/components/navbar";
import Footer from "@/components/sections/footer";

export const metadata = {
  title: "Nowa strona",
  description: "Opis nowej strony",
};

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="py-20">
        <h1>Nowa strona</h1>
      </main>
      <Footer />
    </>
  );
}
```

2. Dodaj link w nawigacji (`components/navbar.tsx`):

```tsx
<Link href="/nowa-strona">Nowa strona</Link>
```

3. Dodaj do sitemap (`app/sitemap.ts`):

```ts
{ url: `${base}/nowa-strona`, lastModified: new Date() },
```

## 🚀 Deploy na Vercel

### Szybki deploy

```bash
npm i -g vercel
vercel login
vercel
```

### Lub przez GitHub

1. Push do GitHub
2. Połącz repo z Vercel
3. Vercel automatycznie zdeployuje

Szczegóły: Zobacz `DEPLOYMENT.md`

## 📚 Dokumentacja

- **README.md** - Pełna dokumentacja projektu
- **DEPLOYMENT.md** - Szczegółowa instrukcja deployment
- **SHADCN_SETUP.md** - Konfiguracja shadcn/ui
- **QUICKSTART.md** - Ten plik (quick start)

## 🐛 Troubleshooting

### Port 3000 zajęty

```bash
pnpm dev -p 3001
```

### Błędy TypeScript

```bash
pnpm lint
```

### Problemy z cache

```bash
rm -rf .next
pnpm dev
```

### shadcn/ui nie działa

```bash
npx shadcn-ui@latest init --yes
```

## 💡 Wskazówki

1. **Używaj `<Container>`** dla spójnych marginesów
2. **Komponenty sekcji** - każda sekcja w osobnym pliku
3. **"use client"** - tylko gdy potrzebujesz interaktywności
4. **Metadata** - dodaj do każdej strony dla SEO
5. **Lighthouse** - testuj wydajność regularnie

## 🔗 Przydatne linki

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Vercel Docs](https://vercel.com/docs)

## 📞 Kontakt

Pytania? hello@syntance.com

---

**Powodzenia! 🚀**

