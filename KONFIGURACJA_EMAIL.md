# 📧 Konfiguracja Wysyłania Emaili

## Problem
Formularz kontaktowy nie wysyła emaili, ponieważ brakuje konfiguracji API Resend.

## Rozwiązanie Krok po Kroku

### 1️⃣ Utwórz konto Resend
1. Przejdź na: https://resend.com
2. Zarejestruj się (darmowe konto: 100 emaili/dzień, 3000/miesiąc)
3. Zaloguj się do panelu

### 2️⃣ Zweryfikuj domenę (lub użyj domeny testowej)

#### Opcja A: Domena testowa (dla testów)
- Resend automatycznie dostarcza domenę testową: `onboarding@resend.dev`
- Możesz wysyłać emaile TYLKO na swój własny adres email
- **To wystarczy do testowania formularza!**

#### Opcja B: Własna domena (dla produkcji)
1. W panelu Resend kliknij **"Domains"** → **"Add Domain"**
2. Wpisz swoją domenę: `syntance.com`
3. Dodaj rekordy DNS podane przez Resend:
   - `SPF` (TXT record)
   - `DKIM` (TXT record)
   - `DMARC` (TXT record)
4. Poczekaj na weryfikację (może potrwać do 48h)

### 3️⃣ Wygeneruj API Key
1. W panelu Resend kliknij **"API Keys"**
2. Kliknij **"Create API Key"**
3. Nadaj nazwę (np. "Syntance Web Form")
4. Wybierz uprawnienia: **"Sending access"**
5. Skopiuj wygenerowany klucz (zaczyna się od `re_...`)
   ⚠️ **WAŻNE**: Klucz jest widoczny tylko raz! Zapisz go bezpiecznie.

### 4️⃣ Utwórz plik .env.local

W głównym katalogu projektu utwórz plik `.env.local`:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://syntance.com

# Contact Form (Resend API)
RESEND_API_KEY=re_TWOJ_KLUCZ_API_TUTAJ
CONTACT_TO_EMAIL=kontakt@syntance.com

# WhatsApp
NEXT_PUBLIC_WHATSAPP_PHONE=+48662519544
```

**Zamień** `re_TWOJ_KLUCZ_API_TUTAJ` na swój prawdziwy klucz API.

### 5️⃣ Zrestartuj serwer deweloperski

```bash
# Zatrzymaj serwer (Ctrl+C)
# Uruchom ponownie
pnpm dev
```

### 6️⃣ Testowanie

#### Jeśli używasz domeny testowej:
- Formularz będzie działać TYLKO gdy wpiszesz adres email użyty do rejestracji w Resend
- Email przyjdzie na ten adres (nie na kontakt@syntance.com)

#### Jeśli używasz zweryfikowanej domeny:
- Formularz będzie wysyłać na `kontakt@syntance.com`
- Sprawdź folder SPAM (pierwsze emaile mogą tam trafić)

## 🔍 Sprawdzanie Problemów

### Problem: Email nie przychodzi
1. Sprawdź logi w Resend (zakładka "Logs")
2. Sprawdź folder SPAM
3. Sprawdź czy domena jest zweryfikowana
4. Upewnij się, że klucz API jest prawidłowy

### Problem: Błąd 500 w formularzu
- Sprawdź czy plik `.env.local` istnieje
- Sprawdź czy klucz API zaczyna się od `re_`
- Sprawdź console w przeglądarce (F12)

### Problem: "Too many requests"
- Resend ma limit 100 emaili/dzień na darmowym koncie
- Czekaj 30 sekund między wysyłkami (rate limiting w kodzie)

## 📝 Ważne Informacje

### Bezpieczeństwo
- ✅ Plik `.env.local` jest w `.gitignore` - NIE zostanie wysłany do GitHub
- ✅ Nigdy nie udostępniaj klucza API publicznie
- ✅ Dla Vercel: dodaj zmienne środowiskowe w panelu Vercel (Settings → Environment Variables)

### Limity Resend (darmowe konto)
- 100 emaili/dzień
- 3,000 emaili/miesiąc
- 1 domena zweryfikowana

### Produkcja (Vercel)
Po wdrożeniu na Vercel:
1. Przejdź do: Settings → Environment Variables
2. Dodaj:
   - `RESEND_API_KEY` = twój klucz
   - `CONTACT_TO_EMAIL` = kontakt@syntance.com
3. Redeploy aplikacji

## ✅ Gotowe!
Po wykonaniu tych kroków formularz kontaktowy będzie w pełni funkcjonalny! 🎉

