# 🚀 Instrukcja deployu na Vercel - Syntance Web

## ✅ Pre-deployment Checklist

- [x] Kod na GitHub: https://github.com/Kamil0108/syntance-web
- [x] Build działa lokalnie: `pnpm build` ✓
- [x] vercel.json skonfigurowany (subdomena studio.syntance.com)
- [x] @vercel/analytics zainstalowany
- [x] env.example utworzony
- [ ] Zmienne środowiskowe przygotowane (zobacz niżej)

## 📋 Deployment - Krok po kroku

### Opcja A: Deploy przez Vercel CLI (zalecane)

#### 1. Instalacja Vercel CLI

```bash
npm i -g vercel
```

#### 2. Login do Vercel

```bash
vercel login
```

#### 3. Deploy projektu

```bash
# W katalogu projektu
cd "E:\Software development\Syntance strona"

# Deploy (zostaniesz zapytany o konfigurację)
vercel
```

Podczas konfiguracji:
- **Set up and deploy?** → Yes
- **Which scope?** → Kamil0108 (Twój account)
- **Link to existing project?** → No (pierwszy raz)
- **Project name?** → syntance-web
- **Directory?** → ./
- **Override settings?** → No

#### 4. Production deploy

```bash
vercel --prod
```

---

### Opcja B: Deploy przez Vercel Dashboard

1. Przejdź na: https://vercel.com/new
2. Import Git Repository
3. Wybierz: `Kamil0108/syntance-web`
4. Framework Preset: **Next.js** (auto-detect)
5. Root Directory: `./`
6. Build Command: `pnpm build` (auto)
7. Output Directory: `.next` (auto)
8. Install Command: `pnpm install` (auto)
9. Kliknij **Deploy**

---

## 🔐 Zmienne środowiskowe (WAŻNE!)

Po pierwszym deployu, **NATYCHMIAST** ustaw zmienne w Vercel:

### Dashboard → Settings → Environment Variables:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://syntance.com

# Contact Form - Resend API
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
CONTACT_TO_EMAIL=hello@syntance.com

# WhatsApp
NEXT_PUBLIC_WHATSAPP_PHONE=+48123456789
```

**Zastosuj dla:** Production, Preview, Development (wszystkie)

### ⚠️ Gdzie wziąć RESEND_API_KEY?

1. Załóż konto: https://resend.com/signup
2. Zweryfikuj email
3. Dodaj domenę: `syntance.com`
   - Settings → Domains → Add Domain
   - Dodaj rekordy DNS (MX, TXT, DKIM) u swojego rejestratora
   - Poczekaj na weryfikację (~24-48h)
4. Wygeneruj API Key:
   - Settings → API Keys → Create API Key
   - Name: "Syntance Production"
   - Permissions: Full Access lub Send Access
   - Skopiuj klucz (zaczyna się od `re_`)

---

## 🌐 Konfiguracja domen

### 1. Główna domena: syntance.com

**W Vercel Dashboard:**
- Settings → Domains → Add Domain
- Wpisz: `syntance.com`
- Type: **Production**

**DNS u rejestratora:**

```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto lub 3600
```

lub

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: Auto lub 3600
```

### 2. Subdomena: studio.syntance.com

**W Vercel Dashboard:**
- Settings → Domains → Add Domain
- Wpisz: `studio.syntance.com`
- Type: **Production**

**DNS u rejestratora:**

```
Type: CNAME
Name: studio
Value: cname.vercel-dns.com
TTL: Auto lub 3600
```

**Ważne:** Plik `vercel.json` automatycznie przekieruje `studio.syntance.com` na `/studio` route.

---

## ✅ Weryfikacja po deployu

### 1. Sprawdź deployment

```bash
# Zobacz URL preview
vercel ls
```

Lub w dashboard: https://vercel.com/Kamil0108/syntance-web

### 2. Testuj funkcjonalności

**Frontend:**
- [ ] https://syntance-web.vercel.app (lub Twój URL)
- [ ] Strona główna ładuje się
- [ ] Nawigacja działa
- [ ] CTA "Wyceń projekt" widoczny
- [ ] WhatsApp button widoczny (mobile)

**Contact Form:**
- [ ] https://syntance-web.vercel.app/contact
- [ ] Formularz się wyświetla
- [ ] Wypełnij i wyślij
- [ ] Sprawdź czy mail przyszedł na `CONTACT_TO_EMAIL`

**Studio:**
- [ ] https://syntance-web.vercel.app/studio
- [ ] Strona ładuje się
- [ ] Prawidłowy content

**API:**
```bash
curl -X POST https://syntance-web.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Test wiadomości z API","hp":""}'
```

### 3. Sprawdź domeny (po propagacji DNS)

- [ ] https://syntance.com → strona główna
- [ ] https://syntance.com/studio → strona studio
- [ ] https://studio.syntance.com → strona studio (subdomena)
- [ ] https://syntance.com/contact → formularz

**Uwaga:** Propagacja DNS może zająć 5 minut do 48 godzin.

---

## 🔧 Troubleshooting

### Problem: Build fails

**Rozwiązanie:**
1. Sprawdź logi w Vercel Dashboard
2. Upewnij się że `pnpm build` działa lokalnie
3. Sprawdź czy wszystkie dependencies są w `package.json`

### Problem: Formularz nie wysyła emaili

**Rozwiązanie:**
1. Sprawdź czy `RESEND_API_KEY` jest ustawiony w Vercel
2. Sprawdź logi: Vercel Dashboard → Deployment → Functions → `/api/contact`
3. Sprawdź czy domena jest zweryfikowana w Resend
4. Sprawdź czy email `hello@syntance.com` jest autoryzowany

### Problem: WhatsApp button nie działa

**Rozwiązanie:**
1. Sprawdź czy `NEXT_PUBLIC_WHATSAPP_PHONE` jest ustawiony
2. Format: `+48123456789` (z +, bez spacji)
3. Redeploy po dodaniu zmiennej ENV

### Problem: 404 na studio.syntance.com

**Rozwiązanie:**
1. Sprawdź `vercel.json` - czy rewrites są poprawne
2. Sprawdź DNS: `nslookup studio.syntance.com`
3. Poczekaj na propagację DNS (do 48h)
4. Sprawdź czy subdomena jest dodana w Vercel Domains

### Problem: Biała strona / błąd 500

**Rozwiązanie:**
1. Sprawdź logi w Vercel Dashboard
2. Sprawdź czy wszystkie ENV są ustawione (szczególnie `NEXT_PUBLIC_*`)
3. Sprawdź browser console (F12) - jakie błędy?
4. Redeploy po naprawie

---

## 📊 Monitoring

### Vercel Analytics

Automatycznie włączone dzięki `@vercel/analytics`:
- Dashboard → Analytics
- Real User Monitoring (RUM)
- Core Web Vitals
- Page Views

### Logi

```bash
# Zobacz logi funkcji serverless
vercel logs [deployment-url]

# Logi produkcyjne
vercel logs --prod
```

---

## 🔄 CI/CD - Automatyczny deploy

Po pierwszym deployu, Vercel automatycznie:

✅ **Production deploy:**
- Każdy push do `main` branch
- Automatyczny build i deploy
- URL: https://syntance.com (po skonfigurowaniu domeny)

✅ **Preview deploy:**
- Każdy pull request
- Unikalny preview URL
- Idealny do testowania przed merge

---

## 📝 Notatki

### Obecna konfiguracja:
- **Repository:** https://github.com/Kamil0108/syntance-web
- **Framework:** Next.js 14.0.4
- **Node version:** 18+ (auto-detect)
- **Package manager:** pnpm
- **Build command:** `pnpm build`
- **Output:** `.next/`

### Koszty:
- **Hobby tier (FREE):**
  - 100GB bandwidth/miesiąc
  - Unlimited deployments
  - Automatic HTTPS
  - Serverless Functions
  
Projekt Syntance Web mieści się w darmowym tierze! 🎉

---

## 🎯 Quick Deploy Commands

```bash
# 1. Deploy preview
vercel

# 2. Deploy production
vercel --prod

# 3. Zobacz status
vercel ls

# 4. Zobacz domeny
vercel domains ls

# 5. Zobacz ENV
vercel env ls

# 6. Dodaj ENV przez CLI
vercel env add RESEND_API_KEY
```

---

## ✨ Po deployu

1. **Przetestuj wszystko** (checklist powyżej)
2. **Dodaj Google Analytics** (opcjonalnie)
   - Utwórz property w GA4
   - Dodaj tracking code do `app/layout.tsx`
3. **Dodaj Google Search Console**
   - https://search.google.com/search-console
   - Zweryfikuj domenę
   - Wyślij sitemap: `https://syntance.com/sitemap.xml`
4. **Monitoruj performance**
   - Lighthouse: `npx lighthouse https://syntance.com`
   - Vercel Analytics dashboard
5. **Backup**
   - Kod jest na GitHub ✓
   - ENV zapisz w bezpiecznym miejscu (1Password, Bitwarden)

---

**Gotowe do deployu! 🚀**

Powodzenia z uruchomieniem Syntance Web na produkcji!

