# Plan — BannerEditorModal rozszerzenie

## Kolejność etapów: 4 → 2 → 3 → 1 → 5

---

## Etap 4 — Fix `onApply` + typy (20 min) ← ZRÓB PIERWSZY

### `src/types/index.ts`
Dodaj do `BannerCardOverrides`:
```typescript
headlineOverride?: Partial<HeadlineData>
ctaOverride?:      Partial<CTAData>
```

### `src/components/ui/BannerEditorModal.tsx`
Zmień sygnaturę `onApply`:
```typescript
onApply: (overrides: BannerCardOverrides, headline: HeadlineData | null, cta: CTAData | null) => void
```
Przycisk "Zastosuj":
```tsx
onClick={() => { onApply({ ...local }, localHeadline, localCta); onClose() }}
```

### `src/components/nodes/BannerSlaveNode.tsx`
Dodaj stan `[headlineOverride, setHeadlineOverride]` i `[ctaOverride, setCtaOverride]`.
W `onApply` callbacku:
```typescript
onApply={(newOverrides, hl, cta) => {
  setOverrides(newOverrides)
  setHeadlineOverride(hl)
  setCtaOverride(cta)
}}
```
Merge przy renderze canvas:
```typescript
const headline: HeadlineData | null = masterData?.headline ? {
  ...masterData.headline,
  ...(headlineOverride ?? {}),
  mainColor: overrides.mainColor ?? headlineOverride?.mainColor ?? masterData.headline.mainColor,
  subColor:  overrides.subColor  ?? headlineOverride?.subColor  ?? masterData.headline.subColor,
} : null
const cta = ctaOverride ? { ...(masterData?.cta ?? { text: '', style: 'primary' }), ...ctaOverride } as CTAData
          : masterData?.cta ?? null
```

---

## Etap 2 — Rozmiary tekstu (45 min)

### `src/lib/canvasComposer.ts`
W sekcji `// ── 4. Measure: headline`:
```typescript
// Zamiast:
const rawFs = copy.headline.main.length > 40 ? px(48) : ...
// Dodaj PRZED:
if (copy.headline.mainSize) {
  hFontSize = Math.min(px(copy.headline.mainSize), maxFs)
} else {
  // istniejąca logika auto-rozmiaru
}
```
Analogicznie dla sub-headline (`subSize`).

### `src/components/ui/BannerEditorModal.tsx`
W zakładce `text` — dodaj po polach mainColor/subColor:
```tsx
<Slider label="Rozmiar nagłówka" value={localHeadline?.mainSize ?? 68} min={16} max={120} step={1}
  onChange={v => setLocalHeadline(prev => ({ ...(prev ?? masterData?.headline ?? { main: '' }), mainSize: v }))} />
<Slider label="Rozmiar sub-nagłówka" value={localHeadline?.subSize ?? 26} min={10} max={60} step={1}
  onChange={v => setLocalHeadline(prev => ({ ...(prev ?? masterData?.headline ?? { main: '' }), subSize: v }))} />
```

---

## Etap 3 — Import szablonów z ad-generatora (1h)

### Supabase — ta sama instancja
Oba narzędzia: `https://wptvtsqmkrucxbkkskja.supabase.co` → konta już powiązane.

### Tabela `banner_templates` (ad-generator)
Schemat kolumny `project`:
```typescript
interface Project {
  bg: { src?: string; color?: string; fit?: 'cover'|'contain'|'fill'; offsetX?: number; offsetY?: number; scale?: number; opacity?: number }
  masterElems: Array<{ type: 'text'|'image'|'shape'; text?: string; color?: string; fontSize?: number; fontWeight?: number }>
  fmtBgs: Record<string, BgSettings>  // per-format bg overrides
}
```

### Mapowanie Project → BannerCardOverrides
```typescript
function projectToOverrides(project: Project): BannerCardOverrides {
  const bg = project.bg ?? {}
  const textElems = (project.masterElems ?? []).filter(e => e.type === 'text')
  const main = textElems[0]
  const sub  = textElems[1]
  return {
    imageUrl:       bg.src   ?? undefined,
    bgColor:        bg.color ?? undefined,
    bgFit:          bg.fit   ?? 'cover',
    bgOffsetX:      bg.offsetX ?? 0,
    bgOffsetY:      bg.offsetY ?? 0,
    bgScale:        bg.scale   ?? 1.0,
    overlayOpacity: bg.opacity ?? undefined,
    mainColor:      main?.color ?? undefined,
    subColor:       sub?.color  ?? undefined,
  }
}
function projectToHeadline(project: Project): Partial<HeadlineData> | null {
  const textElems = (project.masterElems ?? []).filter(e => e.type === 'text')
  if (!textElems.length) return null
  const main = textElems[0]
  const sub  = textElems[1]
  return {
    mainSize:   main?.fontSize   ?? undefined,
    mainWeight: main?.fontWeight ?? undefined,
    mainColor:  main?.color      ?? undefined,
    subSize:    sub?.fontSize    ?? undefined,
    subColor:   sub?.color       ?? undefined,
  }
}
```

### BannerEditorModal — prawy panel (Presety)
Zmień na dwa taby: **"Presety"** (obecne `banner_presets`) i **"Ad Generator"** (`banner_templates`).

Tab "Ad Generator":
```tsx
const [adGenTemplates, setAdGenTemplates] = useState<AdGenTemplate[]>([])
// loadAdGenTemplates → supabase.from('banner_templates').select('id,name,thumbnail,project').limit(30)
// onClick → applyAdGenTemplate(template)
//   setLocal(projectToOverrides(template.project))
//   setLocalHeadline(prev => ({ ...(prev ?? {}), ...projectToHeadline(template.project) }))
```

---

## Etap 1 — Per-slave tło z toggle (30 min)

### BannerEditorModal — zakładka "Tło"
Dodaj toggle na górze:
```tsx
const hasOwnBg = !!(local.bgColor || local.imageUrl)
<label>
  <input type="checkbox" checked={hasOwnBg}
    onChange={e => {
      if (!e.target.checked) {
        patchLocal({ bgColor: undefined, imageUrl: undefined })
      } else {
        patchLocal({ bgColor: masterData?.bgColor ?? '#1a1a2e' })
      }
    }} />
  Własne tło (odłącz od mastera)
</label>
```
Gdy `!hasOwnBg`: picker wyłączony, kolor mastera widoczny jako preview z watermarkiem "z mastera".

---

## Etap 5 — Szybki zapis presetu (opcjonalny, 15 min)

Na headerze BannerSlaveNode dodaj przycisk `⭐`:
- Klik → mini popup z inputem na nazwę (inline, bez modala)
- Enter → `supabase.from('banner_presets').insert({ name, config: { ...overrides, headline: headlineOverride, cta: ctaOverride }, thumbnail })`
- Miniatura z `canvasRef.current.toDataURL('image/jpeg', 0.7)` skrojona do 120×120

---

## Uwagi techniczne

- `npx tsc --noEmit` po każdym etapie
- `git add -A && git commit` po każdym etapie
- Nie edytuj więcej niż 3 pliki naraz bez potwierdzenia
- Po etapie 3: sprawdź czy RLS na `banner_templates` pozwala na `SELECT` z nodes tool (inny origin, to samo auth)
