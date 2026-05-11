# 🔄 Migracja do organizacji Syntance

## ✅ Co zostało zaktualizowane

Projekt został przemigrowany z konta prywatnego `Kamil0108` na organizację **Syntance** (GitHub) i team **Syntance** (Vercel).

### Zaktualizowane pliki:

1. **Git Remote** - `git remote` wskazuje teraz na: `https://github.com/Syntance/syntance-web.git`
2. **app/layout.tsx** - Schema.org sameAs link
3. **VERCEL_DEPLOY.md** - Wszystkie odniesienia do Vercel dashboard i scope
4. **DEPLOYMENT.md** - Git remote URLs
5. **CHECKLIST.md** - GitHub Issues link
6. **GIT_SETUP.md** - Instrukcje tworzenia repo
7. **PROJECT_SUMMARY.md** - Linki do repo
8. **QUICKSTART.md** - Clone URL
9. **START_HERE.md** - Remote URL

## 🚀 Następne kroki

### 1. Sprawdź konfigurację Git

```bash
git remote -v
```

Powinno pokazać:
```
origin  https://github.com/Syntance/syntance-web.git (fetch)
origin  https://github.com/Syntance/syntance-web.git (push)
```

### 2. Upewnij się, że repo istnieje na GitHubie

Sprawdź czy repozytorium zostało utworzone w organizacji Syntance:
- https://github.com/Syntance/syntance-web

Jeśli nie istnieje, utwórz je:

#### Opcja A: Przez przeglądarkę
1. Wejdź na https://github.com/Syntance
2. Kliknij **New repository**
3. Nazwa: `syntance-web`
4. Opis: `Official website for Syntance - Next.js 14 + TypeScript + Tailwind CSS`
5. **NIE** zaznaczaj "Initialize with README"
6. Kliknij **Create repository**

#### Opcja B: Przez GitHub CLI
```bash
gh auth login
gh repo create Syntance/syntance-web --public --source=. --remote=origin
```

### 3. Push do nowego repo

```bash
# Jeśli repo jest puste (nowo utworzone)
git push -u origin main

# Jeśli repo już istnieje i ma kod
git pull origin main --rebase
git push origin main
```

### 4. Połącz z Vercel Team

#### Przez Vercel CLI (zalecane)

```bash
# Zainstaluj Vercel CLI (jeśli nie masz)
npm i -g vercel

# Zaloguj się
vercel login

# Link projekt z zespołem Syntance
vercel link

# Podczas konfiguracji wybierz:
# - Scope: Syntance (twój team)
# - Link to existing project?: Yes (jeśli projekt już istnieje) lub No (jeśli nowy)
# - Project name: syntance-web

# Deploy
vercel --prod
```

#### Przez Vercel Dashboard

1. Wejdź na https://vercel.com/new
2. **Wybierz team: Syntance** (w lewym górnym rogu)
3. Import Git Repository
4. Wybierz: `Syntance/syntance-web`
5. Framework Preset: **Next.js** (auto-detect)
6. Kliknij **Deploy**

### 5. Skonfiguruj zmienne środowiskowe w Vercel

Po połączeniu z Vercel, dodaj zmienne środowiskowe:

Vercel Dashboard → Project → Settings → Environment Variables:

```env
NEXT_PUBLIC_SITE_URL=https://syntance.com
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
CONTACT_TO_EMAIL=hello@syntance.com
NEXT_PUBLIC_WHATSAPP_PHONE=+48537110170
```

**Zastosuj dla:** Production, Preview, Development (wszystkie)

### 6. Skonfiguruj domeny

W Vercel Dashboard → Settings → Domains:

1. Dodaj: `syntance.com` (Production)
2. Dodaj: `studio.syntance.com` (Production)

Konfiguracja DNS u rejestratora:

```
# syntance.com
Type: A
Name: @
Value: 76.76.21.21

# studio.syntance.com
Type: CNAME
Name: studio
Value: cname.vercel-dns.com
```

### 7. Weryfikacja

Po konfiguracji sprawdź:

- [ ] `git remote -v` pokazuje organizację Syntance
- [ ] Repo istnieje na https://github.com/Syntance/syntance-web
- [ ] Vercel project jest w team Syntance
- [ ] Zmienne środowiskowe są ustawione
- [ ] Domeny są skonfigurowane
- [ ] Strona działa: https://syntance.com
- [ ] Subdomena działa: https://studio.syntance.com

## 🔧 Troubleshooting

### Problem: Repo Syntance/syntance-web nie istnieje na GitHubie

**Rozwiązanie:** Utwórz je ręcznie (patrz krok 2 powyżej)

### Problem: Push do GitHub jest rejected

**Rozwiązanie:**
```bash
# Jeśli stare repo Kamil0108/syntance-web ma nowszy kod
git pull https://github.com/Kamil0108/syntance-web.git main --rebase

# Następnie push do nowego
git push origin main
```

### Problem: Vercel nie widzi repo Syntance/syntance-web

**Rozwiązanie:**
1. Sprawdź czy organizacja Syntance ma zainstalowaną aplikację Vercel GitHub
2. Wejdź: https://github.com/organizations/Syntance/settings/installations
3. Znajdź "Vercel" i kliknij "Configure"
4. Upewnij się że repo `syntance-web` ma dostęp

### Problem: Nie mam dostępu do organizacji Syntance

**Rozwiązanie:**
- Sprawdź czy zostałeś dodany do organizacji Syntance na GitHubie
- Sprawdź czy masz rolę w team Syntance na Vercel
- Jeśli nie - dodaj swoje konto do organizacji/team

## 📊 Podsumowanie zmian

| Przed | Po |
|-------|-----|
| GitHub: `Kamil0108/syntance-web` | GitHub: `Syntance/syntance-web` |
| Vercel: Account `Kamil0108` | Vercel: Team `Syntance` |
| Remote: `github.com/Kamil0108/...` | Remote: `github.com/Syntance/...` |

## ✅ Checklist migracji

- [x] Zmieniono git remote na Syntance
- [x] Zaktualizowano wszystkie pliki dokumentacji
- [x] Zaktualizowano Schema.org w layout.tsx
- [ ] Utworzono repo na GitHub w organizacji Syntance
- [ ] Wykonano push do nowego repo
- [ ] Połączono projekt z Vercel team Syntance
- [ ] Skonfigurowano zmienne środowiskowe
- [ ] Skonfigurowano domeny
- [ ] Zweryfikowano działanie strony

---

**Data migracji:** 2025-10-24
**Status:** ✅ Konfiguracja zaktualizowana, gotowe do deployment

