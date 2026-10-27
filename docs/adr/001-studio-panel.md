# ADR 001 — Panel „Magazyn → Syntance Studio”: licencje, aktualizacje i katalog modułów

**Status:** przyjęty (decyzje właściciela 2026-10-21) · wdrażany etapami F1–F4 na branchu `feat/studio-panel`

## Kontekst
Aplikacja desktopowa **Syntance Studio** (dotąd „Folio PDF”, repo `Syntance/folio-pdf`) jest hubem modułów
(ADR 026 w tamtym repo): moduły to podpisane pakiety `.fmod` (Ed25519, `module.json`, SHA-256 plików), katalog
`catalog.json` (`CatalogEnvelope {catalog, signature}`) wskazuje wersje i kanały `stable`/`beta`. Licencje to
certyfikaty Ed25519 weryfikowane offline w aplikacji (ADR 019). Dotąd licencje obsługiwał samodzielny serwer
`folio-pdf/server` (plik JSON), a pakiety i katalog leżały w GitHub Releases (`Syntance/folio-pdf-releases`).
Właściciel chce jednego panelu administracyjnego pod `syntance.com/magazyn` — zakładka na każdą sprzedawaną
aplikację — oraz publicznych endpointów dla aplikacji zastępujących ten serwer.

## Decyzje

### 1. Gdzie to żyje
W istniejącym projekcie `syntance-web` (Next.js 16, Drizzle + Neon, Upstash, Resend, Vercel Blob). Panel to nowa
sekcja `/magazyn/studio`; aplikacje są wierszami `studio_apps` (slug) — dodanie kolejnej aplikacji = nowa zakładka,
bez zmian schematu. Publiczne API: `https://syntance.com/api/studio/*` (host `studio.syntance.com` zostaje stroną
marketingową — `vercel.json` przepisuje go na `/studio`, więc API tam nie żyje).

### 2. Klucze (decyzja 1A i 2)
- **Klucz wydawcy modułów/katalogu** (`FOLIO_MODULE_PUBLIC_KEY` w aplikacji): **zostaje offline u właściciela**,
  nigdy w bazie, repo ani na Vercel. Panel przyjmuje już podpisane pakiety `.fmod` (podpis i sumy weryfikuje
  przy wgrywaniu kluczem publicznym), a katalog przygotowuje jako *szkic* — właściciel pobiera szkic, podpisuje go
  lokalnie (`pnpm hub:tool catalog`), wgrywa podpis, panel weryfikuje go kluczem publicznym i dopiero wtedy
  publikuje `/api/studio/catalog`. **Wycofanie wersji = nowy podpisany katalog** (a więc też krok lokalny).
  Zysk: wyciek środowiska Vercel nie pozwala podsunąć kodu wszystkim użytkownikom.
- **Klucz licencji** (Ed25519, osobny od klucza wydawcy): musi być online, bo certyfikat jest podpisywany przy
  każdej aktywacji i odświeżeniu. Trzymany jako **Sensitive env `LICENSE_PRIVATE_KEY`** (PKCS#8 PEM) na Vercel;
  generowany lokalnie `pnpm studio:keygen`. Wyciek pozwala wystawiać licencje, ale **nie** podsunąć kodu.
  Rotacja wymaga wydania aplikacji z nowym kluczem publicznym (certyfikat nie niesie `kid`) — plan rotacji:
  aplikacja przyjmuje dwa klucze publiczne w okresie przejściowym (zadanie po stronie folio-pdf).
  KMS (np. AWS KMS Ed25519) odłożony — do rozważenia, gdy liczba płatnych klientów uzasadni koszt.

### 3. Konta użytkowników (decyzja 3A)
**Brak kont i logowania w aplikacji.** „Użytkownik” to klient identyfikowany e-mailem z zamówień/licencji.
Panel pokazuje jego licencje, urządzenia i zamówienia oraz pozwala je wyeksportować/usunąć (RODO). Portal klienta
(magic link) — po MVP. Tożsamość urządzenia: SHA-256 odcisku (pseudonim), nazwa urządzenia ≤120 znaków.

### 4. Uwierzytelnianie właściciela (decyzja 4)
Hasło (Argon2id, OWASP: 19 MiB / 2 iteracje, min. 6 znaków — decyzja właściciela z 2026-10-27, pierwotnie 14; słabsze hasło równoważą obowiązkowy TOTP, limity prób Upstash i sesje unieważnialne) + **obowiązkowy TOTP** (RFC 6238, każdy kod
jednorazowy) + 10 kodów zapasowych. Sesje po stronie bazy (`admin_sessions`, 24 h bez odnawiania, unieważnialne),
cookie `__Host-` HttpOnly Secure SameSite=Strict niesie tylko id sesji podpisane HMAC. Limity prób na Upstash
(IP: 10/10 min, konto: 5/15 min; brak Upstash = odmowa). Mutacje API panelu wymagają `Sec-Fetch-Site: same-origin`
lub zgodnego `Origin` (middleware). Konto zakłada się raz tokenem `ADMIN_BOOTSTRAP_TOKEN` (po konfiguracji token
usuwa się z Vercel). Passkey (WebAuthn) — później. Odzyskiwanie: kody zapasowe; awaryjnie usunięcie wiersza
`admin_users` w bazie i ponowna konfiguracja tokenem. Zmiana dotyczy całego `/magazyn` (wspólne logowanie).

### 5. Licencje, płatności, trial (decyzje 5 i 8)
- Kontrakt aplikacji zachowany 1:1 z `folio-pdf/server`: `POST /api/studio/v1/{activate,refresh,deactivate}` →
  `{certificate}`; certyfikat `base64url(JSON LicensePayload v1).base64url(podpis Ed25519 nad surowymi bajtami JSON)`;
  błędy `UNKNOWN_KEY 404`, `REVOKED 410`, `DEVICE_LIMIT 409` (+ lista urządzeń), `NOT_ACTIVATED 409`,
  `RATE_LIMITED 429`. Test `license-contract.test.ts` weryfikuje format niezależną implementacją tak jak aplikacja.
- Limit urządzeń (domyślnie 2, panel: 1–10) egzekwuje **baza** — unikalność `(licencja, miejsce)` — więc równoległe
  aktywacje nie przekroczą limitu mimo braku interaktywnych transakcji w sterowniku Neon HTTP.
- Prefiks nowych kluczy: `STUDIO-` (stare `FOLIO-` nadal działają; wzorzec w aplikacji dopuszcza dowolny prefiks).
- Paddle (Merchant of Record): webhook `POST /api/studio/v1/webhooks/paddle` — podpis HMAC weryfikowany **przed**
  logiką, idempotencja po `event_id` (`studio_webhook_events`, zdarzenie niedokończone jest przetwarzane ponownie),
  mapowanie `price_id → plan/uprawnienia/miesiące aktualizacji` w tabeli `studio_prices` (edytowalne w panelu).
  Odnowienie subskrypcji przesuwa `expiresAt`; zatwierdzony zwrot unieważnia licencję. „Zapłacone” ustawia wyłącznie
  webhook. E-mail kupującego pochodzi z `custom_data.email` przekazanego w checkout (do potwierdzenia w sandboxie).
- **Trial:** pozostaje lokalny w aplikacji (14 dni, bez serwera). W panelu można ręcznie wystawić „licencję
  próbną” jako krótką subskrypcję (`expiresAt` = teraz + N dni) — mieści się w kontrakcie, bez zmian w aplikacji.
- Awaria poczty nie blokuje webhooka (Paddle ponawiałby go); nieudana wysyłka klucza trafia do audytu, klucz można
  wysłać ponownie z panelu.

### 6. Dane, RODO, retencja (decyzja 5)
| Dane | Retencja |
| --- | --- |
| Zamówienia (`studio_orders`) | 5 lat (przepisy podatkowe) |
| Licencje i urządzenia | do końca licencji + 12 miesięcy, następnie anonimizacja e-maila i nazw urządzeń |
| Dziennik audytu | 12 miesięcy |
| IP | tylko hash HMAC (30 dni dla logów aktywacji); surowe IP nie jest zapisywane |
Paddle jest niezależnym administratorem danych płatności (MoR). Administrator danych w panelu: `legal-entity.ts`
(JDG Kamil Podobiński). Umowy powierzenia (DPA) z Vercel, Neon, Upstash, Resend — lista w
`docs/DO_ZROBIENIA_WLASCICIELA.md`. Klucze licencji i hasła **nigdy** nie trafiają do dziennika audytu.

### 7. Pakiety i katalog (F3)
Pliki `.fmod` i modele ONNX w **Vercel Blob** (z opcją zewnętrznego URL + SHA-256 dla bardzo dużych modeli),
pobieranie przez `/api/studio/download/…` (liczenie pobrań, możliwość wycofania). Katalog publiczny
`/api/studio/catalog` zwraca ostatnio opublikowaną, podpisaną `CatalogEnvelope` (format `src/shared/hub.ts`,
monotoniczne `issuedAt`). Po stronie aplikacji (osobny PR w folio-pdf): zmiana URL-i (`FOLIO_LICENSE_URL`,
adres katalogu, lista dozwolonych hostów) i nazwy produktu; `appId` bez zmian do pierwszego wydania.

## Konsekwencje
- (+) Jedno miejsce dla licencji, zamówień, wersji i katalogu; zero ręcznych plików JSON.
- (+) Klucz wydawcy poza chmurą; wyciek Vercel nie umożliwia dystrybucji złośliwego kodu.
- (−) Publikacja katalogu i wycofanie wersji wymagają kroku lokalnego (podpis) — świadomy kompromis bezpieczeństwa.
- (−) Rotacja klucza licencji wymaga wydania aplikacji (do usprawnienia: dwa klucze publiczne w aplikacji).
- (−) Brak kont: zarządzanie urządzeniami przez klienta tylko przez aplikację lub kontakt z supportem.
