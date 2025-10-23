# 🧪 Szybki przewodnik testowania wydajności

## Krok po kroku - testowanie lokalnie

### 1. Build i uruchom produkcyjną wersję

```bash
# Build
pnpm run build

# Start production server
pnpm run start
```

Otwórz: http://localhost:3000

---

### 2. Chrome DevTools Lighthouse

1. Otwórz stronę w Chrome
2. Kliknij F12 (DevTools)
3. Zakładka "Lighthouse"
4. Ustawienia:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
   - Device: Desktop i Mobile (osobno)
   - Clear storage: ✅
5. Kliknij "Analyze page load"

**Czego szukać**:
- ✅ Performance: >90 (cel: 95+)
- ✅ Total Blocking Time: <300ms (było 11 180ms)
- ✅ "Links do not have distinguishable names": ✅ Fixed

---

### 3. PageSpeed Insights (online)

Po deploy na Vercel:

1. Idź do: https://pagespeed.web.dev/
2. Wklej URL: `https://syntance.com`
3. Kliknij "Analyze"

Sprawdź:
- Mobile score
- Desktop score
- Core Web Vitals (FCP, LCP, CLS, INP)

---

### 4. WebPageTest (advanced)

https://www.webpagetest.org/

**Ustawienia**:
- Test Location: **Warsaw, Poland** lub Frankfurt, Germany
- Browser: Chrome
- Connection: **Cable** (pierwsze testy), potem **Fast 3G**

**Co analizować**:
- Filmstrip view (wizualna analiza ładowania)
- Waterfall (kolejność zasobów)
- Start Render time
- Fully Loaded time

---

### 5. Szybki test - Metryki przed/po

| Metryka | Przed | Po | Cel |
|---------|-------|-----|-----|
| Total Blocking Time | 11 180ms | ? | <500ms |
| First Contentful Paint | 0.3s | ? | <1.5s |
| Speed Index | 0.7s | ? | <2.0s |
| Largest Contentful Paint | - | ? | <2.5s |
| Cumulative Layout Shift | 0 | ? | <0.1 |
| Performance Score | - | ? | >90 |

---

## ⚡ Co zostało zoptymalizowane (sprawdź czy działa)

### 1. **Lazy Loading**
- Scroll do sekcji "Zobacz spokój w akcji"
- InteractiveFluidBox powinien się załadować dopiero przy scrollowaniu (nie od razu)
- W Network tab (DevTools) sprawdź, czy `interactive-fluid-box.js` ładuje się lazy

### 2. **Aria Labels**
- Inspect social media icons (Twitter, LinkedIn, GitHub)
- Powinny mieć atrybuty `aria-label="..."`
- Lighthouse nie powinien już pokazywać ostrzeżenia o linkach

### 3. **GooeyNav Particles**
- Kliknij różne sekcje w nawigacji
- Animacja powinna być płynna
- Liczba cząsteczek: 8 (było 15)

### 4. **WebGL Fluid Animation**
- Sekcja "Zobacz spokój w akcji"
- Animacja powinna działać płynnie
- Mniejsza rozdzielczość (512 vs 1024) - nie powinno być widocznej różnicy jakości

### 5. **Bundle Size**
- W terminalu po `pnpm run build` sprawdź rozmiar bundles
- Main bundle powinien być <100KB (gzipped)

---

## 🐛 Troubleshooting

### Problem: "InteractiveFluidBox nie działa"
**Rozwiązanie**: To normalne - lazy loading + `ssr: false`. Sprawdź konsolę (F12).

### Problem: "GooeyNav animacja nie działa"
**Rozwiązanie**: Wyczyść cache: Ctrl+Shift+R (hard reload)

### Problem: "Bundle size nie zmniejszył się"
**Rozwiązanie**: Sprawdź czy `modularizeImports` działa:
```bash
pnpm run build
# Zobacz output - lucide-react powinien być tree-shaked
```

---

## 📊 Oczekiwane wyniki (Mobile)

### Lighthouse Mobile:
- **Performance**: 85-95 (był: ~60-70 szacunkowo)
- **Accessibility**: 95+ (było: ~90 przez linki)
- **Best Practices**: 95+
- **SEO**: 95+

### Core Web Vitals:
- **FCP**: <1.0s ✅
- **LCP**: <2.0s ⚠️ (może wymagać więcej optymalizacji)
- **TBT**: <300ms ✅ (było: 11 180ms!)
- **CLS**: 0 ✅

---

## 🎯 Następne kroki

Jeśli wyniki są dobre:
1. ✅ Deploy na Vercel
2. ✅ Test ponownie PageSpeed Insights z live URL
3. ✅ Sprawdź Google Search Console → Core Web Vitals (za kilka dni)

Jeśli wyniki nie są zadowalające:
- Sprawdź `OPTYMALIZACJE_WYDAJNOSCI.md` → sekcja "Dodatkowe rekomendacje"
- Rozważ dalsze optymalizacje (fonts, images, code splitting)

---

**Powodzenia!** 🚀

Jeśli masz pytania: kontakt@syntance.com

