# System rezerwacji + Dashboard

## Co zostało zrobione

- `/porozmawiajmy` — publiczna strona z widgetem bookingu (bez navigation, `noindex`)
- `/admin` — panel do zarządzania (logowanie hasłem)
- Rezerwacje zapisują się w **Sanity** i tworzą wydarzenia w **Google Calendar** (wraz z linkiem Google Meet i zaproszeniem klienta jako attendee)
- Maile z potwierdzeniem idą przez **Resend** (z plikiem `.ics` fallback)
- Dashboard pokazuje nadchodzące rezerwacje, statystyki 7/30 dni, pozwala anulować rezerwacje (również w Google Calendar), dodawać manualne blokady czasu, edytować reguły (sloty, godziny pracy, bufory, horyzont)

## Setup — krok po kroku

### 1. Sanity (write token)

1. Wejdź na https://www.sanity.io/manage → Twój projekt → `API` → `Tokens`.
2. Utwórz token z rolą **Editor**.
3. Dodaj do env: `SANITY_API_WRITE_TOKEN=...`.

Po pierwszym uruchomieniu wejdź na `https://<twoj-sanity-id>.sanity.studio` i znajdziesz nowe sekcje: **Reguły rezerwacji**, **Blokady czasu**, **Rezerwacje spotkań** (edycja możliwa też z dashboardu).

### 2. Google Workspace — domain-wide delegation

**Cel:** service account ma działać w imieniu `kamil@syntance.com`, żeby:
- odczytywać busy z prywatnego kalendarza
- tworzyć eventy z linkiem Google Meet
- zapraszać klientów jako attendee (wysyła zaproszenia mailem)

**Kroki:**

1. **Google Cloud Console** → projekt, w którym będzie service account.
2. `IAM & Admin` → `Service Accounts` → `Create Service Account` (np. `booking-service`).
3. Po utworzeniu → `Keys` → `Add Key` → `Create new key` → `JSON`. Pobierz plik.
4. W ustawieniach service account zaznacz **Enable Google Workspace Domain-wide Delegation** i skopiuj `Unique ID` (client ID).
5. W **Google Calendar API** (`APIs & Services` → `Library`) włącz API dla projektu.
6. **Google Workspace Admin Console** (admin.google.com) → `Security` → `Access and data control` → `API controls` → `Domain-wide Delegation` → `Add new`:
   - Client ID: `Unique ID` z service accountu
   - OAuth Scopes: `https://www.googleapis.com/auth/calendar`
7. Dodaj do env:
   - `GOOGLE_CLIENT_EMAIL` — email service accountu (`...@...iam.gserviceaccount.com`)
   - `GOOGLE_PRIVATE_KEY` — zawartość klucza z JSON (pole `private_key`, z `\n` w stringu zamiast realnych newlinów)
   - `GOOGLE_CALENDAR_USER=kamil@syntance.com` — to konto jest impersonowane
   - `GOOGLE_CALENDAR_ID=primary` (albo konkretny kalendarz, jeśli masz dedykowany)

Bez domain-wide delegation Meet link nie jest generowany, a klient nie dostanie zaproszenia w kalendarzu.

### 3. Admin cookie secret

```bash
openssl rand -hex 32
```

Wrzuć do env jako `ADMIN_COOKIE_SECRET`.

### 4. Reszta env

```
ADMIN_EMAIL=kamil@syntance.com
ADMIN_PASSWORD=Fv215b0108
RESEND_API_KEY=...
NEXT_PUBLIC_SITE_URL=https://syntance.com
```

### 5. Vercel

Wszystkie env ustaw na `Production` + `Preview` (Vercel dashboard → Settings → Environment Variables).

Po deployu:
1. Wejdź na `https://syntance.com/admin/login`
2. Zaloguj się: `kamil@syntance.com` + `Fv215b0108`
3. Na `/admin` zobacz status integracji — zielone ✅ przy Google Calendar, Resend, Sanity
4. Przejdź na `/admin/regulamin` i skonfiguruj sloty (domyślnie: 10:00, 13:00, 16:00, pon–pt)
5. Zrób testową rezerwację na `/porozmawiajmy` — sprawdź czy:
   - event pojawił się w Twoim Google Calendar (z linkiem Meet)
   - klient (własny email) dostał zaproszenie z kalendarza
   - w `/admin/rezerwacje` pojawił się wpis

## Jak to działa (flow)

### Klient rezerwuje
```
klient → /porozmawiajmy
  → GET /api/meeting/slots?days=60        (daty z wolnymi slotami)
  → GET /api/meeting/slots?date=YYYY-MM-DD (godziny danego dnia)
  → POST /api/meeting-booking
        ├─ weryfikacja: czy slot dalej wolny
        ├─ Google Calendar events.insert (Meet + attendee + sendUpdates:'all')
        ├─ Sanity: dokument meetingBooking
        └─ Resend: mail do Ciebie + mail do klienta z ICS
```

### Ty zarządzasz
```
Ty → /admin
  → /admin/rezerwacje       (lista, anulowanie, oznaczenia)
  → /admin/blokady          (manualne blokady — urlopy, deep work)
  → /admin/regulamin        (godziny pracy, sloty, bufory)
  → /admin/linki            (Sanity Studio, Attio, Calendar, Resend)
```

### Sloty są wolne tylko wtedy, gdy:
1. Dzień jest w `workingDays` (pon–pt domyślnie)
2. Godzina jest w presetach albo mieści się w `workingHours*` (co `slotMinutes`)
3. Start jest co najmniej `minNoticeHours` godzin w przyszłości
4. Start NIE jest przed teraz + `maxAdvanceDays`
5. Slot (z buforami before/after) nie koliduje z:
   - żadnym eventem w Google Calendar
   - żadną manualną blokadą w Sanity

## Potencjalne problemy

- **„⚠ brak GOOGLE_CALENDAR_USER"** na dashboardzie — masz service account bez domain-wide delegation → dodaj `GOOGLE_CALENDAR_USER=kamil@syntance.com` po skonfigurowaniu DWD w Workspace Admin.
- **Meet link nie tworzy się** — Workspace user, pod którym impersonujesz, musi mieć prawo do tworzenia konferencji Meet (większość Workspace-ów ma to domyślnie).
- **Klient nie dostał zaproszenia z Google** — sprawdź w logach czy `events.insert` nie wyrzucił błędu. Fallback: ICS w mailu od Resend i tak idzie.
- **Strefa czasowa** — wszystko w `Europe/Warsaw`. Zmiana wymaga edycji `lib/booking-slots.ts` i reguł w Sanity (pole `timezone`).
