'use client'
// ═══════════════════════════════════════════════
// XTOOLS IMPORT NODE
// ═══════════════════════════════════════════════
import { useEffect, useRef, useState, useCallback } from 'react'
import { BaseNode } from './BaseNode'
import { StatusBar } from '@/components/ui/StatusBar'
import { useAppStore } from '@/store/appStore'
import { AD_FORMATS } from '@/lib/constants'
import { fetchTemplates, fetchTemplateProject, type TemplateEntry } from '@/lib/supabase'
import type { NodeProps } from '@xyflow/react'
import type { HeadlineData, CTAData, BackgroundData, StyleData } from '@/types'

interface AdElement {
  id: string
  type: 'text' | 'cta' | 'logo'
  name: string
  text?: string
  size?: number
  visible?: boolean
  color?: string
  font?: string
  weight?: number
  ctaStyle?: string
  ctaBg?: string
  ctaTc?: string
}
interface BgSettings { bgColor?: string; bgImg?: string | null }
interface XToolsProject {
  name?: string
  masterElems?: AdElement[]
  bg?: BgSettings
  // Legacy v2.0 JSX format: bgColor/bgImg at top level
  bgColor?: string
  bgImg?: string | null
  selFmts?: string[]
  trans?: Record<string, Record<string, string>>
}

function mapFormat(fmtId: string): string {
  if (/story|short|tt-|reel/i.test(fmtId))               return 'ig-story'
  if (/square|1080x1080/i.test(fmtId))                   return 'ig-square'
  if (/portrait|1350|4:5/i.test(fmtId))                  return 'ig-portrait'
  if (/feed|wide|16:9|youtube|yt-thumb/i.test(fmtId))    return 'fb-feed'
  if (/banner/i.test(fmtId))                              return 'li-banner'
  return 'ig-square'
}

interface Parsed {
  headline: HeadlineData | null
  cta: CTAData | null
  background: BackgroundData | null
  style: StyleData | null
  variants: { lang: string; headline: HeadlineData; cta: CTAData }[]
  projectName: string
  elements: { label: string; value: string; type: string }[]
}

function parseProject(json: unknown): Parsed {
  const p = json as XToolsProject

  // All text elements sorted by size desc (larger = more prominent)
  const textElems = (p.masterElems ?? [])
    .filter(e => e.type === 'text' && e.text?.trim())
    .sort((a, b) => (b.size ?? 0) - (a.size ?? 0))

  // All CTA elements in order
  const ctaElems = (p.masterElems ?? [])
    .filter(e => e.type === 'cta' && e.text?.trim())

  const headline: HeadlineData | null = textElems.length ? {
    main:       textElems[0].text!.trim(),
    mainColor:  textElems[0].color,
    mainFont:   textElems[0].font,
    mainWeight: textElems[0].weight,
    mainSize:   textElems[0].size,
    sub:        textElems[1]?.text?.trim() || undefined,
    subColor:   textElems[1]?.color,
    subFont:    textElems[1]?.font,
    subWeight:  textElems[1]?.weight,
    subSize:    textElems[1]?.size,
  } : null

  const cta: CTAData | null = ctaElems.length ? {
    text:      ctaElems[0].text!.trim().slice(0, 30),
    style:     (ctaElems[0].ctaStyle as CTAData['style']) ?? 'primary',
    bgColor:   ctaElems[0].ctaBg,
    textColor: ctaElems[0].ctaTc,
    size:      ctaElems[0].size,
  } : null

  // Background: support both nested `bg` (new TS format) and top-level (legacy v2.0 JSX)
  const bgSettings = p.bg ?? {}
  const resolvedBgColor = bgSettings.bgColor ?? p.bgColor
  const resolvedBgImg   = bgSettings.bgImg !== undefined ? bgSettings.bgImg : p.bgImg
  const background: BackgroundData | null = (resolvedBgImg || resolvedBgColor)
    ? { url: resolvedBgImg ?? '', color: resolvedBgColor }
    : null

  const fmtId = p.selFmts?.[0] ?? ''
  const ratio  = mapFormat(fmtId)
  const fmt    = AD_FORMATS.find(f => f.id === ratio) ?? AD_FORMATS[0]
  const style: StyleData | null = { format: ratio, width: fmt.w, height: fmt.h }

  const variants: { lang: string; headline: HeadlineData; cta: CTAData }[] = []

  // Variants from multiple CTAs (CTA 2, CTA 3, ...)
  if (ctaElems.length > 1 && headline) {
    ctaElems.slice(1).forEach((ce, i) => {
      variants.push({
        lang: `CTA ${i + 2}`,
        headline,
        cta: { text: ce.text!.trim().slice(0, 30), style: 'primary' },
      })
    })
  }

  // Variants from translations
  for (const [lang, dict] of Object.entries(p.trans ?? {})) {
    const texts = Object.values(dict).filter(Boolean)
    if (!texts.length) continue
    variants.push({
      lang,
      headline: { main: texts[0].trim(), sub: texts[1]?.trim() || undefined },
      cta: cta
        ? { text: (texts.find(t => t.length <= 30 && texts.indexOf(t) > 0) ?? cta.text).trim().slice(0, 30), style: 'primary' }
        : { text: 'Zobacz więcej', style: 'primary' },
    })
  }

  // Human-readable summary of ALL imported elements
  const elements: Parsed['elements'] = []
  textElems.forEach((e, i) => {
    const label = i === 0 ? 'Nagłówek' : i === 1 ? 'Podtytuł' : `Tekst ${i + 1}`
    const type  = i === 0 ? 'headline' : 'sub'
    const val   = e.text!.trim()
    const colorHint = e.color ? ` (${e.color})` : ''
    elements.push({ type, label, value: val.slice(0, 36) + (val.length > 36 ? '…' : '') + colorHint })
  })
  ctaElems.forEach((e, i) => {
    const colorHint = e.ctaBg ? ` bg:${e.ctaBg}` : ''
    elements.push({ type: 'cta', label: i === 0 ? 'CTA' : `CTA ${i + 1}`, value: e.text!.trim() + colorHint })
  })
  if (background) {
    if (background.url)   elements.push({ type: 'bg', label: 'Tło (obraz)', value: 'URL ✓' })
    if (background.color) elements.push({ type: 'bg', label: 'Tło (kolor)', value: background.color })
  }
  if (style) elements.push({ type: 'format', label: 'Format', value: `${style.format} (${style.width}×${style.height})` })
  if (p.selFmts && p.selFmts.length > 1) {
    elements.push({ type: 'format', label: 'Wszystkie formaty', value: p.selFmts.join(', ') })
  }
  if (variants.length) elements.push({ type: 'variants', label: 'Warianty', value: `${variants.length}: ${variants.map(v => v.lang).join(', ')}` })

  return { headline, cta, background, style, variants, projectName: p.name ?? 'XTools', elements }
}

const TYPE_COLOR: Record<string, string> = {
  headline: 'var(--color-process)',
  sub: '#a78bfa',
  cta: '#34d399',
  bg: '#f59e0b',
  format: '#60a5fa',
  variants: '#f472b6',
}

type Mode = 'cloud' | 'file'

export function XToolsImportNode({ id }: NodeProps) {
  const setNodeOutput          = useAppStore(s => s.setNodeOutput)
  const setNodeErrors          = useAppStore(s => s.setNodeErrors)
  const addToast               = useAppStore(s => s.addToast)
  const setCopyVariant         = useAppStore(s => s.setCopyVariant)
  const addCopyVariant         = useAppStore(s => s.addCopyVariant)
  const setActiveCopyVariantIdx = useAppStore(s => s.setActiveCopyVariantIdx)
  const fileRef = useRef<HTMLInputElement>(null)

  const [mode,         setMode]        = useState<Mode>('cloud')
  const [loaded,       setLoaded]      = useState<string | null>(null)
  const [status,       setStatus]      = useState<'idle' | 'done' | 'error'>('idle')
  const [importedElems, setImportedElems] = useState<Parsed['elements']>([])

  // Cloud mode
  const [templates,     setTemplates]    = useState<TemplateEntry[]>([])
  const [templLoading,  setTemplLoading] = useState(false)
  const [templError,    setTemplError]   = useState<string | null>(null)
  const [selected,      setSelected]     = useState<TemplateEntry | null>(null)
  const [loadingId,     setLoadingId]    = useState<string | null>(null)

  const applyProject = useCallback((json: unknown) => {
    const { headline, cta, background, style, variants, projectName, elements } = parseProject(json)

    if (!headline && !cta) {
      const p = json as XToolsProject
      const totalElems = p.masterElems?.length ?? 0
      const textCount  = p.masterElems?.filter(e => e.type === 'text').length ?? 0
      setNodeErrors(id, [`Brak elementów text/cta (znaleziono ${totalElems} elementów, text: ${textCount})`])
      setStatus('error')
      addToast({ type: 'error', message: `XTools: brak elementów text/cta (total: ${totalElems})` })
      return
    }

    setNodeOutput(id, {
      ...(headline   ? { headline }   : {}),
      ...(cta        ? { cta }        : {}),
      ...(background ? { background } : {}),
      ...(style      ? { style }      : {}),
    })
    setNodeErrors(id, [])
    setStatus('done')
    setLoaded(projectName)
    setImportedElems(elements)

    if (variants.length > 0 && headline && cta) {
      setCopyVariant(0, { id: 'v1', headlineMain: headline.main, headlineSub: headline.sub ?? '', ctaText: cta.text, ctaStyle: 'primary' })
      variants.forEach((v, i) => {
        if (i === 0) addCopyVariant()
        setCopyVariant(i + 1, { id: `v${Date.now()}_${i}`, headlineMain: v.headline.main, headlineSub: v.headline.sub ?? '', ctaText: v.cta.text, ctaStyle: 'primary' })
        if (i < variants.length - 1) addCopyVariant()
      })
      setActiveCopyVariantIdx(0)
      addToast({ type: 'success', message: `XTools: ${variants.length + 1} wariantów` })
    } else {
      addToast({ type: 'success', message: `XTools: ${projectName}` })
    }
  }, [id, setNodeOutput, setNodeErrors, addToast, setCopyVariant, addCopyVariant, setActiveCopyVariantIdx])

  const clear = () => {
    setLoaded(null); setStatus('idle'); setImportedElems([])
    setNodeOutput(id, {}); setNodeErrors(id, [])
  }

  const loadTemplateList = useCallback(async () => {
    setTemplLoading(true); setTemplError(null)
    try {
      setTemplates(await fetchTemplates())
    } catch (e) {
      setTemplError(e instanceof Error ? e.message : 'Błąd połączenia')
    } finally {
      setTemplLoading(false)
    }
  }, [])

  useEffect(() => {
    setNodeOutput(id, {})
    if (mode === 'cloud') loadTemplateList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, mode])

  const handleCloudLoad = async (t: TemplateEntry) => {
    setLoadingId(t.id)
    try {
      const project = await fetchTemplateProject(t.id)
      applyProject(project)
    } catch (e) {
      setNodeErrors(id, ['Błąd pobierania szablonu'])
      setStatus('error')
      addToast({ type: 'error', message: `XTools: ${e instanceof Error ? e.message : 'błąd'}` })
    } finally {
      setLoadingId(null)
    }
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = ev => {
      try { applyProject(JSON.parse(ev.target!.result as string)) }
      catch {
        setNodeErrors(id, ['Nieprawidłowy plik JSON']); setStatus('error')
        addToast({ type: 'error', message: 'XTools: błąd parsowania JSON' })
      }
    }
    reader.readAsText(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.json')) { setMode('file'); handleFile(file) }
  }

  return (
    <BaseNode id={id} nodeType="xToolsImportNode">

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {(['cloud', 'file'] as Mode[]).map(m => (
          <button key={m} onClick={() => { setMode(m); if (status === 'done') clear() }} style={{
            flex: 1, padding: '3px 0', fontSize: 10, fontWeight: 600, cursor: 'pointer',
            borderRadius: 5, border: '1px solid',
            borderColor: mode === m ? 'var(--color-process)' : 'var(--color-field-border)',
            background:  mode === m ? 'var(--blue-50)' : 'var(--color-field-bg)',
            color:       mode === m ? 'var(--color-process)' : 'var(--color-text-muted)',
            transition: 'all .12s',
          }}>
            {m === 'cloud' ? '☁ Szablony' : '📁 Plik JSON'}
          </button>
        ))}
      </div>

      {/* ── CLOUD MODE ── */}
      {mode === 'cloud' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {templLoading && (
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)', padding: '8px 0' }}>⟳ Ładowanie...</div>
          )}
          {templError && (
            <div style={{ fontSize: 10, color: 'var(--red-400, #f87171)', background: 'var(--color-field-bg)', border: '1px solid var(--color-field-border)', borderRadius: 5, padding: '4px 8px' }}>{templError}</div>
          )}
          {!templLoading && !templError && templates.length === 0 && (
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)', padding: '8px 0', fontFamily: 'var(--font-mono)' }}>
              Brak publicznych szablonów.<br />Zapisz w Ad Generator.
            </div>
          )}

          {/* Template cards */}
          {templates.map(t => {
            const isSelected = selected?.id === t.id
            const isLoading  = loadingId === t.id
            return (
              <div key={t.id} onClick={() => setSelected(isSelected ? null : t)} style={{
                background: isSelected ? 'var(--blue-50)' : 'var(--color-field-bg)',
                border: `1px solid ${isSelected ? 'var(--color-process)' : 'var(--color-field-border)'}`,
                borderRadius: 6, overflow: 'hidden', cursor: 'pointer', transition: 'all .12s',
              }}>
                {/* Thumbnail */}
                {t.thumbnail && (
                  <div style={{ width: '100%', height: 80, overflow: 'hidden', background: '#111' }}>
                    <img src={t.thumbnail} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <div style={{ padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                    {t.tags?.length > 0 && (
                      <div style={{ fontSize: 9, color: 'var(--color-text-muted)', marginTop: 2 }}>{t.tags.slice(0, 3).join(' · ')}</div>
                    )}
                    {t.sel_fmts?.length > 0 && (
                      <div style={{ fontSize: 9, color: 'var(--blue-400, #60a5fa)', marginTop: 1 }}>{t.sel_fmts.slice(0, 3).join(', ')}</div>
                    )}
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ flexShrink: 0, fontSize: 10, opacity: isLoading ? 0.5 : 1 }}
                    onClick={e => { e.stopPropagation(); handleCloudLoad(t) }}
                    disabled={isLoading}
                  >
                    {isLoading ? '⟳' : 'Wczytaj'}
                  </button>
                </div>
              </div>
            )
          })}

          <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 2, fontSize: 10 }}
            onClick={loadTemplateList} disabled={templLoading}>
            ↺ Odśwież
          </button>
        </div>
      )}

      {/* ── FILE MODE ── */}
      {mode === 'file' && (
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); e.stopPropagation() }} style={{
          border: `1.5px dashed ${status === 'done' ? 'var(--color-process)' : 'var(--color-field-border)'}`,
          borderRadius: 8, padding: '10px 10px 8px',
          background: status === 'done' ? 'var(--blue-50)' : 'var(--color-field-bg)',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {status !== 'done' && (
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center', fontFamily: 'var(--font-mono)', lineHeight: 1.5 }}>
              Przeciągnij JSON<br />lub kliknij poniżej
            </div>
          )}
          <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => fileRef.current?.click()}>
            {status === 'done' ? '↺ Zmień plik' : '⬆ Wczytaj JSON'}
          </button>
          <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
        </div>
      )}

      {/* ── Imported elements panel ── */}
      {status === 'done' && importedElems.length > 0 && (
        <div style={{ marginTop: 6, background: 'var(--color-field-bg)', border: '1px solid var(--color-field-border)', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', borderBottom: '1px solid var(--color-field-border)' }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              ✓ {loaded} — wczytane elementy
            </span>
            <button onClick={clear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 11, padding: 0, lineHeight: 1 }}>✕</button>
          </div>
          {importedElems.map((el, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, padding: '3px 8px', borderBottom: i < importedElems.length - 1 ? '1px solid var(--color-field-border)' : 'none', alignItems: 'baseline' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: TYPE_COLOR[el.type] ?? '#888', minWidth: 56, flexShrink: 0 }}>{el.label}</span>
              <span style={{ fontSize: 10, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{el.value}</span>
            </div>
          ))}
        </div>
      )}

      <StatusBar
        status={status}
        message={
          status === 'done'    ? `${importedElems.length} elementów z "${loaded}"`
          : status === 'error' ? 'błąd'
          : mode === 'cloud'   ? `${templates.length} szablonów`
          : 'oczekuje na JSON'
        }
      />
    </BaseNode>
  )
}
