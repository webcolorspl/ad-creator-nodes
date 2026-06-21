'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { resolveInput } from '@/lib/edgeResolver'
import { composeBanner } from '@/lib/canvasComposer'
import { BaseNode } from './BaseNode'
import { StatusBar } from '@/components/ui/StatusBar'
import { AD_FORMATS, PLATFORM_GROUPS } from '@/lib/constants'
import type { NodeProps } from '@xyflow/react'
import type { BannerData, BackgroundData, StyleData, ThemeData, CopyGroupData, HeadlineData, CTAData } from '@/types'

export function BatchExportNode({ id }: NodeProps) {
  const { edges, nodeOutputs, addToast } = useAppStore()
  const [exporting, setExporting] = useState(false)
  const [selected,  setSelected]  = useState<Set<string>>(new Set(['fb-feed', 'ig-square', 'ig-story']))
  const [activePlt, setActivePlt] = useState('Facebook')

  const banner          = resolveInput<BannerData>(id,     'banner',     edges, nodeOutputs)
  const bg              = resolveInput<BackgroundData>(id,  'background', edges, nodeOutputs)
  const theme           = resolveInput<ThemeData>(id,       'theme',      edges, nodeOutputs)
  const copy            = resolveInput<CopyGroupData>(id,   'copyGroup',  edges, nodeOutputs)
  const directHeadline  = resolveInput<HeadlineData>(id,    'headline',   edges, nodeOutputs)
  const directCta       = resolveInput<CTAData>(id,         'cta',        edges, nodeOutputs)

  const effectiveCopy: CopyGroupData | null = copy ?? (
    (directHeadline || directCta) ? {
      prompt: { text: '', tone: 'neutral', lang: 'pl' },
      headline: directHeadline ?? { main: '' },
      cta: directCta ?? { text: '', style: 'primary' },
    } : null
  )

  const toggleFmt = (fmtId: string) => setSelected(s => {
    const n = new Set(s)
    n.has(fmtId) ? n.delete(fmtId) : n.add(fmtId)
    return n
  })

  const exportAll = async () => {
    if (!effectiveCopy && !banner) {
      addToast({ type: 'warn', message: 'Brak danych do eksportu' })
      return
    }
    if (!selected.size) {
      addToast({ type: 'warn', message: 'Wybierz min. 1 format' })
      return
    }
    setExporting(true)
    let exported = 0
    for (const fmtId of selected) {
      const f = AD_FORMATS.find(x => x.id === fmtId)
      if (!f) continue
      const canvas = document.createElement('canvas')
      const style: StyleData = { format: fmtId, width: f.w, height: f.h }
      try {
        await composeBanner(canvas, {
          copy:       effectiveCopy ?? null,
          background: bg?.url || null,
          bgColor:    bg?.color ?? null,
          image:      null,
          style,
          theme:      theme ?? null,
        })
        const a = document.createElement('a')
        a.download = `banner-${fmtId}-${Date.now()}.png`
        a.href = canvas.toDataURL('image/png')
        a.click()
        exported++
        await new Promise(r => setTimeout(r, 150))
      } catch {
        addToast({ type: 'error', message: `Błąd: ${fmtId}` })
      }
    }
    setExporting(false)
    addToast({ type: 'success', message: `✓ Pobrano ${exported} banerów` })
  }

  const pltGroups = PLATFORM_GROUPS

  return (
    <BaseNode id={id} nodeType="batchExportNode">
      {/* Platform filter tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 6 }}>
        {pltGroups.map(g => (
          <button key={g.label} onClick={() => setActivePlt(g.label)} style={{
            padding: '2px 7px', fontSize: 9, fontWeight: 700, borderRadius: 4, cursor: 'pointer',
            border: `1.5px solid ${activePlt === g.label ? g.color : 'var(--color-field-border)'}`,
            background: activePlt === g.label ? g.color + '22' : 'var(--color-field-bg)',
            color: activePlt === g.label ? g.color : 'var(--color-text-muted)',
          }} title={g.label}>{g.icon}</button>
        ))}
      </div>

      {/* Format checkboxes for active platform */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8 }}>
        {AD_FORMATS.filter(f => pltGroups.find(g => g.label === activePlt)?.ids.includes(f.id)).map(f => (
          <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={selected.has(f.id)}
              onChange={() => toggleFmt(f.id)}
              style={{ accentColor: 'var(--color-output)' }}
            />
            <div className="format-rect" style={{ width: f.pw * 0.6, height: f.ph * 0.6, flexShrink: 0 }} />
            <span style={{ color: 'var(--color-text-subtle)' }}>{f.label}</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 9, marginLeft: 'auto' }}>{f.w}×{f.h}</span>
          </label>
        ))}
      </div>

      <div style={{ fontSize: 9, color: 'var(--color-text-muted)', marginBottom: 6 }}>
        Zaznaczono: <strong style={{ color: 'var(--color-text)' }}>{selected.size}</strong> formatów
      </div>

      <button
        className="btn"
        style={{ width: '100%', justifyContent: 'center', background: 'var(--color-output)', color: '#fff', fontWeight: 600, opacity: exporting ? 0.6 : 1 }}
        disabled={exporting || selected.size === 0}
        onClick={exportAll}
      >
        {exporting ? '⏳ Eksportowanie...' : `⬇ Eksportuj ${selected.size} formatów`}
      </button>
      <StatusBar
        status={exporting ? 'running' : (effectiveCopy || banner) ? 'done' : 'idle'}
        message={exporting ? 'renderowanie...' : (effectiveCopy || banner) ? `gotowy · ${selected.size} wybranych` : 'podłącz Banner lub Copy'}
      />
    </BaseNode>
  )
}
