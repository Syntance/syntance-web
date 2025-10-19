# ✅ Checklist - Syntance Web

Użyj tej listy, aby upewnić się, że wszystko jest gotowe.

---

## 📦 Instalacja (WYMAGANE)

- [ ] Zainstalowano Node.js 18+
- [ ] Zainstalowano pnpm (`npm install -g pnpm`)
- [ ] Uruchomiono `pnpm install`
- [ ] Uruchomiono `npx shadcn-ui@latest init --yes`
- [ ] Dodano podstawowe komponenty shadcn/ui:
  - [ ] `npx shadcn-ui@latest add button`
  - [ ] `npx shadcn-ui@latest add card`
  - [ ] `npx shadcn-ui@latest add input`
  - [ ] `npx shadcn-ui@latest add textarea`
  - [ ] `npx shadcn-ui@latest add navigation-menu`

---

## 🧪 Testowanie lokalne

- [ ] `pnpm dev` działa bez błędów
- [ ] Strona główna (/) ładuje się poprawnie
- [ ] Strona Studio (/studio) ładuje się poprawnie
- [ ] Strona Kontakt (/contact) ładuje się poprawnie
- [ ] Nawigacja działa (klikanie linków)
- [ ] Responsive design działa (mobile, tablet, desktop)
- [ ] `pnpm build` przechodzi bez błędów
- [ ] `pnpm lint` nie pokazuje błędów

---

## 🎨 Dostosowania (OPCJONALNE)

- [ ] Zmieniono kolory brand w `tailwind.config.ts`
- [ ] Zaktualizowano teksty w sekcjach:
  - [ ] `components/sections/hero-home.tsx`
  - [ ] `components/sections/hero-studio.tsx`
  - [ ] `components/sections/features-grid.tsx`
  - [ ] `components/sections/pricing-studio.tsx`
  - [ ] `components/sections/cta.tsx`
  - [ ] `components/sections/footer.tsx`
- [ ] Dodano prawdziwy favicon (`public/favicon.ico`)
- [ ] Dodano og-image (`public/og-image.png` - 1200x630px)
- [ ] Zaktualizowano dane kontaktowe w Footer
- [ ] Zaktualizowano metadata w `app/layout.tsx`

---

## 📝 Git & GitHub

- [ ] Zainicjalizowano Git (`git init`)
- [ ] Utworzono repozytorium na GitHub
- [ ] Dodano remote (`git remote add origin ...`)
- [ ] Wykonano pierwszy commit:
  ```bash
  git add .
  git commit -m "Initial commit: Syntance Web"
  git push -u origin main
  ```
- [ ] Sprawdzono, że wszystkie pliki są na GitHub

---

## 🚀 Deployment na Vercel

### Przygotowanie

- [ ] Zainstalowano Vercel CLI (`npm i -g vercel`)
- [ ] Zalogowano się (`vercel login`)
- [ ] Sprawdzono, że projekt jest na GitHub

### Deploy

- [ ] Uruchomiono `vercel`
- [ ] Połączono z projektem na Vercel
- [ ] Deployment zakończył się sukcesem
- [ ] Sprawdzono URL preview

### Konfiguracja

- [ ] Dodano zmienne środowiskowe w Vercel:
  - [ ] `NEXT_PUBLIC_SITE_URL=https://syntance.com`
- [ ] Zmienne ustawiono dla: Production, Preview, Development

---

## 🌐 Konfiguracja domen

### Główna domena (syntance.com)

- [ ] Dodano domenę w Vercel Dashboard
- [ ] Zaznaczono jako Production Domain
- [ ] Skonfigurowano DNS u rejestratora:
  - [ ] Typ: A Record lub CNAME
  - [ ] Name: @ (lub puste)
  - [ ] Value: `76.76.21.21` (A) lub `cname.vercel-dns.com` (CNAME)
- [ ] Poczekano na propagację DNS (5-48h)
- [ ] Sprawdzono, że https://syntance.com działa

### Subdomena (studio.syntance.com)

- [ ] Dodano subdomenę w Vercel Dashboard
- [ ] Zaznaczono jako Production Domain
- [ ] Skonfigurowano DNS u rejestratora:
  - [ ] Typ: CNAME
  - [ ] Name: studio
  - [ ] Value: `cname.vercel-dns.com`
- [ ] Poczekano na propagację DNS
- [ ] Sprawdzono, że https://studio.syntance.com działa
- [ ] Sprawdzono, że przekierowuje na /studio

---

## 🔍 SEO

- [ ] Sprawdzono https://syntance.com/sitemap.xml
- [ ] Sprawdzono https://syntance.com/robots.txt
- [ ] Sprawdzono meta tagi (View Source):
  - [ ] `<title>` jest poprawny
  - [ ] `<meta name="description">` jest poprawny
  - [ ] OpenGraph tags są obecne
- [ ] Przetestowano OpenGraph: https://www.opengraph.xyz/
- [ ] Dodano stronę do Google Search Console (opcjonalnie)
- [ ] Dodano stronę do Bing Webmaster Tools (opcjonalnie)

---

## ⚡ Wydajność

- [ ] Uruchomiono Lighthouse audit:
  ```bash
  npx lighthouse https://syntance.com --view
  ```
- [ ] Wyniki Lighthouse (cel: 90+ mobile):
  - [ ] Performance: ___/100
  - [ ] Accessibility: ___/100
  - [ ] Best Practices: ___/100
  - [ ] SEO: ___/100
- [ ] Core Web Vitals w normie:
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1

---

## 🧪 Testy funkcjonalne

### Desktop

- [ ] Strona główna ładuje się poprawnie
- [ ] Nawigacja działa
- [ ] Wszystkie linki działają
- [ ] Sekcje wyświetlają się poprawnie
- [ ] Footer zawiera poprawne linki
- [ ] Formularz kontaktowy wyświetla się

### Mobile (375px)

- [ ] Strona jest responsywna
- [ ] Nawigacja działa
- [ ] Teksty są czytelne
- [ ] Przyciski są klikalne
- [ ] Nie ma horizontal scroll

### Tablet (768px)

- [ ] Layout dostosowuje się do tabletu
- [ ] Grid sekcji działa poprawnie (2 kolumny)
- [ ] Nawigacja jest użyteczna

---

## 📊 Analytics

- [ ] Vercel Analytics działa (sprawdź w Dashboard)
- [ ] Dodano Google Analytics (opcjonalnie)
- [ ] Dodano Facebook Pixel (opcjonalnie)
- [ ] Skonfigurowano tracking eventów (opcjonalnie)

---

## 🔒 Bezpieczeństwo

- [ ] Sprawdzono, że `.env.local` NIE jest w Git
- [ ] Sprawdzono, że `.env` jest w `.gitignore`
- [ ] Nie ma secrets w kodzie
- [ ] HTTPS działa na wszystkich domenach
- [ ] Sprawdzono security headers (opcjonalnie)

---

## 📱 Testy przeglądarek

- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Edge (desktop)
- [ ] Chrome (mobile)
- [ ] Safari (iOS)

---

## 📚 Dokumentacja

- [ ] Przeczytano START_HERE.md
- [ ] Przeczytano QUICKSTART.md
- [ ] Przeczytano README.md
- [ ] Przeczytano DEPLOYMENT.md (jeśli deployment)
- [ ] Zespół wie, gdzie jest dokumentacja

---

## 🎯 Post-launch

- [ ] Udostępniono stronę w social media
- [ ] Wysłano link do klientów/stakeholderów
- [ ] Dodano stronę do portfolio
- [ ] Skonfigurowano monitoring (Sentry, LogRocket - opcjonalnie)
- [ ] Zaplanowano pierwsze update'y

---

## 🔄 Maintenance

- [ ] Zaplanowano regularne update'y zależności
- [ ] Skonfigurowano Dependabot (GitHub)
- [ ] Zaplanowano backup'y (jeśli będzie CMS/baza)
- [ ] Ustalono proces zgłaszania bugów
- [ ] Ustalono proces dodawania nowych funkcji

---

## 🎉 Gotowe!

Jeśli wszystkie checkboxy są zaznaczone, projekt jest w pełni gotowy i działa na produkcji!

**Data ukończenia:** _______________

**Deployed by:** _______________

**Production URL:** https://syntance.com

**Studio URL:** https://studio.syntance.com

---

## 📞 Kontakt w razie problemów

- **Dokumentacja projektu:** Zobacz pliki .md w repo
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Support:** https://vercel.com/support
- **GitHub Issues:** https://github.com/Kamil0108/syntance-web/issues

---

**Powodzenia! 🚀**

