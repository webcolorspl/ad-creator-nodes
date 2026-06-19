'use client'
// ═══════════════════════════════════════════════
// FLOATING PANEL — draggable overlay panel
// Drag the header to reposition; click ▴/▾ to minimize
// ═══════════════════════════════════════════════
import { useRef, useCallback } from 'react'
import { useAppStore } from '@/store/appStore'

interface FloatingPanelProps {
  side: 'left' | 'right' | 'copy'
  title: string
  width: number
  children: React.ReactNode
}

export function FloatingPanel({ side, title, width, children }: FloatingPanelProps) {
  const panel            = useAppStore(s => s.panels[side])
  const setPanelPos      = useAppStore(s => s.setPanelPos)
  const toggleMinimized  = useAppStore(s => s.togglePanelMinimized)

  const posRef = useRef({ x: panel.x, y: panel.y })
  posRef.current = { x: panel.x, y: panel.y }

  const onDragStart = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()

    const startX = e.clientX - posRef.current.x
    const startY = e.clientY - posRef.current.y

    const onMove = (mv: PointerEvent) => {
      const newX = Math.max(0, Math.min(window.innerWidth  - width, mv.clientX - startX))
      const newY = Math.max(52, Math.min(window.innerHeight - 40,   mv.clientY - startY))
      setPanelPos(side, newX, newY)
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [side, width, setPanelPos])

  return (
    <div
      className="floating-panel"
      style={{ left: panel.x, top: panel.y, width }}
    >
      {/* Drag handle */}
      <div
        className="floating-panel-header"
        onPointerDown={onDragStart}
      >
        <span className="floating-panel-title">{title}</span>
        <button
          className="floating-panel-toggle"
          onPointerDown={e => e.stopPropagation()}
          onClick={() => toggleMinimized(side)}
          title={panel.minimized ? 'Rozwiń' : 'Zwiń'}
          aria-label={panel.minimized ? 'Rozwiń panel' : 'Zwiń panel'}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            {panel.minimized
              ? <path d="M1 3.5L5 7l4-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              : <path d="M1 6.5L5 3l4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            }
          </svg>
        </button>
      </div>

      {/* Content */}
      {!panel.minimized && (
        <div className="floating-panel-body">
          {children}
        </div>
      )}
    </div>
  )
}
