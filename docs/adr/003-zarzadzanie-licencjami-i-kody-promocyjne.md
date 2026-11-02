# ADR 003 — Ręczne zarządzanie licencjami, klientami i kodami promocyjnymi; przebudowa Magazynu

**Status:** przyjęty (2026-11-02) · gałąź `feat/magazyn-licencje-kody` · rozwija ADR 001 (panel) i ADR 002 (infrastruktura)

## Kontekst
Właściciel chce już teraz ręcznie obsługiwać użytkowników, licencje i kody promocyjne w Magazynie, a płatność (Paddle) i landing dorobić później.
Panel i API licencji Syntance Studio żyją w jednej aplikacji Next.js (ADR 001), więc nie potrzeba osobnego „serwera podpisu”.

## Decyzje

### 1. Skąd panel bierze zgodne certyfikaty (Ed25519)
Panel **nie podpisuje certyfikatów samodzielnie** i nie potrzebuje klucza prywatnego poza tym, co już ma API. Certyfikat (`LicensePayload v1`, ADR 019 w folio-pdf)
zawiera `deviceId` i `validateBy`, więc może powstać tylko przy aktywacji/odświeżeniu przez urządzenie. Panel zapisuje **rekord licencji + klucz** (`STUDIO-XXXXX-…`),
a certyfikat podpisuje — jak dotąd — `LicenseService` na `POST /api/studio/v1/{activate,refresh}` kluczem `LICENSE_PRIVATE_KEY` (Sensitive env Vercel).
Klucz `C:\Users\ADMIN\syntance-klucze\licencje\LICENSE_PRIVATE_KEY.pem` nie trafia do repo. Ręcznie wystawiona licencja, licencja z kodu i licencja z webhooka Paddle
to **ten sam rekord i ten sam kod ścieżki** (`LicenseService.issueManual` / `applyPayment`) — różni je tylko `source` (`null` / `promo:<kod>:<e-mail>` / `paddle:<id>`).
Kontrakt z aplikacją (kody błędów, kształt certyfikatu) bez zmian; test `license-contract.test.ts` nadal go pilnuje.

### 2. Model danych (migracja `0008`, addytywna — expand-only, snapshot Neon wg ADR 002 przed produkcją)
- `studio_customer_flags(email PK, blocked_at, blocked_reason, note)` — blokada klienta po e-mailu (małe litery). Zablokowany klient dostaje z API `410 REVOKED`
  (kod znany aplikacji) przy aktywacji i odświeżeniu; już wydany certyfikat działa offline do `validateBy` (≤ 30 dni) — świadomy kompromis kontraktu offline.
- `studio_promo_codes` — rodzaje: `percent`, `amount` (rabaty do checkoutu Paddle), `free_license`, `trial` (wystawiają licencję). Limit użyć, okno ważności, `active`,
  zawężenie rabatu do planu/uprawnień, `provider_discount_id` (id rabatu w Paddle).
- `studio_promo_redemptions(code_id, email)` **UNIQUE** — jeden e-mail raz na kod; źródło `manual` / `redeem` / `paddle`; kwota rabatu.
- Brak zmian istniejących tabel. Klient w panelu = skrót SHA-256 e-maila (id w URL i w audycie — bez PII w adresach i logach).

### 3. Atomowość kodów bez transakcji (sterownik Neon HTTP)
`PromoStore.redeem`: (1) `INSERT … ON CONFLICT DO NOTHING` wiersza wykorzystania (unikalność kod+e-mail → `duplicate`), (2) jeden `UPDATE used_count = used_count + 1 WHERE active AND
(max_uses IS NULL OR used_count < max_uses) AND okno ważności` — przegrany wyścig dostaje `exhausted` i jego rezerwacja jest usuwana; błąd wystawienia licencji zwalnia rezerwację.
Test równoległy (10 żądań, limit 3 → dokładnie 3 licencje) działa na implementacji referencyjnej w pamięci; zapytania SQL do sprawdzenia na gałęzi Neon (lista dla właściciela).

### 4. Gotowość na Paddle
- Webhook `transaction.completed` czyta opcjonalne `custom_data.promo_code` i `details.totals.discount`; `LicenseService` po utworzeniu licencji woła `onPromo` → `PromoService.recordPurchase`
  (zapis wykorzystania z kwotą rabatu). Nieznany/wyczerpany kod **nie blokuje** wydania zapłaconej licencji (audyt `promo.unknown_code` / `promo.record_skipped`).
- Rabat liczy i egzekwuje Paddle (obiekt Discount powiązany przez `provider_discount_id`); `PromoService.quote` służy do podglądu ceny i walidacji kodu w naszym checkoucie.
- Publiczny `POST /api/studio/v1/redeem {code, email}` (kody darmowej licencji/triala): limit 30/min/IP (jak reszta API aplikacji), klucz **tylko e-mailem**, nigdy w odpowiedzi.

### 5. Panel — przebudowa
- Routing: `/magazyn/studio/{licencje,klienci,kody,zamowienia,ceny,moduly,audyt}` + szczegóły `…/[id]`; pulpit `/magazyn/studio` i rozszerzony `/magazyn`.
- Nawigacja w grupach, link „Przejdź do treści”, `aria-current`, menu mobilne (≤ lg), cele dotykowe ≥ 36–44 px, focus widoczny, stany nie tylko kolorem (WCAG 2.2 AA).
- Tabele: wyszukiwanie, filtry i sortowanie w **URL**, paginacja po stronie serwera (parametry walidowane Zod), szkielety ładowania, puste stany z akcją.
- Akcje destrukcyjne (unieważnienie, dezaktywacja urządzenia, blokada, wyłączenie kodu, wymazanie RODO, usunięcie ceny) przez natywny `<dialog>` (focus trap + Esc).
- Dziennik audytu: filtr grup akcji, szukanie, bez kluczy licencji i e-maili klientów (wpisy `customer.*`/`subject.*` celują w skrót).
- Mutacje API nadal za middleware CSRF (`Sec-Fetch-Site`/`Origin`) i sesją z MFA (ADR 001).

## Konsekwencje
- (+) Pełna ręczna obsługa już dziś; po podłączeniu Paddle te same licencje i kody powstają z webhooka, bez zmiany modelu.
- (+) Brak nowych sekretów i zależności.
- (−) Blokada/unieważnienie działają na urządzeniu najpóźniej po `validateBy` (≤ 30 dni), jeśli aplikacja pozostaje offline — wynik kontraktu offline z ADR 019.
- (−) Brak testów przeglądarkowych (Playwright nie jest w projekcie): ścieżki biznesowe pokrywają testy serwisów (`promo.test.ts`, `license-service.test.ts`), UI sprawdzone ręcznie — patrz raport.
- (−) Kody `percent`/`amount` dają realny rabat dopiero po utworzeniu odpowiadającego rabatu w Paddle i podaniu jego id.
