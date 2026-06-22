'use client'
// ═══════════════════════════════════════════════
// THEME NODE — Brand guidelines preset
// ═══════════════════════════════════════════════
import { useEffect, useState, useCallback } from 'react'
import { BaseNode } from './BaseNode'
import { StatusBar } from '@/components/ui/StatusBar'
import { useAppStore } from '@/store/appStore'
import type { NodeProps } from '@xyflow/react'
import type { ThemeData } from '@/types'

const PRESETS: Record<string, Omit<ThemeData, 'brandName'>> = {
  'Trans.eu': { bgColor: '#001A3A', accentColor: '#00A0E9', fontFamily: 'Manrope',    logoVariant: 'horizontal' },
  'CargoOn':  { bgColor: '#0D1117', accentColor: '#22C55E', fontFamily: 'Inter',      logoVariant: 'horizontal' },
  'TFF':      { bgColor: '#1A0A00', accentColor: '#F97316', fontFamily: 'Montserrat', logoVariant: 'horizontal' },
  'Pactus':   { bgColor: '#120824', accentColor: '#7C3AED', fontFamily: 'Poppins',    logoVariant: 'horizontal' },
  'Custom':   { bgColor: '#0A0A0A', accentColor: '#FFFFFF', fontFamily: 'Inter',      logoVariant: 'horizontal' },
}

const FONT_OPTIONS = ['Inter', 'Manrope', 'Montserrat', 'Poppins', 'Roboto', 'Open Sans']

export function ThemeNode({ id }: NodeProps) {
  const setNodeOutput = useAppStore(s => s.setNodeOutput)

  const [brand,       setBrand]       = useState<string>('Trans.eu')
  const [bgColor,     setBgColor]     = useState(PRESETS['Trans.eu'].bgColor)
  const [accentColor, setAccentColor] = useState(PRESETS['Trans.eu'].accentColor)
  const [fontFamily,  setFontFamily]  = useState(PRESETS['Trans.eu'].fontFamily)
  const [isDirty,     setIsDirty]     = useState(false)
  const [warnField,   setWarnField]   = useState('')
  const [pending,     setPending]     = useState<(() => void) | null>(null)

  const applyPreset = useCallback((name: string) => {
    const p = PRESETS[name]
    setBrand(name); setBgColor(p.bgColor); setAccentColor(p.accentColor); setFontFamily(p.fontFamily)
    setIsDirty(false); setWarnField(''); setPending(null)
  }, [])

  const guardedChange = (field: string, apply: () => void) => {
    if (brand !== 'Custom' && !isDirty) {
      setWarnField(field)
      setPending(() => apply)
    } else {
      apply(); setIsDirty(true)
    }
  }

  const confirmEdit = () => {
    if (pending) { pending(); setIsDirty(true) }
    setWarnField(''); setPending(null)
  }
  const cancelEdit = () => { setWarnField(''); setPending(null) }

  useEffect(() => {
    const theme: ThemeData = { brandName: brand, bgColor, accentColor, fontFamily, logoVariant: 'horizontal' }
    setNodeOutput(id, { theme })
  }, [brand, bgColor, accentColor, fontFamily, id, setNodeOutput])

  const swatch = (color: string) => (
    <span style={{
      display: 'inline-block', width: 12, height: 12, borderRadius: 2,
      background: color, border: '1px solid rgba(255,255,255,0.2)',
      verticalAlign: 'middle', marginRight: 4, flexShrink: 0,
    }} />
  )

  return (
    <BaseNode id={id} nodeType="themeNode">

      {/* Warning overlay */}
      {warnField && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.88)',
          borderRadius: 8, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: 14, gap: 10,
        }}>
          <div style={{ fontSize: 28 }}>⚠️</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#f87171', textAlign: 'center', letterSpacing: '0.02em' }}>
            NARUSZASZ BRAND GUIDELINES!
          </div>
          <div style={{ fontSize: 10, color: '#d1d5db', textAlign: 'center', lineHeight: 1.6 }}>
            Zmieniasz <strong style={{ color: '#fbbf24' }}>{warnField}</strong> dla brandu{' '}
            <strong style={{ color: '#60a5fa' }}>{brand}</strong>.<br />
            Spowoduje to <strong style={{ color: '#f87171' }}>niespójność wizualną</strong> materiałów reklamowych.
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
            <button onClick={cancelEdit} style={{
              padding: '5px 14px', fontSize: 10, fontWeight: 700, borderRadius: 5, cursor: 'pointer',
              border: '1.5px solid #4b5563', background: 'transparent', color: '#9ca3af',
            }}>
              ← Przywróć preset
            </button>
            <button onClick={confirmEdit} style={{
              padding: '5px 14px', fontSize: 10, fontWeight: 700, borderRadius: 5, cursor: 'pointer',
              border: '1.5px solid #f87171', background: '#7f1d1d', color: '#fca5a5',
            }}>
              Kontynuuj edycję ⚡
            </button>
          </div>
        </div>
      )}

      {/* Brand selector chips */}
      <label style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Brand preset</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 8 }}>
        {Object.keys(PRESETS).map(name => (
          <button key={name} onClick={() => applyPreset(name)} style={{
            padding: '3px 8px', fontSize: 9, fontWeight: 700, borderRadius: 4, cursor: 'pointer',
            border: `1.5px solid ${brand === name ? PRESETS[name].accentColor : 'var(--color-field-border)'}`,
            background: brand === name ? PRESETS[name].bgColor : 'var(--color-field-bg)',
            color: brand === name ? PRESETS[name].accentColor : 'var(--color-text-muted)',
            transition: 'all .1s',
          }}>
            {name}
          </button>
        ))}
      </div>

      {/* Live preview chip */}
      <div style={{
        background: bgColor, border: `2px solid ${accentColor}`, borderRadius: 6,
        padding: '7px 12px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: accentColor, fontFamily }}>{brand}</span>
        {isDirty && (
          <span style={{
            marginLeft: 'auto', fontSize: 8, color: '#f87171',
            border: '1px solid #f87171', borderRadius: 3, padding: '1px 5px', fontWeight: 700,
          }}>
            CUSTOM
          </span>
        )}
      </div>

      {/* Color/font controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          Tło
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3 }}>
            {swatch(bgColor)}
            <input
              type="color" value={bgColor}
              onChange={e => guardedChange('kolor tła', () => setBgColor(e.target.value))}
              style={{ width: 28, height: 20, border: 'none', background: 'none', cursor: 'pointer', padding: 0, borderRadius: 2 }}
            />
            <span style={{ fontSize: 9, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{bgColor}</span>
          </div>
        </label>

        <label style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          Akcent / CTA
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3 }}>
            {swatch(accentColor)}
            <input
              type="color" value={accentColor}
              onChange={e => guardedChange('kolor akcentu', () => setAccentColor(e.target.value))}
              style={{ width: 28, height: 20, border: 'none', background: 'none', cursor: 'pointer', padding: 0, borderRadius: 2 }}
            />
            <span style={{ fontSize: 9, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{accentColor}</span>
          </div>
        </label>

        <label style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          Font
          <select
            value={fontFamily}
            onChange={e => guardedChange('font', () => setFontFamily(e.target.value))}
            style={{
              display: 'block', width: '100%', marginTop: 3, fontSize: 10,
              background: 'var(--color-field-bg)', border: '1px solid var(--color-field-border)',
              color: 'var(--color-text)', borderRadius: 4, padding: '3px 6px', cursor: 'pointer',
            }}
          >
            {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
      </div>

      <StatusBar status="done" message={`${brand}${isDirty ? ' · custom' : ''} · ${fontFamily}`} />
    </BaseNode>
  )
}
