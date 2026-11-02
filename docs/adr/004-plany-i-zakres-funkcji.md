# ADR 004 — Plany, katalog funkcji i zakres licencji

**Status:** przyjęty (2026-11-03) · rozwija ADR 003 · decyzje właściciela: zakres „moduły + funkcje”, licencja z planu jest samodzielna i edytowalna

## Kontekst
Właściciel chce tworzyć i usuwać plany i licencje oraz decydować, ile urządzeń, jakie moduły i które funkcje wchodzą do którego planu lub są darmowe.
Dziś aplikacja desktopowa zna cztery uprawnienia (`pro`, `print`, `vector`, `image`) i mapuje na nie moduły statycznie (`folio-pdf/src/shared/module-registry.ts`);
darmowe są moduły bez uprawnienia (`viewer`, `comments`). Najmniejszą „funkcją” w aplikacji jest dziś moduł (jego `id`).

## Decyzje
1. **Katalog funkcji** (`studio_features`, edytowalny w panelu): klucz = `id` modułu aplikacji, nazwa, uprawnienie wymagane dziś przez aplikację (lub brak = darmowa).
   Ziarno migracji = 19 modułów z rejestru aplikacji. Nowy moduł/funkcja w aplikacji = nowy wiersz, bez wdrożenia panelu.
2. **Plan** (`studio_plans`): nazwa, rozliczenie (wieczysta/subskrypcja), liczba miesięcy, limit urządzeń (1–10), lista funkcji, aktywność.
   Plan `free` (`kind = 'free'`, wstawiony migracją) jest jedyny, nieusuwalny i nie służy do wystawiania licencji — określa, co działa bez licencji.
   Plan płatny musi zawierać co najmniej jedną funkcję płatną (certyfikat wymaga ≥ 1 uprawnienia).
3. **Licencja = kopia planu** (`studio_licenses.plan_id` informacyjnie + `features`): zmiana albo usunięcie planu nie zmienia wystawionych licencji (`ON DELETE SET NULL`);
   zakres pojedynczej licencji można zmienić (`setFeatures`, uprawnienia wynikają z katalogu). `features = NULL` oznacza licencję sprzed planów — działa wg uprawnień.
4. **Certyfikat** niesie opcjonalne pole `features` (tylko gdy licencja ma jawny zakres). Aplikacja dziś parsuje payload schematem Zod, który **pomija nieznane pola**,
   więc starsze wersje działają bez zmian wg `entitlements`. Egzekwowanie pojedynczych funkcji i zakresu planu Free wymaga **osobnego PR w folio-pdf**
   (czytanie `features` z certyfikatu, a dla Free — z podpisanego katalogu lub stałej). Do tego czasu granularność efektywna to uprawnienie (np. plan z samym `ocr`
   odblokuje w starej aplikacji cały `pro`) — panel pokazuje to w opisie i raporcie, nie ukrywa.
5. **Cena (Paddle) ↔ plan**: `studio_prices.plan_id` (`ON DELETE RESTRICT`). Zakup z ceny powiązanej z planem wystawia licencję o jego zakresie i limicie urządzeń.
   Usunięcie planu z przypiętą ceną jest blokowane (`PLAN_IN_USE_BY_PRICES`).
6. **Usuwanie licencji**: trwałe, tylko dla licencji już unieważnionej i po wpisaniu e-maila klienta (`CONFIRM_MISMATCH`, `LICENSE_NOT_REVOKED`); urządzenia znikają kaskadowo,
   zamówienia i wykorzystania kodów zostają bez powiązania; wpis audytu `license.deleted` bez PII.
7. Migracja `0009` jest addytywna (3 kolumny, 2 tabele, ziarno); snapshot Neon przed scaleniem jak zawsze (ADR 002).

## Konsekwencje
- (+) Pełne CRUD planów, katalogu funkcji i licencji; te same plany zasilą Paddle i ręczne wystawianie.
- (+) Zgodność wsteczna: stare licencje i stare aplikacje bez zmian.
- (−) Egzekwowanie funkcji na poziomie pojedynczego modułu i darmowych funkcji z panelu wymaga zmiany w aplikacji desktopowej (osobne repo/PR).
- (−) Kody promocyjne (`free_license`/`trial`) nadal podają uprawnienia, nie plan — do rozważenia: wskazanie planu w kodzie.
