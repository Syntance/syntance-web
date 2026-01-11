# Konfigurator Cennika z Sanity CMS

## Przegląd

Interaktywny konfigurator cennika pozwalający klientom na wybór elementów projektu i zobaczenie orientacyjnej wyceny w czasie rzeczywistym.

**Demo:** `/studio/cennik`

## Konfiguracja

### 1. Utwórz projekt Sanity

```bash
# Zaloguj się do Sanity
npx sanity login

# Utwórz nowy projekt (lub użyj istniejącego)
npx sanity init --project-plan free
```

### 2. Skonfiguruj zmienne środowiskowe

Skopiuj i uzupełnij w `.env.local`:

```env
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=twoj_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_WRITE_TOKEN=twoj_write_token
SANITY_REVALIDATE_SECRET=losowy_secret_do_webhookow
```

### 3. Utwórz token API w Sanity

1. Idź do [manage.sanity.io](https://manage.sanity.io)
2. Wybierz swój projekt
3. Settings → API → Tokens
4. Utwórz nowy token z uprawnieniami "Editor" lub "Deploy studio"

### 4. Załaduj dane początkowe

```bash
# Ustaw zmienne środowiskowe
$env:NEXT_PUBLIC_SANITY_PROJECT_ID="twoj_project_id"
$env:NEXT_PUBLIC_SANITY_DATASET="production"
$env:SANITY_API_WRITE_TOKEN="twoj_token"

# Uruchom seed script
npx ts-node --esm sanity/seed-pricing.ts
```

### 5. Uruchom Sanity Studio

Możesz używać Sanity Studio na dwa sposoby:

#### A) Hostowane przez Sanity (zalecane)

```bash
npx sanity deploy
```

Studio będzie dostępne pod adresem `https://twoj-projekt.sanity.studio`

#### B) Lokalnie w developerze

```bash
npx sanity dev
```

Studio będzie dostępne pod adresem `http://localhost:3333`

### 6. Skonfiguruj webhook dla rewalidacji (opcjonalnie)

1. Idź do [manage.sanity.io](https://manage.sanity.io) → Webhooks
2. Utwórz nowy webhook:
   - **URL:** `https://syntance.com/api/revalidate?secret=TWOJ_SECRET`
   - **Trigger on:** Create, Update, Delete
   - **Filter:** `_type in ["pricingCategory", "projectType", "pricingItem", "pricingConfig"]`

## Struktura plików

```
sanity/
├── schemas/
│   ├── index.ts           # Export schematów
│   ├── pricingCategory.ts # Kategorie cennika
│   ├── projectType.ts     # Typy projektów
│   ├── pricingItem.ts     # Elementy cennika
│   └── pricingConfig.ts   # Konfiguracja globalna
├── queries/
│   └── pricing.ts         # GROQ queries + typy TS
├── lib/
│   ├── client.ts          # Klient Sanity
│   └── fetch.ts           # Funkcja fetch z cache
├── sanity.config.ts       # Konfiguracja Sanity
└── seed-pricing.ts        # Skrypt seedowania

components/
├── PricingConfigurator.tsx           # Główny komponent
└── sections/
    └── pricing-configurator-section.tsx  # Sekcja z animacją

app/
├── (marketing)/studio/cennik/
│   └── page.tsx           # Dedykowana strona cennika
└── api/revalidate/
    └── route.ts           # Webhook rewalidacji
```

## Typy projektów

| ID        | Nazwa           | Cena bazowa |
|-----------|-----------------|-------------|
| website   | Strona WWW      | od 5,000 PLN |
| ecommerce | Sklep e-commerce| od 20,000 PLN|
| webapp    | Aplikacja webowa| od 30,000 PLN|

## Kategorie cennika

1. **Baza projektu** - Obowiązkowe elementy
2. **Podstrony** - Dodatkowe strony
3. **Sekcje** - Komponenty i sekcje
4. **Funkcje** - Zaawansowane funkcjonalności
5. **Integracje** - Zewnętrzne usługi
6. **Płatności** - Bramki płatności (e-commerce)
7. **Dostawa** - Integracje kurierskie (e-commerce)

## Logika kalkulacji

```typescript
// Pseudokod
let totalPrice = 0
let percentageAdd = 0

// Sumuj ceny wybranych elementów
for (item of selectedItems) {
  if (item.percentageAdd) {
    percentageAdd += item.percentageAdd
  } else {
    totalPrice += item.price * quantity
  }
}

// Aplikuj procentowe dodatki
if (percentageAdd > 0) {
  totalPrice *= (1 + percentageAdd / 100)
}

// Kalkuluj
priceNetto = totalPrice
priceBrutto = totalPrice * (1 + VAT_RATE / 100)
deposit = max(DEPOSIT_FIXED, priceNetto * DEPOSIT_PERCENT / 100)
```

## API

### GET /api/revalidate?tag=pricing

Ręczna rewalidacja cache.

### POST /api/revalidate

Webhook dla Sanity. Automatycznie rewaliduje cache po zmianach w CMS.

## Dostosowanie

### Dodawanie nowych elementów

1. Idź do Sanity Studio
2. Utwórz nowy "Element cennika"
3. Wypełnij pola i przypisz do kategorii/typów projektów
4. Cache zostanie automatycznie odświeżony (webhook) lub ręcznie `/api/revalidate?tag=pricing`

### Zmiana stylów

Komponent używa Tailwind CSS. Główne style:
- Ciemny motyw z gradientami
- Purple/blue jako kolory akcentowe
- Glassmorphism efekty

## Integracje

### Calendly

Ustaw `calendlyUrl` w konfiguracji Sanity. Przycisk "Zarezerwuj termin" przekieruje do Calendly z parametrami wyceny.

### PDF (TODO)

Funkcja generowania PDF z wyceny wymaga dodatkowej implementacji (np. @react-pdf/renderer).

## Troubleshooting

### Brak danych w konfiguratorze

1. Sprawdź czy zmienne środowiskowe są poprawne
2. Uruchom seed script: `npx ts-node --esm sanity/seed-pricing.ts`
3. Sprawdź konsolę przeglądarki na błędy

### Zmiany nie są widoczne

1. Sprawdź webhook w Sanity
2. Ręcznie wywołaj `/api/revalidate?tag=pricing`
3. W development mode restart serwera

---

© Syntance Studio
