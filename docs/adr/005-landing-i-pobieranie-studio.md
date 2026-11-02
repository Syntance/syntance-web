# ADR 005 — Landing Syntance Studio i pobieranie instalatora

**Status:** przyjęty (2026-11-03) · decyzje właściciela: pobieranie z „Wydań” w panelu, na landingu ceny z planów w panelu

## Decyzje
1. **Adres i menu:** `https://syntance.com/syntance-studio`, w menu głównym pod **Produkty** (obok Panelu), także w menu mobilnym, w sitemapie i z JSON-LD (`SoftwareApplication`, `FAQPage`, `BreadcrumbList`).
   Nie używamy `/studio`: middleware przekierowuje `/studio` na `/` (stary adres), a `vercel.json` przepisuje host `studio.syntance.com` na `/studio`.
   Przepięcie hosta `studio.syntance.com` na nowy landing to osobna decyzja (zmiana `vercel.json` i reguł middleware).
2. **Wydania** (`studio_releases`, migracja `0010`, addytywna): instalator wgrywany z panelu (`/magazyn/studio/wydania`) prosto do R2 przez presigned PUT
   (istniejący `kind: installer`, klucz `studio/installer/app/<wersja>/<plik>`), wersja semver, kanał `stable`/`beta`, rozmiar, SHA-256 liczone w przeglądarce.
   Rejestracja sprawdza, że obiekt istnieje i ma deklarowany rozmiar. Dozwolone tylko `.exe`/`.msi`/`.msix`.
   **Wydanie jest szkicem, dopóki właściciel go nie opublikuje**; landing pokazuje najnowsze opublikowane wydanie kanału `stable`. Opublikowanego nie da się usunąć (najpierw wycofać).
   Pliki są niezmienne i serwowane z `dl.syntance.com` (cache `immutable`, egress $0 — ADR 002).
3. **Ceny na landingu:** plan dostaje opcjonalną cenę do wyświetlenia (`price_amount` w jednostkach najmniejszych + `price_currency`, oba albo żaden). Landing pokazuje plan Free
   oraz aktywne plany płatne z ceną. Cena na stronie **nie jest** ceną w Paddle — rozliczenie nadal wymaga `studio_prices`. Do czasu uruchomienia płatności przycisk planu to
   „Zapytaj o licencję” (`/kontakt`), a strona mówi to wprost; nie ma fałszywego „Kup teraz”.
4. **Odporność:** awaria lub brak bazy nie wywraca strony — pokazuje wersję bez pobierania i cen („Powiadom mnie o premierze”).
5. **Poprawka z PR #15:** `PlanPatchInput` budowano przez `.partial()` z polami z `default`; zod 4 stosuje domyślne wartości także tam, więc częściowa zmiana planu
   resetowała pozostałe pola. Patch ma teraz pola bez wartości domyślnych + test regresji.

## Konsekwencje
- (+) Jedno źródło prawdy dla wersji, ceny i funkcji; wydanie nowej wersji = wgranie pliku i jedno kliknięcie.
- (−) Treść landingu (opisy funkcji, FAQ) jest w kodzie — zmiana wymaga wdrożenia; ceny, plany i pobieranie sterowane są z panelu.
- (−) Bez podpisu kodu instalator wywoła ostrzeżenie SmartScreen (osobne zadanie właściciela: certyfikat podpisu w `folio-pdf`).
- (−) SHA-256 liczone w przeglądarce wymaga wczytania pliku do pamięci (limit 1 GB; dla 150–500 MB działa).
