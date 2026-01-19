# SEO dla Podstron - Instrukcja

## 📝 Jak edytować SEO dla konkretnej strony w Sanity

### 1. Wejdź do Sanity Studio
https://syntance.sanity.studio/

### 2. Znajdź "📄 SEO Podstron"
W menu po lewej zobaczysz:
```
🔍 SEO Globalne (domyślne)
📄 SEO Podstron              <-- TUTAJ
─────────────────────
💰 Ustawienia cennika
```

### 3. Wybierz stronę lub dodaj nową
Lista istniejących stron:
- ✅ Strona główna (/)
- ✅ Cennik (/cennik)
- ✅ O nas (/o-nas)
- ✅ Polityka prywatności (/polityka-prywatnosci)
- ✅ Regulamin (/regulamin)

---

## 🎯 Pola do wypełnienia

### Podstawowe
- **Nazwa strony** - np. "Cennik" (wewnętrzna nazwa)
- **URL strony (slug)** - np. "/cennik"
- **Aktywna** - czy SEO tej strony jest włączone

### Meta tagi
- **Tytuł strony** - max 60 znaków, widoczny w Google
- **Opis strony** - max 160 znaków, widoczny w Google
- **Canonical URL** - opcjonalnie, jeśli różny od domyślnego

### Słowa kluczowe
- **Główne słowo kluczowe** - jedno najważniejsze (np. "cennik stron Next.js")
- **Dodatkowe słowa kluczowe** - lista tagów
- **Notatka o gęstości** - gdzie używać focus keyword

### Social Media
- **OG Title** - dla Facebook/LinkedIn
- **OG Description** - opis przy udostępnianiu
- **OG Image** - obrazek 1200x630px

### Notatki SEO
- Notatki o strategii, konkurencji, itp.

---

## 🔄 Jak to działa

### Hierarchia SEO:
1. **SEO Podstrony** (najwyższy priorytet)
2. **SEO Globalne** (fallback)
3. **Hardcoded wartości** (ostateczny fallback)

### Przykład:
```
Strona: /cennik

1. System sprawdza: Czy istnieje "SEO Podstrony" dla "/cennik"?
   ✅ Tak - używa: "Cennik stron i sklepów Next.js | Od 5000 PLN"
   
2. Jeśli nie - używa globalnego: "Syntance — Strony i sklepy Next.js"
```

---

## 🚀 Jak dodać SEO dla nowej strony

### W Sanity Studio:
1. Kliknij "📄 SEO Podstron"
2. Kliknij "+ Utwórz dokument"
3. Wypełnij pola:
   - Nazwa strony: "Blog"
   - Slug: "/blog"
   - Focus keyword: "blog Next.js"
   - Tytuł: "Blog o Next.js i web development | Syntance"
   - Opis: "Artykuły o Next.js, React, TypeScript..."
4. Kliknij "Publish"

### W kodzie (jeśli chcesz użyć w konkretnym komponencie):
```typescript
// app/cennik/page.tsx
import { generateSeoMetadata } from '@/lib/seo'

export async function generateMetadata() {
  return generateSeoMetadata('/cennik')
}
```

---

## 📊 Monitoring i Analityka

### Sprawdź w Sanity:
- **Ostatnia aktualizacja SEO** - automatycznie zapisywana
- **Notatki SEO** - dodaj informacje o konkurencji, strategii

### Sprawdź w Google:
```
site:syntance.com/cennik
```

### Rich Results Test:
https://search.google.com/test/rich-results

---

## ✅ Checklist dla nowej podstrony

- [ ] Utwórz dokument "SEO Podstrony" w Sanity
- [ ] Ustaw unikalny slug (URL)
- [ ] Wybierz jedno główne słowo kluczowe (focus keyword)
- [ ] Napisz unikalny tytuł (max 60 znaków)
- [ ] Napisz unikalny opis (max 160 znaków)
- [ ] Dodaj 3-5 dodatkowych słów kluczowych
- [ ] Sprawdź czy title i description zawierają focus keyword
- [ ] Dodaj notatki SEO (konkurencja, strategia)
- [ ] Ustaw jako "Aktywna"
- [ ] Zapisz i opublikuj

---

## 🔍 Przykłady dobrych focus keywords

### Strona główna (/)
- "strony Next.js"
- "tworzenie stron Next.js"

### Cennik (/cennik)
- "cennik stron Next.js"
- "ile kosztuje strona Next.js"

### O nas (/o-nas)
- "studio Next.js Polska"
- "agencja Next.js"

### Portfolio (/portfolio)
- "portfolio stron Next.js"
- "realizacje Next.js"

---

## 💡 Dobre praktyki

1. **Jeden focus keyword na stronę** - nie kannibalizuj SEO
2. **Unikalny tytuł i opis** - każda strona inna
3. **Keyword w title** - najlepiej na początku
4. **Keyword w description** - naturalnie
5. **Notatki o konkurencji** - śledź co robią inni
6. **Aktualizuj regularnie** - sprawdzaj pozycje co miesiąc
