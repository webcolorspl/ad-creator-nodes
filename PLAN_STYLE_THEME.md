# Plan: Pełne style + system Brand Theme

## Obecny stan (problem)

XToolsImportNode wyciąga z szablonu tylko:
- tekst headline / sub / CTA
- kolor tła (`bgColor`) lub obraz (`bgImg`)
- wymiary formatu

**Nie przenosi:** kolory tekstu, fonty, wagi, styl przycisku CTA (kolor, kształt), widoczność elementów.

BannerComposerNode renderuje zawsze hardcoded style: białe litery, zielony przycisk, gradient.

---

## Część A — Pełne style z kreatoraz XTools

### A1. Rozszerzone typy danych

`src/types/index.ts`

```ts
// Obecne (bez stylu)
HeadlineData { main: string, sub?: string }
CTAData      { text: string, style: 'primary'|'outline'|'ghost'|'text' }

// Nowe (ze stylem elementu)
HeadlineData {
  main: string
  mainColor?: string     // color elementu hl w kreatorze
  mainFont?:  string     // font family
  mainWeight?: number    // font weight
  mainSize?:  number     // font size
  sub?: string
  subColor?:  string
  subFont?:   string
  subWeight?: number
  subSize?:   number
}

CTAData {
  text:       string
  style:      string     // solid | outline | pill | ghost | gradient
  bgColor?:   string     // ctaBg z kreatora
  textColor?: string     // ctaTc z kreatora
  size?:      number
}
```

### A2. parseProject w XToolsImportNode

Odczytuje z `masterElems`:
- `el.color` → `mainColor`/`subColor`
- `el.font` → `mainFont`
- `el.weight` → `mainWeight`
- `el.size` → `mainSize`
- `el.ctaStyle` → `CTAData.style`
- `el.ctaBg` → `CTAData.bgColor`
- `el.ctaTc` → `CTAData.textColor`

### A3. canvasComposer.ts

Używa rzeczywistych kolorów/fontów zamiast hardcoded:

```ts
ctx.fillStyle = copy.headline.mainColor ?? '#FFFFFF'
ctx.font = `${copy.headline.mainWeight ?? 700} ${fontSize}px ${copy.headline.mainFont ?? 'Inter'}, sans-serif`
// CTA button
ctx.fillStyle = copy.cta.bgColor ?? '#3DFFA0'
ctx.fillStyle = copy.cta.textColor ?? '#000000'
```

---

## Część B — Brand Theme Node

### B1. Nowy node: ThemeNode

Plik: `src/components/nodes/ThemeNode.tsx`

**Presety brandowe:**

| Brand    | bgColor   | accentColor | fontFamily   | Logo (placeholder) |
|----------|-----------|-------------|--------------|-------------------|
| Trans.eu | #001A3A   | #00A0E9     | Manrope      | SVG inline        |
| CargoOn  | #0D1117   | #22C55E     | Inter        | SVG inline        |
| TFF      | #1A0A00   | #F97316     | Montserrat   | SVG inline        |
| Pactus   | #120824   | #7C3AED     | Poppins      | SVG inline        |
| Custom   | user input| user input  | user select  | user upload       |

**Output port:** `theme` → `ThemeData`

```ts
interface ThemeData {
  brandName:   string
  bgColor:     string
  accentColor: string
  fontFamily:  string
  logoUrl?:    string   // base64 lub URL
  logoVariant: 'horizontal' | 'vertical' | 'icon'
}
```

### B2. BannerComposerNode — nowy port `theme`

Hierarchia priorytetów w canvasComposer:
```
1. Element style z XTools  (najwyższy)
2. Theme preset             (brand guideline)
3. Hardcoded fallback       (najniższy)
```

np. jeśli XTools CTA ma `ctaBg: '#FFFFFF'` → użyj białego.
Jeśli brak → użyj `theme.accentColor` jako kolor przycisku.
Jeśli brak theme → użyj `#3DFFA0` (obecny fallback).

### B3. Rejestracja ThemeNode

- `NODE_REGISTRY`: dodać `themeNode`
- `PALETTE_SECTIONS`: dodać do sekcji "Styl"
- `FlowCanvas.tsx`: dodać do `nodeTypes` i `DEMO_NODES`
- `DEMO_EDGES`: połączyć `theme → bc1`

---

## Część C — CopyGroupNode przekazuje styl

Obecny `CopyGroupData`:
```ts
{ headline: HeadlineData, cta: CTAData }
```

Styl z HeadlineData i CTAData jest już w strukturze — wystarczy że CopyGroupNode przepuszcza go niezmieniony.
Sprawdzić `CopyGroupNode.tsx` czy nadpisuje pola stylu.

---

## Kolejność wdrożenia

1. **Typy** (`types/index.ts`) — rozszerzenie HeadlineData, CTAData, dodanie ThemeData
2. **parseProject** (`XToolsImportNode.tsx`) — wyciąganie stylu z masterElems
3. **canvasComposer** (`canvasComposer.ts`) — używanie przekazanych kolorów/fontów
4. **ThemeNode** (`nodes/ThemeNode.tsx`) — nowy komponent z presetami
5. **BannerComposerNode** — dodanie portu `theme`, hierarchia priorytetów
6. **Rejestracja** (constants.ts, FlowCanvas.tsx) — podpięcie do grafu
7. **Test** — ładuję szablon "uuuu" z białym CTA, sprawdzam czy biały przycisk pojawia się w BannerComposer
8. **Deploy**

---

## Otwarte pytania do użytkownika

1. **Loga brandowe** — czy masz pliki SVG/PNG dla Trans.eu, CargoOn, TFF, Pactus? Mogę użyć placeholderów z tekstem.
2. **CopyGroupNode i styl** — czy CopyGroup powinien umożliwiać nadpisywanie stylu (np. zmiana koloru CTA przez ten node) czy tylko przepuszczać bez zmian?
3. **Logo w BannerComposer** — gdzie logo ma być renderowane? Lewy górny róg? Środek na górze? Czy to osobny port?
