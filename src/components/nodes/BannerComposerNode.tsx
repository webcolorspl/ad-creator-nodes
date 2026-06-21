'use client'
import { useRef, useEffect, useCallback, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { resolveInput } from '@/lib/edgeResolver'
import { composeBanner } from '@/lib/canvasComposer'
import { AD_FORMATS } from '@/lib/constants'
import { BaseNode } from './BaseNode'
import { PortIndicator } from '@/components/ui/PortIndicator'
import { StatusBar } from '@/components/ui/StatusBar'
import type { NodeProps } from '@xyflow/react'
import type { CopyGroupData, BackgroundData, StyleData, ImageData, ThemeData, HeadlineData, CTAData } from '@/types'

export function BannerComposerNode({ id }: NodeProps) {
  const { edges, nodeOutputs, setNodeOutput, addToast } = useAppStore()
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const [composing, setComposing] = useState(false)
  const [composed,  setComposed]  = useState(false)

  const copy           = resolveInput<CopyGroupData>(id,  'copyGroup',  edges, nodeOutputs)
  const directHeadline = resolveInput<HeadlineData>(id,   'headline',   edges, nodeOutputs)
  const directCta      = resolveInput<CTAData>(id,        'cta',        edges, nodeOutputs)
  const bg             = resolveInput<BackgroundData>(id, 'background', edges, nodeOutputs)
  const style          = resolveInput<StyleData>(id,      'style',      edges, nodeOutputs)
  const img            = resolveInput<ImageData>(id,      'image',      edges, nodeOutputs)
  const theme          = resolveInput<ThemeData>(id,      'theme',      edges, nodeOutputs)
  const fmt            = AD_FORMATS.find(f => f.id === (style?.format ?? 'fb-feed')) ?? AD_FORMATS[0]

  const effectiveCopy: CopyGroupData | null = copy ?? (
    (directHeadline || directCta) ? {
      prompt:   { text: '', tone: 'neutral', lang: 'pl' },
      headline: directHeadline ?? { main: '' },
      cta:      directCta      ?? { text: '', style: 'primary' },
    } : null
  )

  const compose = useCallback(async () => {
    if (!canvasRef.current) return
    setComposing(true)
    try {
      await composeBanner(canvasRef.current, {
        copy:       effectiveCopy ?? null,
        background: bg?.url || null,
        bgColor:    bg?.color ?? null,
        image:      img?.url ?? null,
        style:      style ?? null,
        theme:      theme ?? null,
      })
      const dataUrl = canvasRef.current.toDataURL('image/png')
      setNodeOutput(id, { banner: { dataUrl, format: style?.format ?? 'fb-feed', width: fmt.w, height: fmt.h } })
      setComposed(true)
    } catch (e) {
      addToast({ type: 'error', message: `Błąd kompozycji: ${e instanceof Error ? e.message : 'nieznany'}` })
    }
    setComposing(false)
  }, [effectiveCopy, bg, style, img, theme, id, fmt, setNodeOutput, addToast])

  useEffect(() => {
    if (effectiveCopy || bg || img) void compose()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify({ copy, directHeadline, directCta, bg, img, style, theme })])

  const exportPng = () => {
    if (!canvasRef.current) return
    const a = document.createElement('a')
    a.download = `banner-${style?.format ?? 'fb-feed'}-${Date.now()}.png`
    a.href = canvasRef.current.toDataURL('image/png')
    a.click()
    addToast({ type: 'success', message: `Pobrano banner-${style?.format ?? 'fb-feed'}.png` })
  }

  return (
    <BaseNode id={id} nodeType="bannerComposerNode">
      <PortIndicator label="Copy Group"   connected={!!effectiveCopy} />
      <PortIndicator label="Tło / Grafika" connected={!!(bg || img)} />
      <PortIndicator label="Style"        connected={!!style}     />
      <div className="field-divider" />
      <div className="canvas-wrap" style={{ aspectRatio: `${fmt.w}/${fmt.h}`, minHeight: 80 }}>
        {composing && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.6)', zIndex: 2 }}>
            <div className="gen-spinner" />
          </div>
        )}
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        {!effectiveCopy && !bg && !img && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'var(--color-field-bg)', fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ fontSize: 24 }}>🎬</span>
            <span>Podłącz wejścia</span>
          </div>
        )}
      </div>
      {composed && (
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={exportPng}>
          ⬇ Pobierz PNG
        </button>
      )}
      <StatusBar
        status={composing ? 'running' : composed ? 'done' : 'idle'}
        message={composing ? 'komponowanie...' : composed ? `${fmt.label} · ${fmt.w}×${fmt.h}px` : 'oczekuje na wejścia'}
      />
    </BaseNode>
  )
}
