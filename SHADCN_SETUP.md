# Konfiguracja shadcn/ui

## Instalacja i inicjalizacja

Po zainstalowaniu zależności (`pnpm install`), uruchom:

```bash
npx shadcn-ui@latest init --yes
```

To polecenie:
- Skonfiguruje shadcn/ui zgodnie z `components.json`
- Utworzy niezbędne pliki konfiguracyjne
- Przygotuje katalog `components/ui/`

## Dodawanie komponentów

### Podstawowe komponenty (zalecane na start)

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add label
npx shadcn-ui@latest add separator
```

### Dodatkowe komponenty (opcjonalnie)

```bash
# Formularze
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group

# Nawigacja
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add breadcrumb

# Feedback
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add sheet

# Layout
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add collapsible
npx shadcn-ui@latest add scroll-area

# Data display
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
```

## Użycie komponentów

Po dodaniu komponentu, możesz go importować:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tytuł</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Kliknij mnie</Button>
      </CardContent>
    </Card>
  );
}
```

## Customizacja

### Kolory

Kolory są zdefiniowane w `tailwind.config.ts`:

```ts
colors: {
  brand: {
    DEFAULT: "#246BFD",
    dark: "#0B1530"
  }
}
```

### Warianty komponentów

shadcn/ui komponenty wspierają różne warianty:

```tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### Rozmiary

```tsx
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

## Integracja z Framer Motion

Możesz łatwo animować komponenty shadcn/ui:

```tsx
"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const MotionButton = motion(Button);

export default function AnimatedButton() {
  return (
    <MotionButton
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Animowany przycisk
    </MotionButton>
  );
}
```

## Przykłady użycia w projekcie

### Navbar z NavigationMenu

```tsx
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

export default function Navbar() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="/">Home</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/studio">Studio</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
```

### Formularz kontaktowy

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ContactForm() {
  return (
    <form className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="jan@example.com" />
      </div>
      <div>
        <Label htmlFor="message">Wiadomość</Label>
        <Textarea id="message" placeholder="Twoja wiadomość..." />
      </div>
      <Button type="submit">Wyślij</Button>
    </form>
  );
}
```

## Dokumentacja

Pełna dokumentacja: https://ui.shadcn.com/

## Troubleshooting

### Problem: Komponenty nie działają

**Rozwiązanie:**
1. Upewnij się, że uruchomiłeś `npx shadcn-ui@latest init`
2. Sprawdź czy `components.json` istnieje
3. Sprawdź czy `lib/utils.ts` zawiera funkcję `cn()`

### Problem: Style nie działają

**Rozwiązanie:**
1. Sprawdź `app/globals.css` - czy zawiera `@tailwind` directives
2. Sprawdź `tailwind.config.ts` - czy content paths są poprawne
3. Restart dev server: `pnpm dev`

### Problem: TypeScript errors

**Rozwiązanie:**
```bash
pnpm add -D @types/react @types/react-dom
```

