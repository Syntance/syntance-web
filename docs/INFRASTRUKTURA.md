# Infrastruktura syntance.com i Syntance Studio — stan, plan, koszty, dziennik zmian

Decyzje i porównanie opcji: [`adr/002-infrastruktura-studio.md`](adr/002-infrastruktura-studio.md). Zadania właściciela: [`DO_ZROBIENIA_WLASCICIELA.md`](DO_ZROBIENIA_WLASCICIELA.md).
Nazwy zmiennych środowiskowych tylko jako nazwy — **wartości nigdy w repo**.

## 1. Stan obecny (dowody)
| Obszar | Fakt | Dowód |
| --- | --- | --- |
| Hosting | Vercel, projekt `syntance-web`; odpowiedź `Server: Vercel`, HSTS 2 lata + preload | `.vercel/project.json`; `curl -I https://syntance.com` (2026-10-26) |
| DNS | Strefa `syntance.com` w **Cloudflare** (NS: `gerardo.ns.cloudflare.com`, `hazel.ns.cloudflare.com`); apex → A `216.198.79.1` (Vercel, bez proxy); `studio.syntance.com` → IP Cloudflare (proxy włączone) | `nslookup` (2026-10-26) |
| Poczta | Google Workspace (MX `aspmx.l.google.com` + alt1–4) | `nslookup -type=MX` |
| `dl.syntance.com` | **nie istnieje** (NXDOMAIN) | `nslookup` |
| Funkcje / region | brak `regions` w `vercel.json` → domyślnie `iad1` (USA) | `vercel.json` |
| `vercel.json` | tylko rewrite hosta `studio.syntance.com` → `/studio`; (od tej gałęzi) cron retencji | `vercel.json` |
| Nagłówki | HSTS, nosniff, X-Frame-Options SAMEORIGIN, Referrer-Policy, Permissions-Policy, COOP; **brak CSP** (świadomie odłożone w komentarzu) | `next.config.mjs` |
| Baza | Neon Postgres przez `@neondatabase/serverless` (HTTP), Drizzle; migracje w buildzie na Vercelu (`scripts/vercel-prebuild-db.mjs`, warunek `VERCEL=1` — także Preview!) | `lib/db/index.ts`, `package.json` |
| Redis | Upstash tylko w deduplikacji Attio (`lib/attio-email-dedupe.ts`); od tej gałęzi także limity logowania/API | kod |
| Pliki | Vercel Blob tylko dla portfolio (`lib/magazyn/portfolio-upload.ts`); R2 **nie jest** skonfigurowany w `syntance-web` (wzmianki wyłącznie marketingowe) | kod |
| Monitoring | `@vercel/analytics`, `@vercel/speed-insights`, PostHog, GA4; **brak Sentry**; brak cronów; `/api/health` i `/api/health/deep` istnieją (DB) | `app/layout.tsx`, `package.json`, `app/api/health` |
| Integracje (nazwy env) | `RESEND_API_KEY`, `ATTIO_*`, `GOOGLE_*` (Calendar), `NEXT_PUBLIC_SANITY_*`, `NEXT_PUBLIC_POSTHOG_*`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `BLOB_READ_WRITE_TOKEN`, `DATABASE_URL`, `UPSTASH_REDIS_REST_*` | `git grep process.env` |
| Dostęp CLI | `vercel` 48.4 zainstalowany, ale **niezalogowany** (token nieważny); `wrangler` dostępny przez `npx`; brak `neonctl` | sesja 2026-10-26 |
| **Nie zweryfikowane (wymaga paneli)** | plan Vercel (właściciel: Pro), plan/region/PITR Neon, plan/region Upstash, konto Cloudflare (R2 włączone? bucket?), Firewall/WAF, aktualne zmienne środowiskowe | — |

## 2. Architektura docelowa
```
Aplikacja desktopowa ──HTTPS──► syntance.com/api/studio/*  (Vercel fra1, Node)  ──► Neon (Frankfurt, PITR 7 d)
        │                                  │  ├─► Upstash Redis (EU) – limity
        │                                  │  ├─► Resend – klucz licencji e-mail
        │                                  │  └─◄ Paddle webhook (HMAC)
        └──HTTPS──► dl.syntance.com/studio/… (Cloudflare CDN, cache immutable) ──► R2 bucket (prywatny; publiczny tylko przez domenę)
Panel /magazyn (TOTP) ──presigned PUT──► R2 (CORS: https://syntance.com)
Cron Vercel (03:15 UTC) ──► retencja ──► healthchecks.io (dead-man switch)
```

## 3. Koszty miesięczne (USD bez VAT; ceny z oficjalnych stron, odczyt 2026-10-26; wartości „~” to szacunki z założeniami niżej)
Założenia: 1k użytkowników ≈ 1 TB pobrań/mc (instalator + moduły + aktualizacje), 10k ≈ 10 TB; API: kilkaset–kilka tysięcy żądań dziennie; sprzedaż < 100 licencji/dzień.

| Pozycja | Start | 1 000 użytkowników | 10 000 użytkowników | Źródło / uwaga |
| --- | --- | --- | --- | --- |
| Vercel Pro (już opłacany) | 20 | 20 | 20 + zużycie funkcji | vercel.com/pricing; ewentualnie reguły WAF $0,65/mln żądań |
| Cloudflare (DNS, CDN, Turnstile) | 0 | 0 | 0 | plan Free |
| Cloudflare R2 (storage + operacje, egress) | 0 | ~0 | ~0–1 | $0,015/GB; egress $0; 10 GB i 1 mln/10 mln operacji gratis |
| Neon Launch | ~0–5 | ~5–15 | ~15–40 | $0,106/CU-h, scale-to-zero; PITR 7 dni +$0,20/GB-mc zmian |
| Upstash Redis (PAYG, EU) | 0 | ~0–2 | ~2–10 | Free 500 tys. komend/mc; potem $0,20/100 tys. |
| Resend | 0 | 0–20 | 20 | Free 3 000/mc i 100/dzień; Pro $20 gdy >100 maili/dzień |
| Sentry | 0 | 0–29 | 29 | Developer Free (5 tys. błędów) / Team $29 |
| healthchecks.io | 0 | 0 | 0–20 | Free 20 checków |
| **Razem ponad obecny Vercel Pro** | **~0–5** | **~5–65** | **~45–120** | porównanie: samo Vercel Blob dla plików to +$50 (1 TB) / +$500 (10 TB) |

## 4. Plan faz
| Faza | Zakres | Zależności | Kryterium ukończenia | Ryzyka |
| --- | --- | --- | --- | --- |
| **0 — kod (zrobione na `feat/studio-panel`)** | R2 presign + HEAD, endpointy `/api/studio/*`, auth TOTP, limity, health, cron retencji, nagłówki catalog | — | typecheck/lint/testy/build zielone | brak testu na żywej bazie i R2 |
| **1 — konta (wymaga zgody właściciela)** | Cloudflare: bucket R2 + domena `dl.syntance.com` + token + CORS + Cache Rule; Vercel: zmienne (Sensitive), Firewall, `CRON_SECRET`; Neon: weryfikacja regionu/planu, PITR 7 d, gałąź Preview; Upstash: region EU | zgoda w czacie na zakres i koszty | `curl -I https://dl.syntance.com/…` zwraca 200/404 z `cf-cache-status`; presigned PUT działa z panelu; preview na gałęzi Neon | karta w Cloudflare (R2); zmiana regionu funkcji wpływa na całą stronę |
| **2 — wdrożenie Studio** | merge `feat/studio-panel`, migracja `0006` (snapshot PITR przed), pierwsza konfiguracja konta TOTP, Paddle sandbox → produkcja | faza 1 | zakup testowy tworzy licencję i e-mail; aktywacja z aplikacji działa | zmiana logowania całego `/magazyn` |
| **3 — niezawodność** | Sentry (scrubbing), uptime + healthchecks, backup zrzutem do osobnego bucketu, test odtworzenia | faza 2 | alert testowy dociera; odtworzenie < 30 min | koszt czasu, nie pieniędzy |
| **4 — moduły i katalog (F3)** | wgrywanie `.fmod`, szkic→podpis lokalny→publikacja, kanały, wycofanie, migracja wydań z GitHub Releases | faza 1–2 | aplikacja pobiera moduł z `dl.syntance.com` i weryfikuje podpis | błąd w podpisie = aplikacje odrzucają katalog (fail-closed) |

## 5. Zadania wymagające właściciela (dokładne kroki)
**Cloudflare (R2)** — wymaga metody płatności na koncie (R2 jest bezpłatne w progu 10 GB / 1 mln zapisów / 10 mln odczytów miesięcznie):
1. Dashboard → R2 Object Storage → *Create bucket* `syntance-studio` (lokalizacja: automatyczna lub EU). Publiczny dostęp **wyłączony**, `r2.dev` wyłączone.
2. Bucket → Settings → *Custom Domains* → dodaj `dl.syntance.com` (strefa `syntance.com` jest już w tym koncie — Cloudflare doda rekord CNAME sam; to rekord nowy, addytywny).
3. Bucket → Settings → *CORS policy*: `AllowedOrigins: ["https://syntance.com"]`, `AllowedMethods: ["PUT","GET","HEAD"]`, `AllowedHeaders: ["content-type","cache-control","content-length"]`, `MaxAgeSeconds: 3600`.
4. Zone `syntance.com` → Caching → *Cache Rules*: gdy `Hostname equals dl.syntance.com` → *Eligible for cache*, *Edge TTL: 1 rok (ignore origin)*, *Browser TTL: respect origin*. (Domyślny cache nie obejmuje `.msi`/`.onnx`.)
5. R2 → *Manage API Tokens* → *Create API token*: uprawnienie **Object Read & Write**, zakres **tylko bucket `syntance-studio`**, bez TTL (rotacja kwartalna). Wartości (Account ID/endpoint, Access Key ID, Secret) → od razu do Vercel jako **Sensitive**: `STUDIO_R2_ENDPOINT`, `STUDIO_R2_BUCKET`, `STUDIO_R2_ACCESS_KEY_ID`, `STUDIO_R2_SECRET_ACCESS_KEY`, `STUDIO_DL_BASE_URL=https://dl.syntance.com`. Nie wklejaj ich do czatu.
6. (Faza 3) Drugi bucket `syntance-backups` + osobny token (tylko zapis) na kopie bazy.

**Vercel:** `CRON_SECRET` (min. 16 znaków), `HEALTHCHECK_RETENTION_URL`, zmienne Studio z `DO_ZROBIENIA_WLASCICIELA.md`; Firewall → reguły rate limiting: `/api/studio/v1/*` 60/min/IP, `/api/admin/login` 10/10 min/IP; Preview: osobna baza (integracja Neon) i klucze testowe.
**Neon:** sprawdź region projektu (oczekiwany `aws-eu-central-1`), plan Launch, *History retention* = 7 dni; zrób punkt przywracania przed migracją `0006`. **Upstash:** region UE, tryb pay-as-you-go. **healthchecks.io:** check „studio-retention” (okres 1 dzień, tolerancja 3 h) → URL do Vercel.
**Umowy (DPA):** dodaj Cloudflare (R2/CDN) do listy w `DO_ZROBIENIA_WLASCICIELA.md`.

## 6. Dziennik zmian na kontach zewnętrznych
Tu dopisujemy **każdą** zmianę wykonaną w panelach (co, gdzie, kiedy, jak cofnąć). Zgoda właściciela z 2026-10-26: Cloudflare R2 + `dl.syntance.com`, zmienne i Firewall w Vercel, Neon/Upstash tylko odczyt; R2 ma już metodę płatności, bez zmian planów.
Konto Cloudflare: `Kamil.podobinski@tutamail.com's Account` (ID konta w URL dashboardu). W koncie istnieje inny, nietykany bucket `detailing-lacko-media` (inny projekt).

| Data | Serwis | Zmiana | Jak cofnąć |
| --- | --- | --- | --- |
| 2026-10-26 | Cloudflare R2 | Nowy bucket `syntance-studio` (lokalizacja EEUR, klasa Standard, publiczny dostęp i `r2.dev` wyłączone). Nic nie ruszono w istniejącym buckecie | R2 → bucket → Settings → Empty Bucket, potem Delete Bucket |
| 2026-10-26 | Cloudflare R2 + DNS | Custom domain `dl.syntance.com` podpięta do bucketu (Cloudflare dodało nowy rekord CNAME; istniejące rekordy bez zmian). Status po dodaniu: Initializing → ma przejść w Active; Minimum TLS 1.0 (do podniesienia do 1.2) | Bucket → Settings → Custom Domains → usuń `dl.syntance.com` (rekord DNS zniknie razem z nim) |
| 2026-10-26 | Cloudflare R2 | Minimum TLS dla `dl.syntance.com` podniesione z 1.0 do **1.2**; status domeny: Active | Bucket → Settings → Custom Domains → ⋯ → Configure options |
| 2026-10-26 | Cloudflare R2 | CORS bucketu: origin `https://syntance.com`, metody PUT/GET/HEAD, nagłówki content-type/cache-control/content-length, ETag eksponowany, MaxAge 3600 | Bucket → Settings → CORS Policy → Edit/Delete |
| 2026-10-26 | Cloudflare R2 | Utworzono i **od razu usunięto** token API `syntance-studio-uploads` (Object Read & Write, tylko bucket `syntance-studio`): wartość sekretu pojawiła się w wyniku narzędzia automatyzacji, więc została unieważniona. Nowy token powstaje dopiero przy wklejaniu do Vercel (schowek, bez odczytu wartości) | — (usunięty) |
