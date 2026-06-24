// ═══════════════════════════════════════════════
// AD CREATOR — CreativeNode
// Copy + Image + Brand w jednym nodzie (3 zakładki)
// ═══════════════════════════════════════════════
'use client'
import { useState, useRef, useEffect } from 'react'
import type { NodeProps } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import { useAppStore } from '@/store/appStore'

type Tab = 'copy' | 'image' | 'brand'

const FONTS = ['Inter', 'Roboto', 'Montserrat', 'Playfair Display', 'Oswald'] as const

export function CreativeNode({ id }: NodeProps) {
  const setNodeOutput = useAppStore(s => s.setNodeOutput)

  const [tab, setTab] = useState<Tab>('copy')

  // COPY tab state
  const [headline, setHeadline] = useState('')
  const [cta, setCta] = useState('')

  // OBRAZ tab state
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // MARKA tab state
  const [primaryColor, setPrimaryColor] = useState('#6C63FF')
  const [bgColor, setBgColor] = useState('#0E0E14')
  const [fontFamily, setFontFamily] = useState<typeof FONTS[number]>('Inter')
  const [brandName, setBrandName] = useState('')

  // Publish copy + theme outputs on every change
  useEffect(() => {
    setNodeOutput(id, {
      headline: { main: headline },
      cta: { text: cta, style: 'primary' },
      image: imageUrl ? { url: imageUrl, index: 0 } : undefined,
      theme: {
        brandName,
        bgColor,
        accentColor: primaryColor,
        fontFamily,
        logoVariant: 'horizontal',
      },
    })
  }, [headline, cta, imageUrl, primaryColor, bgColor, fontFamily, brandName]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const url = ev.target?.result as string
      setImageUrl(url)
    }
    reader.readAsDataURL(file)
  }

  const tabStyle = (t: Tab): React.CSSProperties => ({
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '.07em',
    padding: '4px 10px',
    background: 'transparent',
    border: 'none',
    borderBottom: tab === t ? '2px solid var(--color-process)' : '2px solid transparent',
    color: tab === t ? 'var(--color-process)' : 'var(--color-text-muted)',
    cursor: 'pointer',
    transition: 'color .15s, border-color .15s',
  })

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    display: 'block',
    marginBottom: 3,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    fontSize: 11,
    padding: '5px 8px',
    borderRadius: 5,
    border: '1px solid var(--color-field-border)',
    background: 'var(--color-field-bg)',
    color: 'var(--color-text)',
    boxSizing: 'border-box',
  }

  return (
    <BaseNode id={id} nodeType="creativeNode">
      <div style={{ width: 240 }}>
        {/* Tab bar */}
        <div
          style={{ display: 'flex', borderBottom: '1px solid var(--color-field-border)', marginBottom: 10 }}
          onMouseDown={e => e.stopPropagation()}
        >
          <button style={tabStyle('copy')}  onClick={() => setTab('copy')}>Copy</button>
          <button style={tabStyle('image')} onClick={() => setTab('image')}>Obraz</button>
          <button style={tabStyle('brand')} onClick={() => setTab('brand')}>Marka</button>
        </div>

        {/* ── COPY tab ── */}
        {tab === 'copy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} onMouseDown={e => e.stopPropagation()}>
            <div>
              <label style={labelStyle}>Nagłówek</label>
              <textarea
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                placeholder="Nagłówek banera…"
                rows={3}
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.4 }}
              />
            </div>
            <div>
              <label style={labelStyle}>CTA</label>
              <input
                type="text"
                value={cta}
                onChange={e => setCta(e.target.value)}
                placeholder="Kup teraz"
                style={inputStyle}
              />
            </div>
          </div>
        )}

        {/* ── OBRAZ tab ── */}
        {tab === 'image' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} onMouseDown={e => e.stopPropagation()}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              className="btn btn-ghost btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => fileInputRef.current?.click()}
            >
              Wgraj zdjęcie
            </button>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="preview"
                style={{
                  width: '100%',
                  maxHeight: 120,
                  objectFit: 'cover',
                  borderRadius: 6,
                  display: 'block',
                }}
              />
            )}
            {!imageUrl && (
              <div style={{
                height: 80,
                border: '1px dashed var(--color-field-border)',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted)',
                fontSize: 10,
              }}>
                Brak zdjęcia
              </div>
            )}
          </div>
        )}

        {/* ── MARKA tab ── */}
        {tab === 'brand' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} onMouseDown={e => e.stopPropagation()}>
            <div>
              <label style={labelStyle}>Nazwa marki</label>
              <input
                type="text"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                placeholder="Nazwa marki"
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Kolor główny</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid var(--color-field-border)', cursor: 'pointer', padding: 2, background: 'none' }}
                  />
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{primaryColor}</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Tło</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={e => setBgColor(e.target.value)}
                    style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid var(--color-field-border)', cursor: 'pointer', padding: 2, background: 'none' }}
                  />
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{bgColor}</span>
                </div>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Font</label>
              <select
                value={fontFamily}
                onChange={e => setFontFamily(e.target.value as typeof FONTS[number])}
                style={{ ...inputStyle }}
              >
                {FONTS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  )
}
