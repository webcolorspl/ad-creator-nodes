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
  onApply: (overrides: BannerCardOverrides, headline: HeadlineData | null, cta: CTAData | null) => void
}

interface BannerPreset {
  id: string
  name: string
  config: Record<string, unknown>
  thumbnail: string | null
  created_at: string
}

type TabId = 'bg' | 'image' | 'overlay' | 'text' | 'cta' | 'layout'

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
  const scale = Math.min(400 / w, 560 / h, 0.5)
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
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--color-text-muted)',
        marginBottom: 4,
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
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--color-text-muted)',
        marginBottom: 4,
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
      fontSize: 8,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: 'var(--color-text-muted)',
      marginBottom: 8,
      marginTop: 16,
    }}>
      {children}
    </div>
  )
}

// ── Main Component ────────────────────────────

export function BannerEditorModal({
  open,
  onClose,
  formatId,
  masterData,
  overrides,
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

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Re-sync when modal opens
  useEffect(() => {
    if (open) {
      setLocal({ ...overrides })
      setLocalHeadline(masterData?.headline ? { ...masterData.headline } : null)
      setLocalCta(masterData?.cta ? { ...masterData.cta } : null)
      setPreviewFormatId(formatId)
      setTab('bg')
      loadPresets()
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
    try {
      // Get org_id
      const { data: { user } } = await supabase.auth.getUser()
      let orgId: string | null = null
      if (user) {
        const { data: membership } = await supabase
          .from('organization_members')
          .select('org_id')
          .eq('user_id', user.id)
          .limit(1)
          .single()
        orgId = membership?.org_id ?? null
      }

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

      await supabase.from('banner_presets').insert({
        name: presetName.trim(),
        config,
        thumbnail,
        org_id: orgId,
      })

      setPresetName('')
      setShowSaveForm(false)
      await loadPresets()
    } catch {
      // silently ignore
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
    padding: '4px 10px',
    borderRadius: 20,
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: tab === id ? 700 : 400,
    background: tab === id ? 'var(--color-process)' : 'transparent',
    color: tab === id ? '#fff' : 'var(--color-text-muted)',
    transition: 'all 0.15s',
  })

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    fontSize: 13,
    background: 'var(--color-surface)',
    border: '1px solid var(--color-field-border)',
    borderRadius: 4,
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
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          width: 'min(98vw, 1100px)',
          height: 'min(96vh, 780px)',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────── */}
        <div style={{
          height: 52,
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 12,
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)', fontSize: 18, lineHeight: 1, padding: '2px 6px',
            }}
            title="Zamknij"
          >
            ×
          </button>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)', flex: 1 }}>
            Banner Editor
          </span>
          <button
            onClick={() => { setShowSaveForm(v => !v) }}
            style={{
              padding: '6px 14px', borderRadius: 6, border: '1px solid var(--color-field-border)',
              background: 'transparent', color: 'var(--color-text)', cursor: 'pointer', fontSize: 13,
            }}
          >
            Zapisz preset
          </button>
          <button
            onClick={() => { onApply({ ...local }, localHeadline, localCta); onClose() }}
            style={{
              padding: '6px 18px', borderRadius: 6, border: 'none',
              background: 'var(--color-process)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}
          >
            Zastosuj
          </button>
        </div>

        {/* ── Body ───────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* ── LEFT PANEL ─────────────────────── */}
          <div style={{
            width: 260,
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
              {tab === 'bg' && (
                <>
                  <ColorField
                    label="Kolor tła"
                    value={local.bgColor ?? masterData?.bgColor ?? '#1a1a2e'}
                    onChange={v => patchLocal({ bgColor: v })}
                  />
                  <SectionLabel>Przełącz widok</SectionLabel>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    Przejdź do zakładki <strong>Obraz</strong>, aby ustawić obraz tła.
                  </div>
                </>
              )}

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
            width: 220,
            borderLeft: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            <div style={{
              padding: '10px 12px',
              borderBottom: '1px solid var(--color-border)',
              fontWeight: 700,
              fontSize: 12,
              color: 'var(--color-text)',
            }}>
              Presety
            </div>

            {/* Save preset inline form */}
            {showSaveForm && (
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
                    onClick={() => { setShowSaveForm(false); setPresetName('') }}
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
              </div>
            )}

            {/* Presets list */}
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
              {presets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '7px 12px',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {/* Thumbnail */}
                  {preset.thumbnail ? (
                    <img
                      src={preset.thumbnail}
                      alt={preset.name}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: 60, height: 60, borderRadius: 4, flexShrink: 0,
                      background: 'var(--color-process)',
                      opacity: 0.3,
                    }} />
                  )}
                  <span style={{ fontSize: 12, color: 'var(--color-text)', lineHeight: 1.3 }}>
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

export default BannerEditorModal
