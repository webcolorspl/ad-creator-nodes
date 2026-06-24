# FEATURES.md — Specyfikacja funkcji i otwarte pytania

> Plik pomocniczy do CLAUDE.md. Przed kodowaniem nowej funkcji — sprawdź czy pytania poniżej są już odpowiedziane.

---

## Flow użytkownika (docelowy)

```
[1] Brand Setup  →  [2] Copy Variants  →  [3] Master Banner  →  [4] Format Preview  →  [5] Export
```

Node'y zostają — ale każdy ma jasne miejsce w tym flow i konkretną funkcję.

---

## [1] Brand Setup (ThemeNode)

Węzeł konfiguracji marki klienta.

**Planowane pola:**
- Nazwa marki
- Logo (URL lub upload)
- Kolor primary
- Kolor accent
- Kolor tła (bgColor)
- Font family

**Otwarte pytania:**
- [ ] Jeden Brand node = jeden klient, czy użytkownik może mieć kilka brandów na jednym canvasie?
- [ ] Czy logo obsługujemy przez URL, upload pliku, czy oba?
- [ ] Czy font pochodzi z listy (Google Fonts) czy wpisywany ręcznie?

---

## [2] Copy Variants (CopyVariantsNode / HeadlineNode / CTANode)

Warianty treści reklamowej (A/B/C).

**Planowane pola (per wariant):**
- Headline główny
- Headline sub
- Tekst CTA
- Styl CTA (primary / outline)

**Otwarte pytania:**
- [ ] Ile wariantów max? (aktualnie 3)
- [ ] Czy każdy wariant ma niezależny headline + sub + CTA, czy CTA jest wspólne dla wszystkich?
- [ ] Skąd copy: wpisywane ręcznie, generowane przez AI (Gemini), czy oba tryby?
- [ ] Czy AI ma sugerować warianty na podstawie Brand Setup?

---

## [3] Master Banner (BannerComposerNode)

Jeden wzorcowy baner — "master" — z którego generowane są pozostałe formaty.

**Planowane elementy:**
- Wybór formatu mastera
- Tło (AI-generated / biblioteka / upload / kolor)
- Teksty z Copy Variants
- Branding z Brand Setup

**Otwarte pytania:**
- [ ] Który format jest masterem — zawsze 1:1 (1080×1080), czy użytkownik wybiera?
- [ ] Co można edytować na masterze: tylko tekst/kolory, czy też pozycję elementów (drag)?
- [ ] Tło: tylko AI (Gemini), biblioteka stockowa, upload, kolor — ile opcji naraz?
- [ ] Czy master renderuje się live na canvasie, czy po kliknięciu "Generuj"?

---

## [4] Format Preview (BatchExportNode / nowy FormatPreviewNode)

Master automatycznie adaptuje się do wszystkich wybranych formatów.

**Planowane formaty:**
- Social: IG square 1:1, IG story 9:16, IG portrait 4:5, FB feed 1.91:1, LinkedIn banner
- Display (banery www): do ustalenia

**Otwarte pytania:**
- [ ] Jakie formaty wchodzą w scope: tylko social media, czy też display/banery www?
- [ ] Adaptacja: proporcjonalne skalowanie tekstu, czy każdy format ma własny layout (np. inne pozycje elementów)?
- [ ] Czy podgląd wszystkich formatów jest widoczny jednocześnie (grid), czy przełączamy jeden po drugim?
- [ ] Czy użytkownik może ręcznie korygować konkretny format po adaptacji?

---

## [5] Export

Finalny output gotowy do użycia w kampaniach.

**Planowane opcje:**
- Format pliku: PNG, JPG, PDF
- Wszystkie formaty w jednym ZIP

**Otwarte pytania:**
- [ ] Jakie formaty pliku: PNG, JPG, PDF, WebP — wszystkie czy wybór?
- [ ] Czy eksport idzie tylko do ZIP (pobieranie), czy też integracja z zewnętrznym systemem (Meta Ads, Google Ads)?
- [ ] Czy eksport zawiera też warstwowy plik (PSD/Figma) — teraz nie, ale w przyszłości?
- [ ] Czy jest eksport do konkretnego rozmiaru w px (np. retina 2x)?

---

## UX / Styl wizualny

**Ustalenia:**
- Dark mode jako domyślny
- Zgodność z WCAG (kontrast minimum AA)
- Node'y zostają, ale mają być czytelne i prowadzić przez logiczny flow

**Otwarte pytania:**
- [ ] Referencja stylistyczna: Figma, Linear, Framer, coś innego?
- [ ] Czy node'y mają mieć kolorowe kategorie (Brand = niebieski, Copy = zielony, Export = pomarańczowy)?
- [ ] Sidebar z paletą node'ów — czy zostaje po lewej, czy zmienia się układ?
- [ ] Czy "wizard mode" (krok po kroku) i "expert mode" (wolny canvas) mają być dwa osobne tryby?
