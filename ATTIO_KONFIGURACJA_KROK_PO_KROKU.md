# Attio - Konfiguracja Infrastruktury CRM dla Syntance

Kompletny przewodnik tworzenia struktury CRM dla systemu rezerwacji.

---

## 🎯 Co stworzymy:

```
KONTAKTY (People)
├── Podstawowe dane (imię, email, telefon)
└── Powiązane projekty

PROJEKTY (Deals)
├── Pipeline: Oczekujące → Potwierdzone → W realizacji → Zakończone
├── Dane rezerwacji (ID, terminy, cena)
├── Szczegóły techniczne (dni, złożoność, elementy)
└── Historia komunikacji (notatki, statusy)

WIDOKI
├── Dashboard główny
├── Oczekujące rezerwacje (do akcji)
├── Potwierdzone projekty
└── Archiwum
```

---

## Krok 1: Wyczyść workspace (jeśli coś już jest)

1. **Settings** → **Workspace settings** → **Objects**
2. Jeśli masz jakieś testowe rekordy, usuń je:
   - Wejdź w **People** → zaznacz wszystkie → Delete
   - Wejdź w **Deals** → zaznacz wszystkie → Delete

---

## Krok 2: Skonfiguruj obiekt PEOPLE (Kontakty)

### 2.1 Podstawowe pola (już są domyślnie):
- ✅ Name
- ✅ Email addresses
- ✅ Phone numbers
- ✅ Categories (opcjonalne - możesz dodać tag "Klient")

### 2.2 Dodaj custom field (opcjonalnie):

**Settings** → **Objects** → **People** → **Configure**

Kliknij **"Add attribute"**:
- **Name:** `źródło` (lowercase!)
- **Type:** Select
- **Options:** 
  - `Konfigurator` (domyślnie)
  - `Kontakt bezpośredni`
  - `Polecenie`

---

## Krok 3: Skonfiguruj obiekt DEALS (Projekty)

**Settings** → **Objects** → **Deals** → **Configure**

### 3.1 Zmień nazwę obiektu (opcjonalnie):

**Object name:**
- Singular: `Projekt`
- Plural: `Projekty`

### 3.2 Skonfiguruj pole STATUS:

Znajdź pole **"Status"** → Edit → dodaj statusy:

```
Pipeline stages:
┌─────────────────────────────────┐
│ 🟡 Oczekujące                   │  ← Nowa rezerwacja
│   ↓                             │
│ 🟢 Potwierdzone                 │  ← Po akceptacji
│   ↓                             │
│ 🔵 W realizacji                 │  ← Projekt w trakcie
│   ↓                             │
│ ✅ Zakończone                   │  ← Projekt dostarczony
│                                 │
│ ❌ Odrzucone                    │  ← Termin niedostępny
└─────────────────────────────────┘
```

**Jak dodać:**
1. Kliknij na pole **Status**
2. **Edit attribute**
3. **List options** → dodaj kolejno:
   - `Oczekujące` (kolor: żółty 🟡)
   - `Potwierdzone` (kolor: zielony 🟢)
   - `W realizacji` (kolor: niebieski 🔵)
   - `Zakończone` (kolor: zielony jasny ✅)
   - `Odrzucone` (kolor: czerwony ❌)

### 3.3 Dodaj custom fields:

Kliknij **"Add attribute"** i dodaj po kolei:

#### A) Numer referencyjny
- **Name:** `booking_id`
- **Type:** Text
- **Description:** Unikalny numer rezerwacji (np. SYN-ABC123)

#### B) Daty realizacji
- **Name:** `start_date`
- **Type:** Date
- **Description:** Data rozpoczęcia projektu

- **Name:** `end_date`
- **Type:** Date
- **Description:** Szacowana data zakończenia

#### C) Finansowe
- **Name:** `deposit`
- **Type:** Currency
- **Currency:** PLN
- **Description:** Zaliczka do zapłaty

**UWAGA:** Pole **"Value"** już istnieje domyślnie - użyjemy go na cenę netto!

#### D) Szczegóły projektu
- **Name:** `days`
- **Type:** Number
- **Description:** Dni robocze realizacji

- **Name:** `complexity`
- **Type:** Select
- **Options:**
  - `Niska`
  - `Średnia`
  - `Wysoka`
  - `Bardzo wysoka`

#### E) Typ projektu
- **Name:** `project_type`
- **Type:** Select
- **Options:**
  - `Strona WWW`
  - `Sklep e-commerce`
  - `Aplikacja webowa`

---

## Krok 4: Stwórz Views (Widoki)

### 4.1 Dashboard główny

**Deals** → **+ New view** → **Table**

**Nazwa:** `📊 Dashboard`

**Kolumny do wyświetlenia:**
1. Name (nazwa projektu)
2. Status
3. Value (cena)
4. Start date
5. Days (dni)
6. People (klient)

**Sortowanie:** Status (Oczekujące na górze) → Start date (najnowsze)

### 4.2 Oczekujące rezerwacje

**Deals** → **+ New view** → **Table**

**Nazwa:** `⏳ Do akcji`

**Filter:**
- Status = `Oczekujące`

**Kolumny:**
1. Name
2. People (klient)
3. Start date
4. Value
5. Deposit
6. Days

**Sortowanie:** Start date (najwcześniejsze na górze)

> Ten widok pokazuje rezerwacje czekające na Twoją akceptację!

### 4.3 Potwierdzone projekty

**Deals** → **+ New view** → **Table**

**Nazwa:** `✅ Potwierdzone`

**Filter:**
- Status = `Potwierdzone` OR `W realizacji`

**Kolumny:**
1. Name
2. Status
3. People
4. Start date → End date
5. Days remaining (ręczna kalkulacja)
6. Value

**Sortowanie:** Start date (najbliższe na górze)

### 4.4 Archiwum

**Deals** → **+ New view** → **Table**

**Nazwa:** `📁 Archiwum`

**Filter:**
- Status = `Zakończone` OR `Odrzucone`

**Kolumny:**
1. Name
2. Status
3. People
4. Start date
5. Value

**Sortowanie:** Start date (najnowsze na górze)

---

## Krok 5: Stwórz szablony notatek (opcjonalnie)

**Settings** → **Templates** → **+ New template**

### Szablon 1: Kick-off Call
```
Nazwa: 📞 Kick-off Call

Treść:
# Kick-off Call

Data: [DD.MM.YYYY]
Uczestnicy: [Klient], [Ty]

## Ustalenia:
- [ ] Dostęp do hostingu
- [ ] Dostęp do domeny
- [ ] Materiały graficzne (logo, zdjęcia)
- [ ] Treści na stronę

## Następne kroki:
1. 
2. 
3. 

## Deadline: [DD.MM.YYYY]
```

### Szablon 2: Odbiór projektu
```
Nazwa: ✅ Odbiór projektu

Treść:
# Odbiór projektu

Data: [DD.MM.YYYY]

## Dostarczone:
- [ ] Strona opublikowana
- [ ] Instrukcja obsługi CMS
- [ ] Dane do logowania
- [ ] Dokumentacja techniczna

## Feedback klienta:


## Status płatności:
- [ ] Zaliczka zapłacona
- [ ] Pozostała kwota zapłacona

## Follow-up: [+30 dni]
```

---

## Krok 6: Dostosuj notyfikacje (opcjonalnie)

**Settings** → **Notifications**

Włącz powiadomienia dla:
- ✅ New deal created (nowa rezerwacja)
- ✅ Deal status changed (zmiana statusu)
- ✅ New note added (nowa notatka)

---

## Krok 7: Dodaj integracje (opcjonalnie)

**Settings** → **Integrations**

Możesz połączyć z:
- **Google Calendar** - synchronizacja terminów
- **Slack** - powiadomienia o nowych rezerwacjach
- **Zapier** - dodatkowe automatyzacje

---

## 🎯 Podsumowanie struktury

```
📊 TWÓJ CRM JEST GOTOWY!

┌─────────────────────────────────────────┐
│  PEOPLE (Kontakty)                      │
│  ├── Imię, email, telefon               │
│  └── Źródło (Konfigurator)              │
└─────────────────────────────────────────┘
           │
           ├── powiązany z
           ↓
┌─────────────────────────────────────────┐
│  DEALS (Projekty)                       │
│  ├── Status (pipeline 5 etapów)         │
│  ├── Booking ID (SYN-XXX)               │
│  ├── Daty (start_date, end_date)        │
│  ├── Finansowe (value, deposit)         │
│  ├── Szczegóły (days, complexity)       │
│  └── Notatki (elementy, komunikacja)    │
└─────────────────────────────────────────┘
           │
           └─── widoki:
                ├── Dashboard (wszystko)
                ├── Do akcji (oczekujące)
                ├── Potwierdzone (w pracy)
                └── Archiwum (historia)
```

---

## ✅ Checklist końcowy

Sprawdź czy masz wszystko:

**People:**
- [x] Name, Email, Phone (domyślnie)
- [ ] Pole "źródło" (opcjonalne)

**Deals:**
- [ ] Statusy: Oczekujące, Potwierdzone, W realizacji, Zakończone, Odrzucone
- [ ] Pole: booking_id (text)
- [ ] Pole: start_date (date)
- [ ] Pole: end_date (date)
- [ ] Pole: deposit (currency PLN)
- [ ] Pole: days (number)
- [ ] Pole: complexity (select)
- [ ] Pole: project_type (select)

**Views:**
- [ ] Dashboard
- [ ] Do akcji (filtered: Oczekujące)
- [ ] Potwierdzone (filtered: Potwierdzone + W realizacji)
- [ ] Archiwum (filtered: Zakończone + Odrzucone)

---

## 🚀 Testowanie

Po skonfigurowaniu:

1. **Ręczny test:**
   - Stwórz testowy kontakt w People
   - Stwórz testowy Deal z wszystkimi polami
   - Sprawdź czy widoki działają

2. **Test automatyczny:**
   - Przejdź do konfiguratora na stronie
   - Zarezerwuj termin
   - Sprawdź czy pojawił się w Attio w widoku "Do akcji"

3. **Test akceptacji:**
   - Kliknij "Akceptuj" w emailu
   - Sprawdź czy status zmienił się na "Potwierdzone"
   - Sprawdź czy dodała się notatka

---

## 💡 Wskazówki:

- **Nazwy pól:** Używaj `lowercase_with_underscores` (np. `booking_id`, nie `Booking ID`)
- **Statusy:** Nazwy dokładnie jak w instrukcji (wielkość liter ma znaczenie!)
- **Widoki:** Możesz dodać więcej według potrzeb
- **Pola opcjonalne:** Możesz pominąć niektóre custom fields, ale `booking_id` jest kluczowe

---

Gotowe? Powiedz jak poszła konfiguracja! 🎉
