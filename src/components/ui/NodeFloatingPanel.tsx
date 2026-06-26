// ═══════════════════════════════════════════════
// AD CREATOR — NodeFloatingPanel
// Portal-based floating panel over ReactFlow canvas.
// Renders into document.body → unclipped by node overflow:hidden.
//
// Usage:
//   <NodeFloatingPanel nodeId={id} open={show} onClose={() => setShow(false)}>
//     <SomePanel />
//   </NodeFloatingPanel>
// ═══════════════════════════════════════════════
'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useReactFlow } from '@xyflow/react'

export type FloatingPanelPlacement = 'above' | 'below' | 'right'

interface Props {
  nodeId:    string
  open:      boolean
  onClose:   () => void
  children:  React.ReactNode
  placement?: FloatingPanelPlacement
  /** Approximate width of the node in px (flow coords) — used for 'right' placement */
  nodeWidth?: number
}

interface Coords { left: number; top: number }

function computeCoords(
  nodeId:    string,
  placement: FloatingPanelPlacement,
  nodeWidth: number,
  getNode:   ReturnType<typeof useReactFlow>['getNode'],
  getViewport: ReturnType<typeof useReactFlow>['getViewport'],
): Coords | null {
  const node = getNode(nodeId)
  if (!node) return null
  const { x: vx, y: vy, zoom } = getViewport()

  // Find ReactFlow container to get its screen offset
  const rfEl = document.querySelector('.react-flow') as HTMLElement | null
  const rfRect = rfEl?.getBoundingClientRect() ?? { left: 0, top: 0 }

  // Top-left corner of the node in screen px
  const nx = rfRect.left + node.position.x * zoom + vx
  const ny = rfRect.top  + node.position.y * zoom + vy

  // Approximate node height via measured data (ReactFlow stores it)
  const measuredH = (node as { measured?: { height?: number } }).measured?.height ?? 0
  const measuredW = (node as { measured?: { width?: number }  }).measured?.width  ?? nodeWidth

  switch (placement) {
    case 'above': return { left: nx + (measuredW * zoom) / 2, top: ny }
    case 'below': return { left: nx + (measuredW * zoom) / 2, top: ny + measuredH * zoom }
    // right: anchors to the mid-height of the node, just past the right edge + 40px button
    case 'right': return { left: nx + measuredW * zoom + 28, top: ny + (measuredH * zoom) / 2 }
  }
}

export function NodeFloatingPanel({
  nodeId,
  open,
  onClose,
  children,
  placement = 'above',
  nodeWidth = 300,
}: Props) {
  const { getNode, getViewport } = useReactFlow()
  const [coords, setCoords] = useState<Coords | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const recalc = useCallback(() => {
    const c = computeCoords(nodeId, placement, nodeWidth, getNode, getViewport)
    setCoords(c)
  }, [nodeId, placement, nodeWidth, getNode, getViewport])

  useEffect(() => {
    if (!open) { setCoords(null); return }
    recalc()
  }, [open, recalc])

  // Click-away to close
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [open, onClose])

  if (!open || !coords) return null

  const aboveStyle: React.CSSProperties =
    placement === 'above' ? { transform: 'translate(-50%, calc(-100% - 10px))' } :
    placement === 'below' ? { transform: 'translateX(-50%)', marginTop: 10 } :
    /* right */             { transform: 'translateY(-50%)' }

  return createPortal(
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: coords.left,
        top:  coords.top,
        zIndex: 9999,
        ...aboveStyle,
      }}
      onPointerDown={e => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body,
  )
}
