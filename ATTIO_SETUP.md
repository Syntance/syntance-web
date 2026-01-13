# Konfiguracja Attio CRM

System automatycznie wysyła wszystkie rezerwacje do Attio CRM, gdzie możesz:
- 👥 Zarządzać kontaktami klientów
- 💼 Śledzić projekty w pipeline
- 📊 Analizować wartość zleceń
- 📝 Dodawać notatki i komunikację
- ✅ Zarządzać statusami (Oczekujące → Potwierdzone → W realizacji → Zakończone)

---

## Krok 1: Załóż konto w Attio

1. Wejdź na **https://attio.com**
2. Kliknij **"Get started for free"**
3. Załóż konto (email + hasło)
4. Wybierz plan **Free** (3 użytkowników, unlimited contacts & deals)

---

## Krok 2: Skonfiguruj Workspace

Po zalogowaniu:

1. **Settings** (lewy dolny róg) → **Workspace settings**
2. Upewnij się że masz utworzone obiekty:
   - **People** (kontakty) ✅
   - **Deals** (projekty/zlecenia) ✅

---

## Krok 3: Dodaj Custom Fields do Deals

Aby system mógł zapisywać wszystkie dane, dodaj pola:

1. **Objects** → **Deals** → **Configure**
2. Kliknij **"Add attribute"** i dodaj:

| Nazwa pola | Typ | Opis |
|------------|-----|------|
| `booking_id` | Text | Numer referencyjny (np. SYN-ABC123) |
| `start_date` | Date | Data startu projektu |
| `end_date` | Date | Data końca projektu |
| `days` | Number | Dni robocze realizacji |
| `deposit` | Currency | Zaliczka (PLN) |
| `complexity` | Select | Złożoność: Niska / Średnia / Wysoka / Bardzo wysoka |

**Ważne:** Pola nie są wymagane - system działa też bez nich, ale stracisz część danych.

---

## Krok 4: Pobierz API Key

1. **Settings** → **Developers** (w lewym menu)
2. Kliknij **"API Keys"**
3. **"Create API key"**
4. Nadaj nazwę np. `Syntance Website`
5. Uprawnienia: **Read & Write** (pełny dostęp)
6. Kliknij **"Create"**
7. **Skopiuj klucz** (pokazuje się tylko raz!)

---

## Krok 5: Dodaj klucz do .env.local

Otwórz `.env.local` i wklej:

```bash
# Attio CRM
ATTIO_API_KEY=twoj_klucz_api_tutaj
```

Zapisz plik i zrestartuj serwer dev (`pnpm dev`).

---

## Krok 6: Skonfiguruj pipeline (opcjonalne)

Dla lepszej organizacji możesz utworzyć statusy:

1. **Objects** → **Deals** → **Configure**
2. Znajdź pole **"Status"**
3. Dodaj statusy:
   - 🟡 **Oczekujące** - nowa rezerwacja, czeka na akceptację
   - 🟢 **Potwierdzone** - zaakceptowane, czeka na płatność
   - 🔵 **W realizacji** - projekt w trakcie
   - ✅ **Zakończone** - projekt dostarczony
   - ❌ **Odrzucone** - termin niedostępny

System automatycznie ustawi status na podstawie akcji w emailach.

---

## Jak działa integracja

### Po rezerwacji klienta:
```
1. Klient wypełnia formularz + wybiera termin
2. ↓
3. System tworzy/aktualizuje kontakt w Attio (People)
4. ↓
5. Tworzy Deal (projekt) z danymi:
   - Nazwa: "Strona WWW - Jan Kowalski"
   - Wartość: 8,500 PLN
   - Status: Oczekujące
   - Start date: 20 stycznia 2026
   - Notatka: lista wybranych elementów
```

### Po kliknięciu "Akceptuj":
```
1. Status zmienia się na: Potwierdzone
2. Dodawana jest notatka: "Zlecenie zaakceptowane [data/czas]"
3. Klient dostaje email z instrukcjami płatności
```

### Po kliknięciu "Odrzuć":
```
1. Status zmienia się na: Odrzucone
2. Dodawana jest notatka: "Zlecenie odrzucone - termin niedostępny"
3. Klient dostaje email z przeprosinami
```

---

## Testowanie

1. Uruchom serwer: `pnpm dev`
2. Wejdź na konfigurator
3. Wybierz elementy → Zarezerwuj termin
4. Wypełnij formularz i wybierz datę
5. **Sprawdź Attio:**
   - Nowy kontakt w **People**
   - Nowy projekt w **Deals** ze statusem "Oczekujące"

---

## Troubleshooting

### "Failed to create project in Attio" w logach

**Możliwe przyczyny:**
1. Nieprawidłowy `ATTIO_API_KEY` - sprawdź czy klucz jest prawidłowy
2. Brak uprawnień - upewnij się że API key ma Read & Write
3. Workspace nie ma obiektów People/Deals - sprawdź w Settings

### Kontakt się tworzy, ale Deal nie

Najprawdopodobniej Attio nie rozpoznaje pól. Sprawdź:
1. Czy masz obiekt `deals` (nie `opportunities`)?
2. Czy nazwy pól są małymi literami z podkreślnikami (`booking_id`, nie `Booking ID`)?

### Custom fields nie zapisują się

Attio API wymaga dokładnych nazw pól. Sprawdź w **Settings > Objects > Deals > Configure** dokładną nazwę atrybutu (np. `booking_id` vs `booking-id`).

Możesz też edytować `lib/attio.ts` i dostosować nazwy do swoich pól.

---

## Bezpieczeństwo

- ✅ API Key **NIE jest** wysyłany do przeglądarki
- ✅ Wszystkie zapytania idą z serwera Next.js
- ✅ Klucz jest w `.env.local` (ignorowany przez git)
- ✅ System działa nawet jeśli Attio nie odpowiada (failsafe)

---

## Koszty

Plan Free w Attio:
- ✅ 3 użytkowników
- ✅ Unlimited kontaktów
- ✅ Unlimited deals
- ✅ API access
- ✅ 5,000 API calls/miesiąc (wystarczy na ~150 rezerwacji)

Jeśli przekroczysz limity, Attio automatycznie zaproponuje upgrade.

---

## Potrzebujesz pomocy?

- [Attio Documentation](https://developers.attio.com)
- [Attio Support](https://attio.com/support)
