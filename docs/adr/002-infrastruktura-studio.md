# ADR 002 — Infrastruktura Syntance Studio: gdzie żyją API, baza, pliki i kopie

**Status:** przyjęty do wdrożenia (2026-10-26); część konfiguracji kont czeka na zgodę właściciela (patrz `docs/INFRASTRUKTURA.md`)

## Kontekst
Stan faktyczny (dowody w `docs/INFRASTRUKTURA.md` §1): strona i panel na Vercel (projekt `syntance-web`), DNS `syntance.com` w Cloudflare
(serwery nazw `*.ns.cloudflare.com`; `studio.syntance.com` przechodzi przez proxy Cloudflare), baza Neon przez `@neondatabase/serverless`,
Upstash Redis do deduplikacji i limitów, pliki portfolio w Vercel Blob, e-mail Resend, poczta Google Workspace. `dl.syntance.com` nie istnieje.
Studio dokłada: małe API (licencje, katalog, webhook Paddle) i **duże pliki**: instalator ~150 MB, moduł Office ~236 MB, model U²-Net ~176 MB,
pakiety `.fmod` 0,5–8 MB — dla tysięcy użytkowników, z aktualizacjami. Wymagania: bezpieczeństwo, wydajność, niski koszt na starcie, RODO.

## Opcje dla dużych plików (ceny z oficjalnych stron, odczyt 2026-10-26, USD bez VAT)
| Opcja | Koszt przy 1 TB/mc | Przy 10 TB/mc | Ryzyka |
| --- | --- | --- | --- |
| **A. Cloudflare R2 + `dl.syntance.com` (Cloudflare Free)** | **$0** (egress $0; storage 10 GB gratis, potem $0,015/GB) | **$0** | Wymaga konta R2 (karta na koncie), reguły cache dla `.msi/.onnx` (domyślnie niecache’owane), presign tylko na endpoincie S3 |
| B. Vercel Blob | $50 on-demand ($0,05/GB), lub w limicie Flat Rate CDN (1 TB w Pro) | $500 on-demand; Flat Rate CDN **wyklucza „bulk file distribution”** — ryzyko migracji/ograniczeń | koszt rośnie liniowo; zależność od polityki fair-use |
| C. Vercel Fast Data Transfer (pliki z `public/`) | $150 | $1 500 | odpada |
| D. GitHub Releases (stan dotychczasowy) | $0 | $0 | brak kontroli (limity, brak własnej domeny, brak wycofania), publiczne repo wydań, zależność od zewnętrznego hosta; plik 2 GB limit |

**Decyzja:** **A — R2 za domeną `dl.syntance.com`** dla instalatora, modułów i modeli. Vercel Blob zostaje wyłącznie dla obrazów portfolio
(już działa; małe pliki). GitHub Releases jest wygaszany po migracji (aplikacja ma w `egress.ts` allowlistę hostów — nowa: `dl.syntance.com`, `syntance.com`).

## Pozostałe decyzje
1. **API licencji i katalogu: Vercel (Node, `fra1`)**, bez własnej infrastruktury. Endpointy licencji `no-store`; katalog `/api/studio/catalog`
   cache’owany na brzegu (`s-maxage=300, stale-while-revalidate=3600`) — odciąża funkcje. Region funkcji ustawiamy na `fra1` **po potwierdzeniu,
   że Neon jest we Frankfurcie** (domyślny region funkcji Vercel to `iad1`, co dawałoby ~100 ms opóźnienia na każde zapytanie do bazy).
2. **Baza: Neon, plan Launch** (PITR do 7 dni, domyślnie 1 dzień → ustawić 7; Free ma tylko 6 h). Region UE `aws-eu-central-1` (region projektu jest stały).
   RPO ≈ sekundy w oknie PITR. Dodatkowo cotygodniowy zaszyfrowany zrzut logiczny (`pg_dump` → szyfrowanie `age` → osobny bucket R2 na **osobnym tokenie**,
   którego klucze produkcyjne nie mogą usunąć) — kopia „poza” kontem Neon. Kwartalny test odtworzenia na gałęzi Neon.
3. **Limity żądań:** Upstash Redis (PAYG, region EU) — logowanie, aktywacja licencji, webhooki; **dodatkowo Vercel Firewall (WAF rate limiting jest we wszystkich planach;
   Pro: 40 reguł)** jako pierwsza linia przed funkcją: reguła `/api/studio/v1/*` (np. 60 żądań/min na IP) i ostrzejsza dla `/api/admin/login`. Turnstile (Free) **tylko** na
   formularzu pierwszej konfiguracji/zakupach publicznych, jeśli pojawi się nadużycie — nie na API aplikacji (psułoby ją) i nie na logowaniu właściciela (jest TOTP + limity).
4. **Bezpieczeństwo plików:** bucket prywatny, publiczny odczyt wyłącznie przez domenę niestandardową (`r2.dev` wyłączone), token S3 ograniczony do jednego bucketu
   (Object Read & Write), przechowywany jako Sensitive env w Vercel. Integralność: SHA-256 w podpisanym katalogu + podpis manifestu — przejęcie bucketu nie pozwala
   podsunąć kodu bez klucza wydawcy. Klucze obiektów są wersjonowane i niezmienne (`Cache-Control: immutable`), więc cache jest bezpieczny, a „wycofanie” = nowy katalog.
5. **Monitoring:** Sentry (plan Developer, 5 tys. błędów/mc, domyślny scrubbing + `beforeSend` usuwający e-mail/IP/klucze) dla błędów serwera; uptime ping `/api/health` co minutę;
   `/api/health/deep` (Neon + Redis) co 5 min; **dead-man’s switch** healthchecks.io (Free, 20 checków) na cronie retencji i na tygodniowym backupie.
6. **Sekrety i rotacja:** wszystko w Vercel (Sensitive); osobne wartości dla Production i Preview; Preview używa **gałęzi Neon** i sandboxu Paddle oraz **innego** klucza licencji.
   Rotacja kwartalna tokenów R2/Upstash/Resend, natychmiast po incydencie. Klucz wydawcy modułów — offline (ADR 001).
7. **Migracje:** `drizzle-kit migrate` biegnie w buildzie (`vercel-prebuild-db.mjs`) — także dla Preview, więc Preview MUSI mieć własną bazę (gałąź Neon), inaczej migruje produkcję.
   Zasada expand → migrate → contract; snapshot (punkt PITR) przed migracją produkcyjną; kolumny nie są usuwane w tym samym wdrożeniu co kod, który ich używa.
8. **Rollback:** Vercel „Instant Rollback” (kod); PITR (dane); R2 — klucze niezmienne, więc poprzednie wersje nadal istnieją; katalog — opublikować poprzedni stan
   z nowym `issuedAt` (podpis lokalny).

## Konsekwencje
- (+) Koszt dystrybucji plików ≈ $0 niezależnie od liczby użytkowników; API zostaje tanie i proste; dane osobowe tylko w Neon (UE).
- (+) Brak własnych serwerów; wszystko odtwarzalne z repo + sekretów.
- (−) Dodatkowy dostawca (Cloudflare R2) w DPA i w łańcuchu dostaw; wymaga karty na koncie Cloudflare (R2 ma darmowy próg, ale konto musi mieć metodę płatności).
- (−) Cache Rule dla `.msi/.onnx` i konfiguracja CORS bucketu (PUT z `syntance.com`) są ręcznym krokiem w panelu Cloudflare (lista w `INFRASTRUKTURA.md`).
- (−) Backup poza Neon to dodatkowy proces (GitHub Actions + szyfrowanie) — do uruchomienia w fazie 3.
