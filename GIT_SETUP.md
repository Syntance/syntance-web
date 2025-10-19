# 🔧 Konfiguracja Git i GitHub - Syntance Web

## 📦 Inicjalizacja repozytorium

### 1. Inicjalizacja lokalnego repo

```bash
git init
git add .
git commit -m "Initial commit: Syntance Web - Next.js 14 + TypeScript + Tailwind"
```

### 2. Utworzenie repo na GitHub

#### Opcja A: Przez przeglądarkę

1. Wejdź na https://github.com/Kamil0108
2. Kliknij **New repository**
3. Nazwa: `syntance-web`
4. Opis: `Official website for Syntance - Next.js 14 + TypeScript + Tailwind CSS`
5. **NIE** zaznaczaj "Initialize with README" (mamy już pliki)
6. Kliknij **Create repository**

#### Opcja B: Przez GitHub CLI

```bash
gh repo create syntance-web --public --source=. --remote=origin --push
```

### 3. Połączenie z GitHub

```bash
git remote add origin https://github.com/Kamil0108/syntance-web.git
git branch -M main
git push -u origin main
```

## 📝 Konwencje commitów

### Format commitów (Conventional Commits)

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Typy commitów

- `feat`: Nowa funkcjonalność
- `fix`: Naprawa błędu
- `docs`: Zmiany w dokumentacji
- `style`: Formatowanie, brakujące średniki (bez zmian w kodzie)
- `refactor`: Refaktoryzacja kodu
- `perf`: Poprawa wydajności
- `test`: Dodanie lub modyfikacja testów
- `chore`: Zmiany w build, zależnościach, etc.

### Przykłady

```bash
# Nowa funkcjonalność
git commit -m "feat(studio): add pricing section with 3 tiers"

# Naprawa błędu
git commit -m "fix(navbar): resolve mobile menu overflow issue"

# Dokumentacja
git commit -m "docs: update README with deployment instructions"

# Stylowanie
git commit -m "style: format all files with Prettier"

# Refaktoryzacja
git commit -m "refactor(components): extract Container to separate file"

# Wydajność
git commit -m "perf(images): optimize hero images with next/image"

# Chore
git commit -m "chore(deps): update Next.js to 14.0.5"
```

## 🌿 Workflow Git

### Praca z feature branches

```bash
# Utwórz nowy branch dla funkcjonalności
git checkout -b feature/blog-section

# Pracuj nad kodem...
git add .
git commit -m "feat(blog): add blog listing page"

# Push do GitHub
git push origin feature/blog-section

# Utwórz Pull Request na GitHub
# Po review i merge, usuń branch lokalnie
git checkout main
git pull origin main
git branch -d feature/blog-section
```

### Szybkie poprawki (hotfix)

```bash
git checkout -b hotfix/navbar-link
git add .
git commit -m "fix(navbar): correct Studio link href"
git push origin hotfix/navbar-link
# Merge przez PR
```

## 🔀 Branching strategy

### Main branches

- `main` - Production (zawsze deployable)
- `develop` - Development (opcjonalnie)

### Supporting branches

- `feature/*` - Nowe funkcjonalności
- `hotfix/*` - Pilne poprawki
- `bugfix/*` - Naprawy błędów
- `refactor/*` - Refaktoryzacja

### Przykład

```
main
  └── feature/contact-form
  └── feature/testimonials
  └── hotfix/mobile-nav
```

## 📋 Checklist przed commitem

```bash
# 1. Sprawdź status
git status

# 2. Sprawdź zmiany
git diff

# 3. Lint
pnpm lint

# 4. Format
pnpm format

# 5. Build test
pnpm build

# 6. Commit
git add .
git commit -m "feat: add new feature"

# 7. Push
git push
```

## 🚫 .gitignore

Projekt zawiera `.gitignore` z:

```
# Dependencies
/node_modules

# Next.js
/.next/
/out/

# Environment
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
```

## 🔐 Secrets i Environment Variables

### ❌ NIGDY nie commituj:

- `.env.local`
- `.env`
- API keys
- Passwords
- Tokens

### ✅ Commituj:

- `.env.example` (bez wartości)

```bash
# .env.example
NEXT_PUBLIC_SITE_URL=https://syntance.com
# API_KEY=your_key_here
```

## 📦 Git LFS (Large File Storage)

Jeśli masz duże pliki (obrazy, wideo):

```bash
# Instalacja Git LFS
git lfs install

# Track large files
git lfs track "*.png"
git lfs track "*.jpg"
git lfs track "*.mp4"

# Commit .gitattributes
git add .gitattributes
git commit -m "chore: add Git LFS tracking"
```

## 🏷️ Tagging (wersjonowanie)

### Semantic Versioning (MAJOR.MINOR.PATCH)

```bash
# Pierwsza wersja
git tag -a v1.0.0 -m "Release v1.0.0: Initial production release"
git push origin v1.0.0

# Minor update (nowe funkcje)
git tag -a v1.1.0 -m "Release v1.1.0: Add blog section"
git push origin v1.1.0

# Patch (poprawki)
git tag -a v1.1.1 -m "Release v1.1.1: Fix mobile navigation"
git push origin v1.1.1

# Lista tagów
git tag -l

# Checkout konkretnej wersji
git checkout v1.0.0
```

## 🔄 Przydatne komendy

### Cofanie zmian

```bash
# Cofnij zmiany w pliku (przed add)
git checkout -- file.tsx

# Cofnij git add
git reset HEAD file.tsx

# Cofnij ostatni commit (zachowaj zmiany)
git reset --soft HEAD~1

# Cofnij ostatni commit (usuń zmiany)
git reset --hard HEAD~1

# Popraw ostatni commit
git commit --amend -m "New message"
```

### Historia

```bash
# Historia commitów
git log

# Historia w jednej linii
git log --oneline

# Historia z grafem
git log --graph --oneline --all

# Zmiany w pliku
git log -p file.tsx

# Kto zmienił linię
git blame file.tsx
```

### Porównywanie

```bash
# Zmiany w working directory
git diff

# Zmiany w staged
git diff --staged

# Porównaj branche
git diff main..feature/new-feature

# Porównaj z konkretnym commitem
git diff abc123
```

### Stash (tymczasowe przechowanie)

```bash
# Schowaj zmiany
git stash

# Schowaj z wiadomością
git stash save "WIP: working on contact form"

# Lista stashów
git stash list

# Przywróć ostatni stash
git stash pop

# Przywróć konkretny stash
git stash apply stash@{0}

# Usuń stash
git stash drop stash@{0}
```

## 🤝 Współpraca (Pull Requests)

### Tworzenie PR

1. Push branch do GitHub
2. Wejdź na GitHub → Pull Requests → New PR
3. Wybierz branch: `feature/xyz` → `main`
4. Wypełnij opis:

```markdown
## Opis zmian

Dodanie sekcji z blogiem na stronie głównej.

## Typ zmiany

- [x] Nowa funkcjonalność
- [ ] Naprawa błędu
- [ ] Breaking change

## Checklist

- [x] Kod przeszedł linting
- [x] Build działa poprawnie
- [x] Zaktualizowano dokumentację
- [x] Przetestowano na mobile i desktop

## Screenshots

[Dodaj screenshoty jeśli dotyczy UI]
```

5. Przypisz reviewers (jeśli pracujesz w zespole)
6. Kliknij **Create Pull Request**

### Review PR

```bash
# Pobierz PR lokalnie do testów
git fetch origin pull/123/head:pr-123
git checkout pr-123

# Testuj...

# Wróć do main
git checkout main
```

## 🔧 Git Hooks (automatyzacja)

### Pre-commit hook (lint przed commitem)

```bash
# .husky/pre-commit (jeśli używasz Husky)
#!/bin/sh
pnpm lint
pnpm format
```

### Instalacja Husky (opcjonalnie)

```bash
pnpm add -D husky
npx husky install
npx husky add .husky/pre-commit "pnpm lint"
```

## 📊 GitHub Actions (CI/CD)

### Przykładowy workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm build
```

## 🎯 Best Practices

1. **Commituj często** - małe, atomowe commity
2. **Opisowe wiadomości** - jasno opisuj co i dlaczego
3. **Pull przed push** - zawsze `git pull` przed `git push`
4. **Review własnego kodu** - `git diff` przed commitem
5. **Nie commituj secrets** - używaj `.env.local`
6. **Używaj branches** - nie commituj bezpośrednio do `main`
7. **Testuj przed merge** - zawsze testuj PR przed merge

## 🆘 Troubleshooting

### Konflikt podczas merge

```bash
# 1. Pull z main
git pull origin main

# 2. Rozwiąż konflikty w plikach
# (edytuj pliki, usuń markery <<<, ===, >>>)

# 3. Dodaj rozwiązane pliki
git add .

# 4. Kontynuuj merge
git commit -m "Merge branch 'main' into feature/xyz"
```

### Przypadkowy commit do main

```bash
# 1. Cofnij commit (zachowaj zmiany)
git reset --soft HEAD~1

# 2. Utwórz nowy branch
git checkout -b feature/my-feature

# 3. Commit ponownie
git commit -m "feat: my feature"
```

### Push rejected (nie-fast-forward)

```bash
# 1. Pull z rebase
git pull --rebase origin main

# 2. Rozwiąż konflikty jeśli są

# 3. Push
git push origin main
```

## 📚 Przydatne zasoby

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)

---

**Gotowe!** Możesz teraz zacząć pracę z Git i GitHub.

