// ═══════════════════════════════════════════════
// AD CREATOR — Main App Component
// Canvas full-screen; Sidebar & Inspector as floating panels
// ═══════════════════════════════════════════════
'use client'
import { useState, useCallback } from 'react'
import type { Node, Edge } from '@xyflow/react'
import { FlowCanvas }        from './FlowCanvas'
import { Inspector }         from './Inspector'
import { Topbar }            from './Topbar'
import { FloatingPanel }     from './FloatingPanel'
import { ApiKeyModal }       from './ApiKeyModal'
import { ToastList }         from './ToastList'
import { TestsPanel }        from './TestsPanel'
import { StartModal }        from './StartModal'
import { ResetConfirmModal } from './ResetConfirmModal'
import { useAppStore }       from '@/store/appStore'

export function AdCreatorApp() {
  const showApiModal = useAppStore(s => s.showApiModal)
  const showTests    = useAppStore(s => s.showTests)
  const resetCanvas  = useAppStore(s => s.resetCanvas)
  const [liveNodes, setLiveNodes] = useState<Node[]>([])
  const [liveEdges, setLiveEdges] = useState<Edge[]>([])

  const handleChange = useCallback((nodes: Node[], edges: Edge[]) => {
    setLiveNodes(nodes)
    setLiveEdges(edges)
  }, [])

  return (
    <div className="app-shell">
      <Topbar />
      <FlowCanvas onChange={handleChange} />

      <FloatingPanel side="right" title="Inspektor" width={300}>
        <Inspector nodes={liveNodes} edges={liveEdges} />
      </FloatingPanel>

      {showApiModal && <ApiKeyModal />}
      {showTests    && <TestsPanel />}
      <ToastList />
      <StartModal />
      <ResetConfirmModal onConfirm={resetCanvas} />
    </div>
  )
}
