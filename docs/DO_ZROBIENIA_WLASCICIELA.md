# Do zrobienia przez właściciela — panel Syntance Studio

Stan: etapy F1 (API licencji, auth) i F2 (zakładka w `/magazyn`) gotowe na branchu `feat/studio-panel`; F3 (moduły, Blob, katalog) w toku.
Decyzje: `docs/adr/001-studio-panel.md`.

## Przed pierwszym deployem (kolejność ma znaczenie)
| # | Zadanie | Gdzie | Uwagi |
| --- | --- | --- | --- |
| 1 | **Zmienić hasło admina i uznać stare za wycierone** — jawne hasło `Fv215…` było w repo (`.env.example`, `docs/booking-setup.md`, komentarz w `lib/admin-auth.ts`) i zostaje w historii gita | wszędzie, gdzie go używasz | Nowy system go nie używa, ale hasło mogło trafić do kopii repo. Rozważ czyszczenie historii (`git filter-repo`) — decyzja po Twojej stronie |
| 2 | Zrobić snapshot/punkt przywracania bazy Neon przed migracją `0006_studio_panel` | Neon → Branches/Restore | Migracja jest addytywna (nowe tabele), ale zasada: snapshot przed każdą migracją prod. Migracja uruchomi się w buildzie Vercel (`vercel-prebuild-db.mjs`) |
| 3 | Ustawić sekrety w Vercel (Sensitive): `ADMIN_COOKIE_SECRET` (jeśli brak), `ADMIN_ENC_KEY` (`openssl rand -base64 32`), `ADMIN_BOOTSTRAP_TOKEN` (`openssl rand -hex 24`), `UPSTASH_REDIS_REST_URL/TOKEN` | Vercel → Settings → Environment Variables | Bez Upstash logowanie jest odrzucane (fail-closed) |
| 4 | Po deployu wejść na `/magazyn/login` → „Pierwsza konfiguracja konta”: e-mail, hasło ≥14 znaków, token; zeskanować/wpisać sekret TOTP; **zapisać kody zapasowe** | przeglądarka | Zalogowanie starym hasłem już nie działa |
| 5 | **Usunąć `ADMIN_BOOTSTRAP_TOKEN`** z Vercel po utworzeniu konta; usunąć stare `ADMIN_EMAIL`/`ADMIN_PASSWORD` | Vercel | |
| 6 | Wygenerować parę kluczy licencji lokalnie: `pnpm studio:keygen`. Prywatny → Vercel `LICENSE_PRIVATE_KEY` (Sensitive); publiczny → CI aplikacji (`FOLIO_LICENSE_PUBLIC_KEY`) | lokalnie | Klucz prywatny nie może trafić do czatu, repo ani maila. Zrób kopię w menedżerze haseł |
| 7 | Skonfigurować Paddle: destynacja powiadomień `https://syntance.com/api/studio/v1/webhooks/paddle` (zdarzenia: `transaction.completed`, `subscription.updated`, `subscription.canceled`, `adjustment.created/updated`), sekret → `PADDLE_WEBHOOK_SECRET`; w checkout przekazywać `custom_data.email` | Paddle | Najpierw sandbox: kupić testowo i sprawdzić, że licencja powstaje (mapowanie jest w kodzie „do potwierdzenia”) |
| 8 | W panelu → Syntance Studio → Ceny: dodać mapowanie każdego `price_id` (plan, uprawnienia, miesiące aktualizacji) | `/magazyn/studio` | Bez mapowania webhook ignoruje zakup |
| 9 | Resend: zweryfikować domenę nadawcy, ustawić `LICENSE_FROM_EMAIL` (np. `licencje@syntance.com`) | Resend | |
| 10 | Aplikacja desktopowa (osobny PR w folio-pdf): `FOLIO_LICENSE_URL=https://syntance.com/api/studio`, adres katalogu, lista dozwolonych hostów | folio-pdf | Zadanie 18 z `DO_ZROBIENIA_PRZEZ_WLASCICIELA.md` w tamtym repo (klucz wydawcy) |

## Umowy powierzenia (DPA) i RODO
- Podpisać/zaakceptować DPA i zapisać w `docs/dpa/`: **Vercel** (hosting, Blob), **Neon** (baza), **Upstash** (limity — przechowuje hashe IP), **Resend** (e-mail z kluczem), **Paddle** (niezależny administrator płatności — regulamin sprzedaży/Merchant of Record).
- Dodać do polityki prywatności aplikacji i strony: jakie dane (e-mail, hash urządzenia, nazwa urządzenia), cel (licencja), retencja (zamówienia 5 lat, licencje do końca + 12 mies., audyt 12 mies.), odbiorcy (powyżej).
- Procedura praw osób: panel → Syntance Studio → Klienci → „Eksport JSON”/„Wymaż dane” (art. 15, 17, 20).
- Rocznie/kwartalnie: usuwać wpisy audytu starsze niż 12 mies. i anonimizować licencje wygasłe >12 mies. (zadanie cykliczne — job w planie).

## Domeny
- API i panel: `syntance.com` (`/api/studio/*`, `/magazyn`). Host `studio.syntance.com` zostaje stroną marketingową (rewrite w `vercel.json`) — **nie** kieruj aplikacji na ten host.

## Klucze (podsumowanie)
| Klucz | Gdzie żyje | Czego NIE robić |
| --- | --- | --- |
| Klucz wydawcy modułów/katalogu (Ed25519) | **offline u Ciebie** (menedżer haseł/sejf), podpis lokalnie `pnpm hub:tool` | nie wgrywać na Vercel/do bazy/repo |
| `LICENSE_PRIVATE_KEY` | sekret Vercel (Sensitive) + kopia offline | nie w repo, nie w czacie |
| `ADMIN_ENC_KEY` | sekret Vercel + kopia offline | utrata = konieczność ponownej konfiguracji TOTP (usuń wiersz `admin_users`, użyj tokenu) |
| `PADDLE_WEBHOOK_SECRET` | Vercel | |
