'use client'
// ═══════════════════════════════════════════════
// XTOOLS IMPORT NODE
// Dwa tryby:
//   ☁ Szablony — pobiera z Supabase (banner_templates)
//   📁 Plik    — wczytuje lokalny JSON
//
// Mapowanie danych:
//   text elements → headline (sortowane po size)
//   cta element   → cta
//   bg            → background
//   selFmts[0]    → style (1:1 | 9:16 | 16:9 | 4:5)
//   trans         → warianty w CopyVariantsPanel
// ═══════════════════════════════════════════════
import { useEffect, useRef, useState, useCallback } from 'react'
import { BaseNode } from './BaseNode'
import { StatusBar } from '@/components/ui/StatusBar'
import { useAppStore } from '@/store/appStore'
import { AD_FORMATS } from '@/lib/constants'
import { fetchTemplates, fetchTemplateProject, type TemplateEntry } from '@/lib/supabase'
import type { NodeProps } from '@xyflow/react'
import type { HeadlineData, CTAData, BackgroundData, StyleData } from '@/types'

// ── Typy z ad-generator ───────────────────────
interface AdElement {
  id: string
  type: 'text' | 'cta' | 'logo'
  name: string
  text?: string
  size?: number
}

interface BgSettings {
  bgColor?: string
  bgImg?: string | null
}

interface XToolsProject {
  name?: string
  masterElems?: AdElement[]
  bg?: BgSettings
  selFmts?: string[]
  trans?: Record<string, Record<string, string>>
}

// ── Format mapping ─────────────────────────────
function mapFormat(fmtId: string): StyleData['format'] {
  if (/story|short|tt-|reel/i.test(fmtId))               return '9:16'
  if (/square|1080x1080/i.test(fmtId))                   return '1:1'
  if (/portrait|1350|4:5/i.test(fmtId))                  return '4:5'
  if (/feed|wide|banner|16:9|youtube|yt-thumb/i.test(fmtId)) return '16:9'
  return '1:1'
}

function parseProject(json: unknown): {
  headline: HeadlineData | null
  cta: CTAData | null
  background: BackgroundData | null
  style: StyleData | null
  variants: { lang: string; headline: HeadlineData; cta: CTAData }[]
  projectName: string
} {
  const p = json as XToolsProject

  const textElems = (p.masterElems ?? [])
    .filter(e => e.type === 'text' && e.text?.trim())
    .sort((a, b) => (b.size ?? 0) - (a.size ?? 0))

  const ctaElem = (p.masterElems ?? []).find(e => e.type === 'cta' && e.text?.trim())

  const headline: HeadlineData | null = textElems.length
    ? { main: textElems[0].text!.trim(), sub: textElems[1]?.text?.trim() || undefined }
    : null

  const cta: CTAData | null = ctaElem
    ? { text: ctaElem.text!.trim().slice(0, 30), style: 'primary' }
    : null

  const bgSettings = p.bg ?? {}
  const background: BackgroundData | null = bgSettings.bgImg
    ? { url: bgSettings.bgImg }
    : null

  const fmtId = p.selFmts?.[0] ?? ''
  const ratio  = mapFormat(fmtId)
  const fmt    = AD_FORMATS.find(f => f.id === ratio) ?? AD_FORMATS[0]
  const style: StyleData | null = { format: ratio, width: fmt.w, height: fmt.h }

  const variants: { lang: string; headline: HeadlineData; cta: CTAData }[] = []
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

  return { headline, cta, background, style, variants, projectName: p.name ?? 'XTools' }
}

type Mode = 'cloud' | 'file'

// ══════════════════════════════════════════════
export function XToolsImportNode({ id }: NodeProps) {
  const { setNodeOutput, setNodeErrors, addToast, setCopyVariant, addCopyVariant, setActiveCopyVariantIdx } = useAppStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const [mode,      setMode]    = useState<Mode>('cloud')
  const [loaded,    setLoaded]  = useState<string | null>(null)
  const [summary,   setSummary] = useState<string | null>(null)
  const [status,    setStatus]  = useState<'idle' | 'done' | 'error'>('idle')

  // Cloud mode state
  const [templates,   setTemplates]   = useState<TemplateEntry[]>([])
  const [templLoading, setTemplLoading] = useState(false)
  const [templError,   setTemplError]   = useState<string | null>(null)

  const applyProject = useCallback((json: unknown) => {
    const { headline, cta, background, style, variants, projectName } = parseProject(json)

    if (!headline && !cta) {
      setNodeErrors(id, ['Nie znaleziono elementów tekstowych'])
      setStatus('error')
      addToast({ type: 'error', message: 'XTools: brak elementów text/cta' })
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

    // Warianty do panelu
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

    setSummary([
      headline   ? `"${headline.main.slice(0, 24)}${headline.main.length > 24 ? '…' : ''}"` : null,
      cta        ? `CTA: ${cta.text.slice(0, 12)}` : null,
      background ? 'tło ✓' : null,
      style      ? style.format : null,
    ].filter(Boolean).join(' · '))
  }, [id, setNodeOutput, setNodeErrors, addToast, setCopyVariant, addCopyVariant, setActiveCopyVariantIdx])

  const clear = () => {
    setLoaded(null); setSummary(null); setStatus('idle')
    setNodeOutput(id, {}); setNodeErrors(id, [])
  }

  // ── Cloud: fetch template list ─────────────────
  const loadTemplateList = useCallback(async () => {
    setTemplLoading(true)
    setTemplError(null)
    try {
      const list = await fetchTemplates()
      setTemplates(list)
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

  // ── Cloud: load single template ────────────────
  const handleCloudLoad = async (templateId: string) => {
    try {
      const project = await fetchTemplateProject(templateId)
      applyProject(project)
    } catch (e) {
      setNodeErrors(id, ['Błąd pobierania szablonu'])
      setStatus('error')
      addToast({ type: 'error', message: `XTools: ${e instanceof Error ? e.message : 'błąd'}` })
    }
  }

  // ── File: handle upload ────────────────────────
  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        applyProject(JSON.parse(ev.target!.result as string))
      } catch {
        setNodeErrors(id, ['Nieprawidłowy plik JSON'])
        setStatus('error')
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

      {/* ── Mode toggle ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {(['cloud', 'file'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); if (status === 'done') clear() }}
            style={{
              flex: 1, padding: '3px 0', fontSize: 10, fontWeight: 600, cursor: 'pointer',
              borderRadius: 5, border: '1px solid',
              borderColor: mode === m ? 'var(--color-process)' : 'var(--color-field-border)',
              background:  mode === m ? 'var(--blue-50)' : 'var(--color-field-bg)',
              color:       mode === m ? 'var(--color-process)' : 'var(--color-text-muted)',
              transition: 'all .12s',
            }}
          >
            {m === 'cloud' ? '☁ Szablony' : '📁 Plik JSON'}
          </button>
        ))}
      </div>

      {/* ── Loaded banner ── */}
      {status === 'done' && loaded && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--blue-50)', border: '1px solid var(--blue-200)', borderRadius: 6, padding: '5px 8px', marginBottom: 4 }}>
          <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--color-process)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            ✓ {loaded}
          </span>
          <button onClick={clear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 12, padding: 0 }}>✕</button>
        </div>
      )}

      {/* ── CLOUD MODE ── */}
      {mode === 'cloud' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {templLoading && (
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)', padding: '8px 0' }}>
              ⟳ Ładowanie szablonów...
            </div>
          )}
          {templError && (
            <div style={{ fontSize: 10, color: 'var(--red-400, #f87171)', background: 'var(--color-field-bg)', border: '1px solid var(--color-field-border)', borderRadius: 5, padding: '4px 8px' }}>
              {templError}
            </div>
          )}
          {!templLoading && !templError && templates.length === 0 && (
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)', padding: '8px 0', fontFamily: 'var(--font-mono)' }}>
              Brak szablonów.<br />Zapisz pierwszy w ad-generator.
            </div>
          )}
          {templates.map(t => (
            <div
              key={t.id}
              style={{ background: 'var(--color-field-bg)', border: '1px solid var(--color-field-border)', borderRadius: 6, padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
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
                style={{ flexShrink: 0, fontSize: 10 }}
                onClick={() => handleCloudLoad(t.id)}
              >
                Wczytaj
              </button>
            </div>
          ))}
          <button
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', justifyContent: 'center', marginTop: 2, fontSize: 10 }}
            onClick={loadTemplateList}
            disabled={templLoading}
          >
            ↺ Odśwież
          </button>
        </div>
      )}

      {/* ── FILE MODE ── */}
      {mode === 'file' && (
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
          style={{
            border: `1.5px dashed ${status === 'done' ? 'var(--color-process)' : 'var(--color-field-border)'}`,
            borderRadius: 8, padding: '10px 10px 8px',
            background: status === 'done' ? 'var(--blue-50)' : 'var(--color-field-bg)',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}
        >
          {status !== 'done' && (
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center', fontFamily: 'var(--font-mono)', lineHeight: 1.5 }}>
              Przeciągnij JSON<br />lub kliknij poniżej
            </div>
          )}
          <button
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => fileRef.current?.click()}
          >
            {status === 'done' ? '↺ Zmień plik' : '⬆ Wczytaj JSON'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
          />
        </div>
      )}

      <StatusBar
        status={status}
        message={
          status === 'done'    ? summary ?? 'załadowano'
          : status === 'error' ? 'błąd'
          : mode === 'cloud'   ? `${templates.length} szablonów`
          : 'oczekuje na JSON'
        }
      />
    </BaseNode>
  )
}
