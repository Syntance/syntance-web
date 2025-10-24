# 🚀 Instrukcja Deployment - Syntance Web

## Przygotowanie projektu

### 1. Instalacja zależności

```bash
pnpm install
```

### 2. Konfiguracja shadcn/ui

Zainicjalizuj shadcn/ui i dodaj podstawowe komponenty:

```bash
npx shadcn-ui@latest init --yes
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add navigation-menu
```

### 3. Test lokalny

```bash
pnpm dev
```

Sprawdź czy aplikacja działa poprawnie na http://localhost:3000

## Deployment na Vercel

### Krok 1: Przygotowanie repozytorium

```bash
git init
git add .
git commit -m "Initial commit: Syntance Web"
git branch -M main
git remote add origin https://github.com/Syntance/syntance-web.git
git push -u origin main
```

### Krok 2: Deploy na Vercel

#### Opcja A: Przez CLI

```bash
npm i -g vercel
vercel login
vercel
```

Podczas konfiguracji:
- Framework Preset: **Next.js**
- Build Command: `pnpm build` (lub zostaw domyślne)
- Output Directory: `.next` (domyślne)
- Install Command: `pnpm install`

#### Opcja B: Przez Dashboard

1. Wejdź na https://vercel.com
2. Kliknij **Add New Project**
3. Zaimportuj repozytorium `syntance-web`
4. Vercel automatycznie wykryje Next.js
5. Kliknij **Deploy**

### Krok 3: Konfiguracja zmiennych środowiskowych

W panelu Vercel → Settings → Environment Variables dodaj:

```
NEXT_PUBLIC_SITE_URL=https://syntance.com
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
CONTACT_TO_EMAIL=hello@syntance.com
NEXT_PUBLIC_WHATSAPP_PHONE=+48123456789
```

Ustaw dla wszystkich środowisk: Production, Preview, Development

#### Konfiguracja Resend API

1. Utwórz konto na https://resend.com
2. Zweryfikuj domenę `syntance.com`:
   - W panelu Resend → Domains → Add Domain
   - Dodaj domenę: `syntance.com`
   - Dodaj rekordy DNS (MX, TXT, DKIM) u swojego rejestratora
   - Poczekaj na weryfikację (może potrwać do 48h)
3. Wygeneruj API Key:
   - W panelu Resend → API Keys → Create API Key
   - Skopiuj klucz i dodaj jako `RESEND_API_KEY` w Vercel
4. Sprawdź, czy email `hello@syntance.com` jest autoryzowany do wysyłki

### Krok 4: Konfiguracja domen

#### Główna domena: syntance.com

1. W panelu Vercel → Settings → Domains
2. Dodaj domenę: `syntance.com`
3. Zaznacz jako **Production Domain**

#### Konfiguracja DNS u rejestratora:

**Opcja A: A Record (zalecane dla głównej domeny)**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Opcja B: CNAME**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

#### Subdomena: studio.syntance.com

1. W panelu Vercel → Settings → Domains
2. Dodaj domenę: `studio.syntance.com`
3. Zaznacz jako **Production Domain**

#### Konfiguracja DNS:

```
Type: CNAME
Name: studio
Value: cname.vercel-dns.com
```

### Krok 5: Weryfikacja

Po skonfigurowaniu DNS (propagacja 5-48h):

1. Sprawdź https://syntance.com - powinna wyświetlić stronę główną
2. Sprawdź https://studio.syntance.com - powinna wyświetlić stronę Studio
3. Sprawdź https://syntance.com/studio - powinna wyświetlić tę samą stronę co subdomena

## Weryfikacja działania

### Testy funkcjonalne

- [ ] Strona główna ładuje się poprawnie
- [ ] Nawigacja działa (linki do Studio, Kontakt)
- [ ] CTA "Wyceń projekt" w navbar prowadzi do /contact
- [ ] Strona Studio wyświetla się pod /studio
- [ ] Subdomena studio.syntance.com działa
- [ ] Formularz kontaktowy wyświetla się poprawnie
- [ ] Sticky WhatsApp button widoczny i klikalny (mobile)
- [ ] Footer zawiera poprawne linki

### Testy Contact Pipeline

- [ ] Formularz wysyła poprawnie (sprawdź czy mail przychodzi)
- [ ] Walidacja działa: krótkie imię → błąd, niepoprawny email → błąd
- [ ] Walidacja: wiadomość < 10 znaków → błąd
- [ ] Honeypot działa: wypełnione pole hp → 400
- [ ] Rate-limit: 2 szybkie submity → 429 przy drugim
- [ ] Po sukcesie: komunikat "Dziękujemy! Odezwiemy się w ciągu 24h"
- [ ] Po błędzie: odpowiedni komunikat błędu

### Testy SEO

- [ ] Sprawdź https://syntance.com/sitemap.xml
- [ ] Sprawdź https://syntance.com/robots.txt
- [ ] Sprawdź meta tagi (View Source)
- [ ] Sprawdź OpenGraph (https://www.opengraph.xyz/)

### Testy wydajności

```bash
# Lighthouse audit
npx lighthouse https://syntance.com --view

# Cel: 90+ na mobile dla wszystkich metryk
```

## Continuous Deployment

Vercel automatycznie deployuje:

- **Production**: każdy push do `main`
- **Preview**: każdy pull request

### Workflow

```bash
# Nowa funkcjonalność
git checkout -b feature/nowa-sekcja
# ... zmiany ...
git commit -m "feat: dodanie nowej sekcji"
git push origin feature/nowa-sekcja

# Utwórz Pull Request na GitHub
# Vercel automatycznie stworzy preview deployment
# Po merge do main → automatyczny deploy na production
```

## Monitoring

### Vercel Analytics

Automatycznie włączone dzięki `@vercel/analytics`:
- Page views
- User sessions
- Core Web Vitals
- Real User Monitoring

Dostęp: Vercel Dashboard → Analytics

### Logi

```bash
vercel logs [deployment-url]
```

## Troubleshooting

### Problem: Subdomena nie działa

**Rozwiązanie:**
1. Sprawdź DNS: `nslookup studio.syntance.com`
2. Upewnij się, że CNAME wskazuje na `cname.vercel-dns.com`
3. Poczekaj na propagację DNS (do 48h)
4. Sprawdź `vercel.json` - czy rewrites są poprawne

### Problem: 404 na /studio

**Rozwiązanie:**
1. Sprawdź czy istnieje `app/(marketing)/studio/page.tsx`
2. Sprawdź czy build przeszedł pomyślnie
3. Sprawdź logi: `vercel logs`

### Problem: Błędy TypeScript podczas build

**Rozwiązanie:**
```bash
pnpm lint
pnpm build
```

Napraw wszystkie błędy przed push do main.

### Problem: Wolne ładowanie

**Rozwiązanie:**
1. Sprawdź Lighthouse
2. Optymalizuj obrazy (użyj next/image)
3. Sprawdź bundle size: `pnpm analyze`
4. Włącz ISR dla statycznych stron

## Aktualizacje

### Aktualizacja zależności

```bash
pnpm update
pnpm audit
```

### Aktualizacja Next.js

```bash
pnpm add next@latest react@latest react-dom@latest
```

## Backup

### Eksport kodu

```bash
git clone https://github.com/Syntance/syntance-web.git
```

### Eksport bazy danych Vercel

Vercel nie przechowuje danych - wszystko jest w repo Git.

## Kontakt

W razie problemów:
- Dokumentacja Vercel: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Support: hello@syntance.com

---

**Ostatnia aktualizacja:** 2025-10-19

