// ═══════════════════════════════════════════════
// AD CREATOR — FlowCanvas
// React Flow canvas z drag&drop, save/load
// ═══════════════════════════════════════════════
'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ReactFlow, ReactFlowProvider, Background, BackgroundVariant, Controls, MiniMap, Panel,
  addEdge, useNodesState, useEdgesState, useReactFlow,
  type Node, type Edge, type OnConnect,
} from '@xyflow/react'
import { useAppStore }   from '@/store/appStore'
import { NODE_REGISTRY, PORT_COLORS, CAT_COLORS } from '@/lib/constants'
import {
  WebImportNode, XToolsImportNode,
  PromptNode, HeadlineNode, CTANode, HeadlineCTANode, CopyVariantsNode,
  CopyGroupNode, StyleNode,
  ImageGenNode, BGLibraryNode,
  BannerComposerNode, BatchExportNode,
} from './nodes'

// Node type map for React Flow
const NODE_TYPES = {
  webImportNode:      WebImportNode,
  xToolsImportNode:   XToolsImportNode,
  promptNode:         PromptNode,
  headlineNode:       HeadlineNode,
  ctaNode:            CTANode,
  headlineCTANode:    HeadlineCTANode,
  copyVariantsNode:   CopyVariantsNode,
  copyGroupNode:      CopyGroupNode,
  styleNode:          StyleNode,
  imageGenNode:       ImageGenNode,
  bgLibraryNode:      BGLibraryNode,
  bannerComposerNode: BannerComposerNode,
  batchExportNode:    BatchExportNode,
}

// Demo flow
const DEMO_NODES: Node[] = [
  // ── Źródła (col 1, x=60) ───────────────────────────
  { id:'wi1', type:'webImportNode',      position:{x:60,   y:60  }, data:{} },
  { id:'p1',  type:'promptNode',         position:{x:60,   y:400 }, data:{text:'Kampania letnia dla marki odzieżowej premium. Styl minimalistyczny, kobiety 25-40 lat.',tone:'minimal',lang:'pl'} },
  // ── Warianty copy (col 1, x=60, y=760) ─────────────
  { id:'cv1', type:'copyVariantsNode',   position:{x:60,   y:760 }, data:{} },
  // ── Przetwarzanie (col 2, x=680) ───────────────────
  { id:'cg1', type:'copyGroupNode',      position:{x:680,  y:500 }, data:{} },
  { id:'s1',  type:'styleNode',          position:{x:680,  y:840 }, data:{format:'1:1'} },
  // ── Generowanie (col 3, x=1100) ────────────────────
  { id:'ig1', type:'imageGenNode',       position:{x:1100, y:140 }, data:{} },
  { id:'bg1', type:'bgLibraryNode',      position:{x:1100, y:580 }, data:{} },
  // ── Output (col 4, x=1520) ─────────────────────────
  { id:'bc1', type:'bannerComposerNode', position:{x:1520, y:400 }, data:{} },
  // ── Export (col 5, x=1940) ─────────────────────────
  { id:'be1', type:'batchExportNode',    position:{x:1940, y:420 }, data:{} },
]

const mke = (id: string, src: string, sh: string, tgt: string, th: string, type: string): Edge => ({
  id, source: src, sourceHandle: sh, target: tgt, targetHandle: th,
  animated: true, type: 'smoothstep',
  style: { stroke: PORT_COLORS[type] ?? '#C8D4F0', strokeWidth: 1.5, opacity: 0.7 },
})

const DEMO_EDGES: Edge[] = [
  mke('e1', 'p1', 'prompt',     'cg1','prompt',    'prompt'),
  mke('ecv1','cv1','headline',  'cg1','headline',  'headline'),
  mke('ecv2','cv1','cta',       'cg1','cta',       'cta'),
  mke('e4', 'p1', 'prompt',     'ig1','prompt',    'prompt'),
  mke('e5', 's1', 'style',      'ig1','style',     'style'),
  mke('e6', 'cg1','copyGroup',  'bc1','copyGroup', 'copy_group'),
  mke('e7', 'bg1','background', 'bc1','background','background'),
  mke('e8', 's1', 'style',      'bc1','style',     'style'),
  mke('e9', 'ig1','image',      'bc1','image',     'image'),
  mke('ea', 'bc1','banner',     'be1','banner',    'banner'),
]

interface FlowCanvasProps {
  onChange: (nodes: Node[], edges: Edge[]) => void
}

function FlowCanvasInner({ onChange }: FlowCanvasProps) {
  const { syncEdges, deleteNode, addToast, selectNode, zoomToId, clearZoom } = useAppStore()
  const { setCenter, getNode } = useReactFlow()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [rfInstance, setRfInstance] = useState<{ screenToFlowPosition: (p: {x:number,y:number}) => {x:number,y:number} } | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(DEMO_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState(DEMO_EDGES)
  const idRef = useRef(200)

  // Sync initial state to store + Inspector on mount
  useEffect(() => {
    syncEdges(DEMO_EDGES)
    onChange(DEMO_NODES, DEMO_EDGES)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Zoom to node on request from sidebar
  useEffect(() => {
    if (!zoomToId) return
    const n = getNode(zoomToId)
    if (n) {
      const w = (n.measured?.width  ?? 250) / 2
      const h = (n.measured?.height ?? 150) / 2
      selectNode(zoomToId)
      setCenter(n.position.x + w, n.position.y + h, { zoom: 1.3, duration: 450 })
    }
    clearZoom()
  }, [zoomToId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = useCallback((n: Node[], e: Edge[]) => {
    syncEdges(e)
    onChange(n, e)
  }, [syncEdges, onChange])

  const onConnect: OnConnect = useCallback(params => {
    const srcNode = nodes.find(n => n.id === params.source)
    const def = srcNode ? NODE_REGISTRY[srcNode.type!] : null
    const port = def?.outs.find(p => p.id === params.sourceHandle)
    const color = port ? PORT_COLORS[port.type] : '#6B6B85'
    setEdges(eds => {
      const next = addEdge({ ...params, animated: true, type: 'smoothstep', style: { stroke: color, strokeWidth: 1.5, opacity: 0.7 } }, eds)
      syncEdges(next)
      return next
    })
  }, [nodes, setEdges, syncEdges])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const nodeType = e.dataTransfer.getData('nodeType')
    if (!nodeType || !NODE_REGISTRY[nodeType]) return
    const bounds = wrapperRef.current!.getBoundingClientRect()
    const position = rfInstance!.screenToFlowPosition({ x: e.clientX - bounds.left, y: e.clientY - bounds.top })
    const newNode: Node = { id: `n${++idRef.current}`, type: nodeType, position, data: {} }
    setNodes(nds => [...nds, newNode])
    addToast({ type: 'success', message: `+ ${NODE_REGISTRY[nodeType].label}` })
  }, [rfInstance, setNodes, addToast])

  const save = () => {
    const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `ad-flow-${Date.now()}.json`
    a.click()
    addToast({ type: 'success', message: 'Flow zapisany' })
  }

  const load = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.json'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = ev => {
        try {
          const { nodes: n, edges: eg } = JSON.parse(ev.target!.result as string) as { nodes: Node[]; edges: Edge[] }
          setNodes(n); setEdges(eg)
          addToast({ type: 'success', message: 'Flow wczytany' })
        } catch {
          addToast({ type: 'error', message: 'Błąd parsowania JSON' })
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div ref={wrapperRef} className="canvas-area">
      {nodes.length === 0 && (
        <div className="canvas-empty-hint">
          <span style={{ fontSize: 48 }}>⬡</span>
          <p>Przeciągnij node z panelu lub wczytaj flow</p>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        onNodesChange={changes => { onNodesChange(changes); onChange(nodes, edges) }}
        onEdgesChange={changes => {
          onEdgesChange(changes)
          setEdges(eds => { syncEdges(eds); return eds })
        }}
        onConnect={onConnect}
        onInit={inst => setRfInstance(inst as typeof rfInstance)}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodesDelete={deleted => deleted.forEach(n => deleteNode(n.id))}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#C8D4F0" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={n => { const d = NODE_REGISTRY[n.type!]; return d ? CAT_COLORS[d.cat] : '#7A8AB0' }}
          maskColor="rgba(240,244,255,0.85)"
          style={{ background: '#fff', border: '1px solid var(--color-border)', cursor: 'pointer' }}
          zoomable
          pannable
          onNodeClick={(_, node) => {
            selectNode(node.id)
            const n = getNode(node.id)
            if (n) {
              const w = (n.measured?.width  ?? 250) / 2
              const h = (n.measured?.height ?? 150) / 2
              setCenter(n.position.x + w, n.position.y + h, { zoom: 1.2, duration: 400 })
            }
          }}
        />
        <Panel position="top-right">
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-ghost btn-sm" onClick={load}>⬆ Wczytaj</button>
            <button className="btn btn-ghost btn-sm" onClick={save}>⬇ Zapisz</button>
            <button className="btn btn-danger btn-sm" onClick={() => { setNodes([]); setEdges([]) }}>✕</button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}

export function FlowCanvas({ onChange }: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner onChange={onChange} />
    </ReactFlowProvider>
  )
}
