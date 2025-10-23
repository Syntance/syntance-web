# Syntance Web

Oficjalna strona internetowa Syntance — studio technologiczne specjalizujące się w inteligentnym tworzeniu stron, sklepów i systemów webowych.

## 🚀 Stack technologiczny

- **Framework**: Next.js 14 (App Router)
- **Język**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Animacje**: Framer Motion
- **Ikony**: Lucide React
- **Analytics**: Vercel Analytics
- **Deploy**: Vercel

## 📁 Struktura projektu

```
syntance-web/
├── app/
│   ├── (marketing)/
│   │   ├── studio/          # Strona Studio
│   │   └── contact/         # Strona kontaktowa
│   ├── layout.tsx           # Layout główny
│   ├── page.tsx             # Strona główna
│   ├── globals.css          # Style globalne
│   ├── sitemap.ts           # Mapa strony
│   └── robots.ts            # Robots.txt
├── components/
│   ├── sections/            # Sekcje strony
│   │   ├── hero-home.tsx
│   │   ├── hero-studio.tsx
│   │   ├── features-grid.tsx
│   │   ├── pricing-studio.tsx
│   │   ├── cta.tsx
│   │   └── footer.tsx
│   ├── ui/                  # Komponenty shadcn/ui
│   ├── navbar.tsx
│   └── container.tsx
├── lib/
│   ├── utils.ts             # Utility functions
│   └── seo.ts               # SEO helpers
└── public/
    ├── favicon.ico
    └── og-image.png
```

## 🛠️ Instalacja i uruchomienie

### Wymagania

- Node.js 18+ 
- pnpm (zalecane) lub npm

### Instalacja zależności

```bash
pnpm install
```

### Konfiguracja środowiska

Utwórz plik `.env.local` i dodaj następujące zmienne:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://syntance.com

# Contact Form (Resend API)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
CONTACT_TO_EMAIL=kontakt@syntance.com

# WhatsApp
NEXT_PUBLIC_WHATSAPP_PHONE=+48662519544
```

**Uwaga:** Aby formularz kontaktowy działał, musisz skonfigurować konto Resend i zweryfikować domenę. Zobacz sekcję "Contact Pipeline" poniżej.

### Uruchomienie w trybie deweloperskim

```bash
pnpm dev
```

Aplikacja będzie dostępna pod adresem: http://localhost:3000

### Build produkcyjny

```bash
pnpm build
pnpm start
```

## 🎨 Konfiguracja shadcn/ui

Aby dodać nowe komponenty shadcn/ui:

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
```

## 📝 Skrypty

- `pnpm dev` - Uruchomienie serwera deweloperskiego
- `pnpm build` - Build produkcyjny
- `pnpm start` - Uruchomienie serwera produkcyjnego
- `pnpm lint` - Sprawdzenie kodu ESLint
- `pnpm format` - Formatowanie kodu Prettier

## 📧 Contact Pipeline (Resend + API)

Projekt zawiera w pełni działający formularz kontaktowy z integracją Resend do wysyłki emaili.

### Funkcjonalności

- ✅ Walidacja po stronie klienta i serwera (Zod)
- ✅ Honeypot do ochrony przed botami
- ✅ Rate-limiting (1 request / 30s per IP)
- ✅ Wysyłka emaili przez Resend API
- ✅ Obsługa błędów i stanów ładowania
- ✅ Responsywne komunikaty sukcesu/błędu

### Endpoint API

`POST /api/contact`

**Body:**
```json
{
  "name": "Jan Kowalski",
  "email": "jan@example.com",
  "message": "Witam, chciałbym zlecić projekt..."
}
```

**Odpowiedzi:**
- `200` - Email wysłany pomyślnie
- `400` - Niepoprawne dane lub wykryto bota
- `429` - Za dużo requestów (rate-limit)
- `500` - Błąd serwera

### Konfiguracja Resend

**📖 [Szczegółowe instrukcje konfiguracji emaili →](KONFIGURACJA_EMAIL.md)**

1. Załóż konto na https://resend.com
2. Dodaj i zweryfikuj domenę `syntance.com` (lub użyj domeny testowej)
3. Wygeneruj API Key w panelu Resend
4. Zaktualizuj `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
   CONTACT_TO_EMAIL=kontakt@syntance.com
   ```

⚠️ **WAŻNE**: Bez konfiguracji klucza API, formularz kontaktowy NIE będzie wysyłać emaili!

### Testowanie lokalne

```bash
# Uruchom dev server
pnpm dev

# Otwórz http://localhost:3000/contact
# Wypełnij formularz i wyślij
# Sprawdź logi w konsoli oraz inbox na CONTACT_TO_EMAIL
```

**Uwaga:** W development możesz użyć Resend w trybie testowym (bez weryfikacji domeny), ale emaile będą wysyłane tylko do zweryfikowanych adresów email w Twoim koncie Resend.

## 🌐 Deployment na Vercel

### 1. Połącz repozytorium z Vercel

```bash
vercel
```

### 2. Konfiguracja domen

W panelu Vercel dodaj domeny:

- **Główna domena**: `syntance.com`
  - Typ: Production
  - DNS: A record lub ALIAS wskazujący na Vercel

- **Subdomena Studio**: `studio.syntance.com`
  - Typ: Production
  - DNS: CNAME wskazujący na `cname.vercel-dns.com`

Plik `vercel.json` automatycznie przekieruje ruch z `studio.syntance.com` na `/studio`.

### 3. Zmienne środowiskowe

W panelu Vercel ustaw (Settings → Environment Variables):

```
NEXT_PUBLIC_SITE_URL=https://syntance.com
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
CONTACT_TO_EMAIL=kontakt@syntance.com
NEXT_PUBLIC_WHATSAPP_PHONE=+48662519544
```

Zobacz DEPLOYMENT.md dla szczegółowych instrukcji konfiguracji Resend.

## 🎯 Integracja z Deepsite v2

Katalog `components/sections/` jest przygotowany do wklejania bloków generowanych przez Deepsite v2:

1. Wygeneruj sekcję w Deepsite v2
2. Skopiuj kod komponentu
3. Wklej do nowego pliku w `components/sections/`
4. Zaimportuj i użyj w odpowiedniej stronie

## 🔍 SEO

Projekt zawiera:

- ✅ Metadane dla każdej strony
- ✅ OpenGraph tags
- ✅ Automatyczny sitemap.xml
- ✅ Robots.txt
- ✅ Semantic HTML
- ✅ Optymalizacja Core Web Vitals

### TODO: Grafiki SEO

- [ ] **og-image.png** - Utwórz obraz OpenGraph (1200x630px) w `/public/og-image.png`
- [ ] **favicon.ico** - Zaktualizuj favicon w `/public/favicon.ico` na właściwy (obecnie placeholder)

Grafiki te będą wyświetlane przy udostępnianiu linków w social media (Facebook, Twitter, LinkedIn).

## 📊 Analytics

Projekt wykorzystuje Vercel Analytics do śledzenia:

- Page views
- User interactions
- Core Web Vitals
- Performance metrics

## 🎨 Design System

### Kolory

- **Brand**: `#246BFD` (electric blue)
- **Brand Dark**: `#0B1530`

### Typografia

- Font system: Default system fonts
- Responsive: Mobile-first approach

## 📄 Licencja

© 2025 Syntance. Wszelkie prawa zastrzeżone.

## 🤝 Kontakt

- Website: https://syntance.com
- Email: kontakt@syntance.com
- Telefon: +48 662 519 544

