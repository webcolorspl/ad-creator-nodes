'use client'

// ═══════════════════════════════════════════════
// AD CREATOR — BannerEditorModal
// Full-screen portal modal for editing banner slave node overrides
// ═══════════════════════════════════════════════
import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { composeBanner } from '@/lib/canvasComposer'
import { AD_FORMATS } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import type {
  BannerCardOverrides,
  BannerMasterData,
  HeadlineData,
  CTAData,
  BgFit,
  VerticalPosition,
  AdFormat,
} from '@/types'

// ── Types ─────────────────────────────────────

export interface BannerEditorModalProps {
  open: boolean
  onClose: () => void
  formatId: string
  masterData: BannerMasterData | null
  overrides: BannerCardOverrides
  headlineOverride?: HeadlineData | null
  ctaOverride?: CTAData | null
  onApply: (overrides: BannerCardOverrides, headline: HeadlineData | null, cta: CTAData | null) => void
}

interface BannerPreset {
  id: string
  name: string
  config: Record<string, unknown>
  thumbnail: string | null
  created_at: string
}

interface AdGenElem {
  type: string
  text?: string
  color?: string
  size?: number
  weight?: number
  ctaBg?: string
  ctaTc?: string
}

interface AdGenBg {
  bgImg?: string | null
  bgColor?: string
  bgSize?: string
  bgPos?: { x: number; y: number }
  bgOverlay?: { enabled?: boolean; a1?: number }
}

interface AdGenProject {
  bg?: AdGenBg
  masterElems?: AdGenElem[]
}

interface AdGenTemplate {
  id: string
  name: string
  thumbnail: string | null
  project: AdGenProject
}

type TabId = 'bg' | 'image' | 'overlay' | 'text' | 'cta' | 'layout'
type RightTab = 'presets' | 'adgen'

// ── Helpers ───────────────────────────────────

function getFormatPrefix(formatId: string): string {
  const dash = formatId.indexOf('-')
  return dash >= 0 ? formatId.slice(0, dash) : formatId
}

function getRelatedFormats(formatId: string): AdFormat[] {
  const prefix = getFormatPrefix(formatId)
  return AD_FORMATS.filter(f => f.id.startsWith(prefix + '-'))
}

function getThumbDims(w: number, h: number): { tw: number; th: number } {
  const scale = Math.min(560 / w, 780 / h)
  return { tw: Math.round(w * scale), th: Math.round(h * scale) }
}

// ── Sub-components ────────────────────────────

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
}

function Slider({ label, value, min, max, step = 1, onChange }: SliderProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontSize: 12,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--color-text-muted)',
        marginBottom: 5,
      }}>
        {label} <span style={{ fontWeight: 400, textTransform: 'none' }}>{value.toFixed(step < 1 ? 2 : 0)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--color-process)', cursor: 'pointer' }}
      />
    </div>
  )
}

interface ColorFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
}

function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontSize: 12,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--color-text-muted)',
        marginBottom: 5,
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="color"
          value={value || '#000000'}
          onChange={e => onChange(e.target.value)}
          style={{ width: 36, height: 28, border: '1px solid var(--color-field-border)', borderRadius: 4, cursor: 'pointer', padding: 2, background: 'none' }}
        />
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="#000000"
          style={{
            flex: 1, padding: '4px 8px', fontSize: 13,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-field-border)',
            borderRadius: 4,
            color: 'var(--color-text)',
          }}
        />
      </div>
    </div>
  )
}

interface SectionLabelProps { children: React.ReactNode }
function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: 'var(--color-text-muted)',
      marginBottom: 8,
      marginTop: 18,
    }}>
      {children}
    </div>
  )
}

// ── Ad Generator mapping ──────────────────────

function projectToOverrides(project: AdGenProject): BannerCardOverrides {
  const bg = project.bg ?? {}
  const textElems = (project.masterElems ?? []).filter(e => e.type === 'text')
  const main = textElems[0]
  const sub  = textElems[1]
  return {
    bgColor:        bg.bgColor    ?? undefined,
    imageUrl:       bg.bgImg      ?? undefined,
    bgFit:          (bg.bgSize as BgFit) ?? 'cover',
    bgOffsetX:      bg.bgPos ? (bg.bgPos.x - 50) * 2 : 0,
    bgOffsetY:      bg.bgPos ? (bg.bgPos.y - 50) * 2 : 0,
    overlayOpacity: bg.bgOverlay?.enabled ? (bg.bgOverlay.a1 ?? undefined) : undefined,
    mainColor:      main?.color ?? undefined,
    subColor:       sub?.color  ?? undefined,
  }
}

function projectToHeadline(project: AdGenProject): Partial<HeadlineData> | null {
  const textElems = (project.masterElems ?? []).filter(e => e.type === 'text')
  if (!textElems.length) return null
  const main = textElems[0]
  const sub  = textElems[1]
  return {
    mainSize:   main?.size   ?? undefined,
    mainWeight: main?.weight ?? undefined,
    mainColor:  main?.color  ?? undefined,
    subSize:    sub?.size    ?? undefined,
    subColor:   sub?.color   ?? undefined,
  }
}

function projectToCta(project: AdGenProject): Partial<CTAData> | null {
  const ctaElem = (project.masterElems ?? []).find(e => e.type === 'cta')
  if (!ctaElem) return null
  return {
    text:      ctaElem.text      ?? undefined,
    bgColor:   ctaElem.ctaBg     ?? undefined,
    textColor: ctaElem.ctaTc     ?? undefined,
  }
}

// ── Main Component ────────────────────────────

export function BannerEditorModal({
  open,
  onClose,
  formatId,
  masterData,
  overrides,
  headlineOverride,
  ctaOverride,
  onApply,
}: BannerEditorModalProps) {
  // Local overrides copy
  const [local, setLocal] = useState<BannerCardOverrides>({ ...overrides })

  // Text overrides
  const [localHeadline, setLocalHeadline] = useState<HeadlineData | null>(
    masterData?.headline ? { ...masterData.headline } : null
  )
  const [localCta, setLocalCta] = useState<CTAData | null>(
    masterData?.cta ? { ...masterData.cta } : null
  )

  // Active tab
  const [tab, setTab] = useState<TabId>('bg')

  // Preview format (can differ from slave's format)
  const [previewFormatId, setPreviewFormatId] = useState(formatId)

  // Presets
  const [presets, setPresets] = useState<BannerPreset[]>([])
  const [presetsLoading, setPresetsLoading] = useState(false)
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [savingPreset, setSavingPreset] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const [activeAdGenId, setActiveAdGenId] = useState<string | null>(null)

  // Right panel tab
  const [rightTab, setRightTab] = useState<RightTab>('presets')

  // Ad Generator templates
  const [adGenTemplates, setAdGenTemplates] = useState<AdGenTemplate[]>([])
  const [adGenLoading, setAdGenLoading] = useState(false)

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Re-sync when modal opens
  useEffect(() => {
    if (open) {
      setLocal({ ...overrides })
      // Prefer slave's existing override; fall back to master data
      setLocalHeadline(
        headlineOverride !== undefined && headlineOverride !== null
          ? { ...headlineOverride }
          : masterData?.headline
            ? { ...masterData.headline }
            : null
      )
      setLocalCta(
        ctaOverride !== undefined && ctaOverride !== null
          ? { ...ctaOverride }
          : masterData?.cta
            ? { ...masterData.cta }
            : null
      )
      setPreviewFormatId(formatId)
      setTab('bg')
      setActivePresetId(null)
      setActiveAdGenId(null)
      loadPresets()
      loadAdGenTemplates()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // ESC key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Canvas composing
  useEffect(() => {
    if (!open || !canvasRef.current) return
    const canvas = canvasRef.current
    const fmt = AD_FORMATS.find(f => f.id === previewFormatId) ?? AD_FORMATS[0]
    const { tw, th } = getThumbDims(fmt.w, fmt.h)
    canvas.style.width  = `${tw}px`
    canvas.style.height = `${th}px`

    const effectiveHeadline: HeadlineData | null = localHeadline
      ? {
          ...(masterData?.headline ?? {}),
          ...localHeadline,
          mainColor: local.mainColor ?? localHeadline.mainColor ?? masterData?.headline?.mainColor,
          subColor:  local.subColor  ?? localHeadline.subColor  ?? masterData?.headline?.subColor,
        }
      : masterData?.headline
        ? {
            ...masterData.headline,
            mainColor: local.mainColor ?? masterData.headline.mainColor,
            subColor:  local.subColor  ?? masterData.headline.subColor,
          }
        : null

    const effectiveCta: CTAData | null = localCta
      ? { ...(masterData?.cta ?? {}), ...localCta } as CTAData
      : masterData?.cta ?? null

    composeBanner(canvas, {
      copy: effectiveHeadline
        ? { headline: effectiveHeadline, cta: effectiveCta ?? { text: '', style: 'primary' }, prompt: { text: '', tone: '', lang: '' } }
        : null,
      background: masterData?.imageUrl ?? null,
      bgColor:    local.bgColor ?? masterData?.bgColor ?? null,
      image:      local.imageUrl ?? masterData?.imageUrl ?? null,
      style:      { format: previewFormatId, width: fmt.w, height: fmt.h },
      theme:      masterData?.theme ?? null,
      layout:     {
        textPosition: local.textPosition ?? 'center',
        ctaVisible:   local.ctaVisible !== false,
      },
      bgFit:          local.bgFit,
      bgOffsetX:      local.bgOffsetX,
      bgOffsetY:      local.bgOffsetY,
      bgScale:        local.bgScale,
      overlayOpacity: local.overlayOpacity,
    })
  }, [open, local, localHeadline, localCta, previewFormatId, masterData])

  // Load Ad Generator templates
  const loadAdGenTemplates = useCallback(async () => {
    setAdGenLoading(true)
    try {
      const { data } = await supabase
        .from('banner_templates')
        .select('id,name,thumbnail,project')
        .limit(30)
      setAdGenTemplates((data as AdGenTemplate[]) ?? [])
    } catch {
      // silently ignore
    } finally {
      setAdGenLoading(false)
    }
  }, [])

  // Apply Ad Generator template
  const applyAdGenTemplate = (template: AdGenTemplate) => {
    setActiveAdGenId(template.id)
    setActivePresetId(null)
    const newOverrides = projectToOverrides(template.project)
    setLocal(newOverrides)
    const hl = projectToHeadline(template.project)
    if (hl) {
      setLocalHeadline(prev => ({ ...(prev ?? masterData?.headline ?? { main: '' }), ...hl }))
    }
    const cta = projectToCta(template.project)
    if (cta) {
      setLocalCta(prev => ({ ...(prev ?? masterData?.cta ?? { text: '', style: 'primary' as const }), ...cta } as CTAData))
    }
  }

  // Load presets
  const loadPresets = useCallback(async () => {
    setPresetsLoading(true)
    try {
      const { data } = await supabase
        .from('banner_presets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      setPresets((data as BannerPreset[]) ?? [])
    } catch {
      // silently ignore
    } finally {
      setPresetsLoading(false)
    }
  }, [])

  // Apply preset
  const applyPreset = (preset: BannerPreset) => {
    setActivePresetId(preset.id)
    setActiveAdGenId(null)
    const config = preset.config as Record<string, unknown>
    const newOverrides: BannerCardOverrides = {}
    if (typeof config.bgColor === 'string')        newOverrides.bgColor        = config.bgColor
    if (typeof config.mainColor === 'string')      newOverrides.mainColor      = config.mainColor
    if (typeof config.subColor === 'string')       newOverrides.subColor       = config.subColor
    if (typeof config.imageUrl === 'string')       newOverrides.imageUrl       = config.imageUrl
    if (typeof config.bgFit === 'string')          newOverrides.bgFit          = config.bgFit as BgFit
    if (typeof config.bgOffsetX === 'number')      newOverrides.bgOffsetX      = config.bgOffsetX
    if (typeof config.bgOffsetY === 'number')      newOverrides.bgOffsetY      = config.bgOffsetY
    if (typeof config.bgScale === 'number')        newOverrides.bgScale        = config.bgScale
    if (typeof config.overlayOpacity === 'number') newOverrides.overlayOpacity = config.overlayOpacity
    if (typeof config.textPosition === 'string')   newOverrides.textPosition   = config.textPosition as VerticalPosition
    if (typeof config.ctaVisible === 'boolean')    newOverrides.ctaVisible     = config.ctaVisible
    setLocal(newOverrides)

    if (config.headline && typeof config.headline === 'object') {
      setLocalHeadline(config.headline as HeadlineData)
    }
    if (config.cta && typeof config.cta === 'object') {
      setLocalCta(config.cta as CTAData)
    }
  }

  // Save preset
  const savePreset = async () => {
    if (!presetName.trim()) return
    setSavingPreset(true)
    setSaveError(null)
    try {
      // Require auth
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setSaveError('Musisz być zalogowany aby zapisać preset.')
        return
      }
      let orgId: string | null = null
      const { data: membership } = await supabase
        .from('organization_members')
        .select('org_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()
      orgId = membership?.org_id ?? null

      // Thumbnail from canvas
      let thumbnail: string | null = null
      if (canvasRef.current) {
        const offscreen = document.createElement('canvas')
        offscreen.width  = 120
        offscreen.height = 120
        const octx = offscreen.getContext('2d')
        if (octx) {
          octx.drawImage(canvasRef.current, 0, 0, 120, 120)
          thumbnail = offscreen.toDataURL('image/jpeg', 0.8)
        }
      }

      const config = {
        ...local,
        headline: localHeadline,
        cta: localCta,
      }

      const { error } = await supabase.from('banner_presets').insert({
        name: presetName.trim(),
        config,
        thumbnail,
        org_id: orgId,
      })

      if (error) {
        console.error('[banner_presets insert]', error)
        setSaveError(`${error.message} (code: ${error.code})`)
        return
      }

      setPresetName('')
      setShowSaveForm(false)
      await loadPresets()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Nieznany błąd')
    } finally {
      setSavingPreset(false)
    }
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const result = ev.target?.result
      if (typeof result === 'string') {
        setLocal(prev => ({ ...prev, imageUrl: result }))
      }
    }
    reader.readAsDataURL(file)
  }

  const patchLocal = (patch: Partial<BannerCardOverrides>) =>
    setLocal(prev => ({ ...prev, ...patch }))

  const relatedFormats = getRelatedFormats(formatId)
  const fmt = AD_FORMATS.find(f => f.id === previewFormatId) ?? AD_FORMATS[0]
  const { tw, th } = getThumbDims(fmt.w, fmt.h)

  if (!open) return null

  // ── Tabs ──────────────────────────────────────
  const tabs: { id: TabId; label: string }[] = [
    { id: 'bg',      label: 'Tło'     },
    { id: 'image',   label: 'Obraz'   },
    { id: 'overlay', label: 'Overlay' },
    { id: 'text',    label: 'Tekst'   },
    { id: 'cta',     label: 'CTA'     },
    { id: 'layout',  label: 'Layout'  },
  ]

  const tabStyle = (id: TabId): React.CSSProperties => ({
    padding: '5px 13px',
    borderRadius: 20,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: tab === id ? 700 : 400,
    background: tab === id ? 'var(--color-process)' : 'transparent',
    color: tab === id ? '#fff' : 'var(--color-text-muted)',
    transition: 'all 0.15s',
  })

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    fontSize: 14,
    background: 'var(--color-surface)',
    border: '1px solid var(--color-field-border)',
    borderRadius: 5,
    color: 'var(--color-text)',
    boxSizing: 'border-box',
  }

  const fitBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '5px 0',
    border: '1px solid var(--color-field-border)',
    borderRadius: 4,
    background: active ? 'var(--color-process)' : 'transparent',
    color: active ? '#fff' : 'var(--color-text-muted)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: active ? 700 : 400,
  })

  const modal = (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
          display: 'flex',
          flexDirection: 'column',
          width: 'clamp(640px, 50vw, 1800px)',
          height: 'clamp(480px, 85vh, 1400px)',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────── */}
        <div style={{
          height: 62,
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 14,
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)', fontSize: 22, lineHeight: 1, padding: '2px 8px',
            }}
            title="Zamknij"
          >
            ×
          </button>
          <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-text)', flex: 1 }}>
            Banner Editor
          </span>
          <button
            onClick={() => { setShowSaveForm(v => !v) }}
            style={{
              padding: '8px 18px', borderRadius: 7, border: '1px solid var(--color-field-border)',
              background: 'transparent', color: 'var(--color-text)', cursor: 'pointer', fontSize: 14,
            }}
          >
            Zapisz preset
          </button>
          <button
            onClick={() => { onApply({ ...local }, localHeadline, localCta); onClose() }}
            style={{
              padding: '8px 22px', borderRadius: 7, border: 'none',
              background: 'var(--color-process)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700,
            }}
          >
            Zastosuj
          </button>
        </div>

        {/* ── Body ───────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* ── LEFT PANEL ─────────────────────── */}
          <div style={{
            width: 312,
            borderRight: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {/* Tab pills */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              padding: '10px 12px',
              borderBottom: '1px solid var(--color-border)',
            }}>
              {tabs.map(t => (
                <button key={t.id} style={tabStyle(t.id)} onClick={() => setTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>

              {/* ── Tab: Tło ─────────────────────── */}
              {tab === 'bg' && (() => {
                const hasOwnBg = !!(local.bgColor || local.imageUrl)
                const masterBgColor = masterData?.bgColor ?? masterData?.theme?.bgColor ?? '#1a1a2e'
                return (
                  <>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                      marginBottom: 14, padding: '8px 10px',
                      background: hasOwnBg ? 'rgba(124,92,245,0.08)' : 'rgba(255,255,255,0.03)',
                      borderRadius: 6,
                      border: `1px solid ${hasOwnBg ? 'rgba(124,92,245,0.3)' : 'var(--color-field-border)'}`,
                    }}>
                      <input
                        type="checkbox"
                        checked={hasOwnBg}
                        style={{ margin: 0, accentColor: 'var(--color-process)' }}
                        onChange={e => {
                          if (!e.target.checked) {
                            patchLocal({ bgColor: undefined, imageUrl: undefined })
                          } else {
                            patchLocal({ bgColor: masterBgColor })
                          }
                        }}
                      />
                      <span style={{ fontSize: 12, color: hasOwnBg ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                        Własne tło
                      </span>
                      {!hasOwnBg && (
                        <span style={{
                          fontSize: 10, color: 'var(--color-text-muted)',
                          marginLeft: 'auto', opacity: 0.7,
                        }}>z mastera</span>
                      )}
                    </label>

                    {!hasOwnBg && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                          Kolor tła (z mastera)
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 36, height: 28, borderRadius: 4, border: '1px solid var(--color-field-border)', background: masterBgColor, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{masterBgColor}</span>
                        </div>
                      </div>
                    )}

                    {hasOwnBg && (
                      <ColorField
                        label="Kolor tła"
                        value={local.bgColor ?? masterBgColor}
                        onChange={v => patchLocal({ bgColor: v })}
                      />
                    )}

                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                      Obraz tła — zakładka <strong>Obraz</strong>
                    </div>
                  </>
                )
              })()}

              {/* ── Tab: Obraz ───────────────────── */}
              {tab === 'image' && (
                <>
                  <SectionLabel>URL obrazu</SectionLabel>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={local.imageUrl ?? ''}
                    onChange={e => patchLocal({ imageUrl: e.target.value || undefined })}
                    style={{ ...inputStyle, marginBottom: 8 }}
                  />
                  <SectionLabel>lub prześlij plik</SectionLabel>
                  <label style={{
                    display: 'block',
                    padding: '7px 10px',
                    border: '1px dashed var(--color-field-border)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 12,
                    color: 'var(--color-text-muted)',
                    textAlign: 'center',
                    marginBottom: 12,
                  }}>
                    Wybierz obraz
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                  </label>

                  <SectionLabel>Dopasowanie</SectionLabel>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    {(['cover', 'contain', 'fill'] as BgFit[]).map(f => (
                      <button
                        key={f}
                        style={fitBtnStyle((local.bgFit ?? 'cover') === f)}
                        onClick={() => patchLocal({ bgFit: f })}
                      >
                        {f === 'cover' ? 'Cover' : f === 'contain' ? 'Contain' : 'Fill'}
                      </button>
                    ))}
                  </div>

                  <Slider
                    label="Offset X"
                    value={local.bgOffsetX ?? 0}
                    min={-100} max={100}
                    onChange={v => patchLocal({ bgOffsetX: v })}
                  />
                  <Slider
                    label="Offset Y"
                    value={local.bgOffsetY ?? 0}
                    min={-100} max={100}
                    onChange={v => patchLocal({ bgOffsetY: v })}
                  />
                  <Slider
                    label="Scale"
                    value={local.bgScale ?? 1.0}
                    min={0.5} max={2.0} step={0.01}
                    onChange={v => patchLocal({ bgScale: v })}
                  />
                </>
              )}

              {/* ── Tab: Overlay ─────────────────── */}
              {tab === 'overlay' && (
                <>
                  <Slider
                    label="Przyciemnienie"
                    value={local.overlayOpacity ?? 0.42}
                    min={0} max={1} step={0.01}
                    onChange={v => patchLocal({ overlayOpacity: v })}
                  />
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                    0 = brak przyciemnienia, 1 = pełna czerń
                  </div>
                </>
              )}

              {/* ── Tab: Tekst ───────────────────── */}
              {tab === 'text' && (
                <>
                  <ColorField
                    label="Kolor nagłówka"
                    value={local.mainColor ?? masterData?.headline?.mainColor ?? '#ffffff'}
                    onChange={v => patchLocal({ mainColor: v })}
                  />
                  <ColorField
                    label="Kolor sub-nagłówka"
                    value={local.subColor ?? masterData?.headline?.subColor ?? 'rgba(255,255,255,0.82)'}
                    onChange={v => patchLocal({ subColor: v })}
                  />
                  <Slider
                    label="Rozmiar nagłówka"
                    value={localHeadline?.mainSize ?? 68}
                    min={16} max={120}
                    onChange={v => setLocalHeadline(prev => ({ ...(prev ?? masterData?.headline ?? { main: '' }), mainSize: v }))}
                  />
                  <Slider
                    label="Rozmiar sub-nagłówka"
                    value={localHeadline?.subSize ?? 26}
                    min={10} max={60}
                    onChange={v => setLocalHeadline(prev => ({ ...(prev ?? masterData?.headline ?? { main: '' }), subSize: v }))}
                  />
                  <SectionLabel>Treść nagłówka</SectionLabel>
                  <input
                    type="text"
                    placeholder={masterData?.headline?.main ?? 'Nagłówek...'}
                    value={localHeadline?.main ?? ''}
                    onChange={e => setLocalHeadline(prev => ({
                      ...(prev ?? masterData?.headline ?? { main: '' }),
                      main: e.target.value,
                    }))}
                    style={{ ...inputStyle, marginBottom: 8 }}
                  />
                  <SectionLabel>Sub-nagłówek</SectionLabel>
                  <input
                    type="text"
                    placeholder={masterData?.headline?.sub ?? 'Sub-nagłówek...'}
                    value={localHeadline?.sub ?? ''}
                    onChange={e => setLocalHeadline(prev => ({
                      ...(prev ?? masterData?.headline ?? { main: '' }),
                      sub: e.target.value,
                    }))}
                    style={inputStyle}
                  />
                </>
              )}

              {/* ── Tab: CTA ─────────────────────── */}
              {tab === 'cta' && (
                <>
                  <SectionLabel>Widoczność CTA</SectionLabel>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 12 }}>
                    <input
                      type="checkbox"
                      checked={local.ctaVisible !== false}
                      onChange={e => patchLocal({ ctaVisible: e.target.checked })}
                    />
                    <span style={{ fontSize: 13, color: 'var(--color-text)' }}>Pokaż przycisk CTA</span>
                  </label>
                  <SectionLabel>Treść CTA</SectionLabel>
                  <input
                    type="text"
                    placeholder={masterData?.cta?.text ?? 'Tekst przycisku...'}
                    value={localCta?.text ?? ''}
                    onChange={e => setLocalCta(prev => ({
                      ...(prev ?? masterData?.cta ?? { text: '', style: 'primary' as const }),
                      text: e.target.value,
                    }))}
                    style={inputStyle}
                  />
                </>
              )}

              {/* ── Tab: Layout ──────────────────── */}
              {tab === 'layout' && (
                <>
                  <SectionLabel>Pozycja tekstu</SectionLabel>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                    {([
                      { id: 'top',    label: 'Góra'   },
                      { id: 'center', label: 'Środek' },
                      { id: 'bottom', label: 'Dół'    },
                    ] as { id: VerticalPosition; label: string }[]).map(pos => (
                      <button
                        key={pos.id}
                        style={fitBtnStyle((local.textPosition ?? 'center') === pos.id)}
                        onClick={() => patchLocal({ textPosition: pos.id })}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── CENTER PANEL ───────────────────── */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            overflow: 'auto',
            padding: '20px 16px',
            gap: 16,
          }}>
            {/* Canvas preview */}
            <div style={{
              position: 'relative',
              width: tw,
              height: th,
              flexShrink: 0,
              borderRadius: 6,
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              border: '1px solid var(--color-border)',
              background: '#111',
            }}>
              <canvas
                ref={canvasRef}
                style={{ display: 'block', width: tw, height: th }}
              />
            </div>

            {/* Format chips */}
            {relatedFormats.length > 1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                {relatedFormats.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setPreviewFormatId(f.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 20,
                      border: '1px solid var(--color-field-border)',
                      background: previewFormatId === f.id ? 'var(--color-process)' : 'transparent',
                      color: previewFormatId === f.id ? '#fff' : 'var(--color-text-muted)',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: previewFormatId === f.id ? 700 : 400,
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* Format info */}
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              {fmt.w} × {fmt.h} px — podgląd {tw} × {th}
            </div>
          </div>

          {/* ── RIGHT PANEL ────────────────────── */}
          <div style={{
            width: 264,
            borderLeft: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--color-border)',
              flexShrink: 0,
            }}>
              {(['presets', 'adgen'] as RightTab[]).map(rt => (
                <button
                  key={rt}
                  onClick={() => setRightTab(rt)}
                  style={{
                    flex: 1,
                    padding: '11px 4px',
                    border: 'none',
                    borderBottom: rightTab === rt ? '2px solid var(--color-process)' : '2px solid transparent',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: rightTab === rt ? 700 : 400,
                    color: rightTab === rt ? 'var(--color-text)' : 'var(--color-text-muted)',
                  }}
                >
                  {rt === 'presets' ? 'Presety' : 'Ad Generator'}
                </button>
              ))}
            </div>

            {/* ── Tab: Presety ─────────────────── */}
            {rightTab === 'presets' && showSaveForm && (
              <div style={{
                padding: '10px 12px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                <input
                  type="text"
                  placeholder="Nazwa presetu..."
                  value={presetName}
                  onChange={e => setPresetName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') savePreset() }}
                  style={{ ...inputStyle, fontSize: 12 }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={savePreset}
                    disabled={savingPreset || !presetName.trim()}
                    style={{
                      flex: 1, padding: '5px 0', borderRadius: 4, border: 'none',
                      background: 'var(--color-process)', color: '#fff', cursor: 'pointer',
                      fontSize: 12, fontWeight: 700, opacity: savingPreset ? 0.6 : 1,
                    }}
                  >
                    {savingPreset ? '...' : 'Zapisz'}
                  </button>
                  <button
                    onClick={() => { setShowSaveForm(false); setPresetName(''); setSaveError(null) }}
                    style={{
                      padding: '5px 8px', borderRadius: 4,
                      border: '1px solid var(--color-field-border)',
                      background: 'transparent', color: 'var(--color-text-muted)',
                      cursor: 'pointer', fontSize: 12,
                    }}
                  >
                    Anuluj
                  </button>
                </div>
                {saveError && (
                  <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4, lineHeight: 1.4 }}>
                    ✕ {saveError}
                  </div>
                )}
              </div>
            )}

            {/* Presets list */}
            {rightTab === 'presets' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
                {presetsLoading && (
                  <div style={{ padding: '16px 12px', fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    Ładowanie...
                  </div>
                )}
                {!presetsLoading && presets.length === 0 && (
                  <div style={{ padding: '16px 12px', fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    Brak presetów
                  </div>
                )}
                {presets.map(preset => {
                  const isActive = activePresetId === preset.id
                  return (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        padding: '8px 12px',
                        background: isActive ? 'rgba(124,92,245,0.12)' : 'none',
                        border: 'none',
                        borderBottom: '1px solid var(--color-border)',
                        borderLeft: isActive ? '3px solid #7C5CF5' : '3px solid transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background .12s',
                      }}
                    >
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        {preset.thumbnail ? (
                          <img
                            src={preset.thumbnail}
                            alt={preset.name}
                            style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 5, display: 'block' }}
                          />
                        ) : (
                          <div style={{
                            width: 72, height: 72, borderRadius: 5,
                            background: 'var(--color-process)', opacity: 0.3,
                          }} />
                        )}
                        {isActive && (
                          <div style={{
                            position: 'absolute', top: 4, right: 4,
                            width: 18, height: 18, borderRadius: '50%',
                            background: '#7C5CF5',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                          }}>
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 14, color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)', lineHeight: 1.3, fontWeight: isActive ? 600 : 400 }}>
                        {preset.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Ad Generator templates list */}
            {rightTab === 'adgen' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
                {adGenLoading && (
                  <div style={{ padding: '16px 12px', fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    Ładowanie...
                  </div>
                )}
                {!adGenLoading && adGenTemplates.length === 0 && (
                  <div style={{ padding: '16px 12px', fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    Brak szablonów
                  </div>
                )}
                {adGenTemplates.map(tpl => {
                  const isActive = activeAdGenId === tpl.id
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => applyAdGenTemplate(tpl)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        padding: '8px 12px',
                        background: isActive ? 'rgba(124,92,245,0.12)' : 'none',
                        border: 'none',
                        borderBottom: '1px solid var(--color-border)',
                        borderLeft: isActive ? '3px solid #7C5CF5' : '3px solid transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background .12s',
                      }}
                    >
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        {tpl.thumbnail ? (
                          <img
                            src={tpl.thumbnail}
                            alt={tpl.name}
                            style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 5, display: 'block' }}
                          />
                        ) : (
                          <div style={{
                            width: 72, height: 72, borderRadius: 5,
                            background: 'rgba(124,92,245,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, color: 'rgba(255,255,255,0.3)',
                          }}>◈</div>
                        )}
                        {isActive && (
                          <div style={{
                            position: 'absolute', top: 4, right: 4,
                            width: 18, height: 18, borderRadius: '50%',
                            background: '#7C5CF5',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                          }}>
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 14, color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)', lineHeight: 1.3, fontWeight: isActive ? 600 : 400 }}>
                        {tpl.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

export default BannerEditorModal
