# Konfiguracja Google Calendar dla systemu rezerwacji

System rezerwacji automatycznie:
1. Sprawdza Twoją dostępność w Google Calendar
2. Pokazuje klientom tylko terminy z wystarczającą ilością wolnych dni
3. Po rezerwacji blokuje wybrane dni w kalendarzu

## Zmienne środowiskowe

Dodaj do `.env.local`:

```bash
# Google Calendar API
GOOGLE_CLIENT_EMAIL=twoje-konto-serwisowe@projekt.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTWÓJ_KLUCZ_PRYWATNY\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=primary  # lub email kalendarza

# Istniejące już zmienne
RESEND_API_KEY=re_xxx
CONTACT_TO_EMAIL=twoj@email.com
NEXT_PUBLIC_SITE_URL=https://syntance.com
```

## Krok po kroku: Konfiguracja Google Calendar API

### 1. Utwórz projekt w Google Cloud Console

1. Przejdź do [Google Cloud Console](https://console.cloud.google.com/)
2. Kliknij "Select a project" → "New Project"
3. Nazwij projekt (np. "Syntance Calendar")
4. Kliknij "Create"

### 2. Włącz Google Calendar API

1. Przejdź do [APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. Wyszukaj "Google Calendar API"
3. Kliknij na wynik i naciśnij "Enable"

### 3. Utwórz Service Account

1. Przejdź do [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Kliknij "Create Credentials" → "Service Account"
3. Wypełnij:
   - Name: `syntance-calendar`
   - ID: automatycznie wygenerowany
4. Kliknij "Create and Continue"
5. Pomiń opcjonalne kroki, kliknij "Done"

### 4. Pobierz klucz JSON

1. Na liście Service Accounts kliknij na utworzone konto
2. Przejdź do zakładki "Keys"
3. Kliknij "Add Key" → "Create new key"
4. Wybierz "JSON" i kliknij "Create"
5. Plik JSON zostanie pobrany

### 5. Wyodrębnij dane z JSON

Otwórz pobrany plik JSON i skopiuj:
- `client_email` → `GOOGLE_CLIENT_EMAIL`
- `private_key` → `GOOGLE_PRIVATE_KEY` (z cudzysłowami!)

### 6. Udostępnij kalendarz dla Service Account

1. Otwórz [Google Calendar](https://calendar.google.com/)
2. Znajdź swój kalendarz na liście po lewej
3. Kliknij ⋮ (trzy kropki) → "Settings and sharing"
4. Przewiń do "Share with specific people or groups"
5. Kliknij "Add people and groups"
6. Wklej `client_email` z poprzedniego kroku
7. Ustaw uprawnienia na: **"Make changes to events"** (Modyfikowanie wydarzeń)
8. Kliknij "Send"

### 7. Znajdź Calendar ID

- Dla głównego kalendarza: `primary`
- Dla innego kalendarza:
  1. W ustawieniach kalendarza przewiń do "Integrate calendar"
  2. Skopiuj "Calendar ID" (np. `abc123@group.calendar.google.com`)

## Jak działa system

### Sprawdzanie dostępności (`GET /api/availability?days=10`)

1. Pobiera zajętość z Google Calendar na 3 miesiące w przód
2. Analizuje które dni są wolne (Pon-Pt)
3. Znajduje daty gdzie jest minimum X kolejnych dni roboczych wolnych
4. Zwraca:
   - `availableStartDates` - daty gdzie można rozpocząć projekt
   - `busyDays` - zajęte dni (wyświetlane jako czerwone)

### Blokowanie kalendarza (`POST /api/availability`)

Po rezerwacji:
1. Tworzy wydarzenie całodniowe na wybrane dni
2. Tytuł: `🚀 Realizacja: [Typ projektu] - [Nazwa klienta]`
3. Kolor: niebieski
4. Blokuje czas jako "zajęty"

## Testowanie

### Bez Google Calendar (fallback)

System działa nawet bez skonfigurowanego Google Calendar:
- Wszystkie dni robocze będą pokazane jako dostępne
- Rezerwacje zostaną wysłane emailem, ale kalendarz nie będzie zablokowany

### Z Google Calendar

```bash
# Test dostępności
curl "http://localhost:3000/api/availability?days=10"

# Powinno zwrócić:
{
  "availableStartDates": ["2026-01-15", "2026-01-20", ...],
  "busyDays": ["2026-01-14", ...],
  "requiredDays": 10
}
```

## Ręczne blokowanie terminów

Aby zablokować termin (np. urlop):
1. Dodaj wydarzenie w Google Calendar na te dni
2. System automatycznie wykryje zajętość
3. Klienci nie będą mogli wybrać tych terminów

## Troubleshooting

### "Calendar API error" w logach

- Sprawdź czy `GOOGLE_PRIVATE_KEY` ma poprawny format (z `\n`)
- Sprawdź czy Service Account ma dostęp do kalendarza
- Sprawdź czy Calendar API jest włączone w projekcie

### Brak dostępnych terminów

- Sprawdź czy kalendarz nie jest przepełniony wydarzeniami
- Zwiększ `months` parametr (np. `?days=10&months=6`)

### Wydarzenia nie pojawiają się w kalendarzu

- Sprawdź uprawnienia Service Account (potrzebne "Make changes to events")
- Sprawdź `GOOGLE_CALENDAR_ID` - musi być prawidłowy
