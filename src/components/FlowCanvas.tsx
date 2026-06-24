// ═══════════════════════════════════════════════
// AD CREATOR — FlowCanvas
// React Flow canvas z drag&drop, save/load
// ═══════════════════════════════════════════════
'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ReactFlow, ReactFlowProvider, Background, BackgroundVariant, Controls, MiniMap, Panel,
  addEdge, useNodesState, useEdgesState, useReactFlow,
  type Node, type Edge, type OnConnect, type Rect,
} from '@xyflow/react'
import { Palette, FolderInput, Sparkles, PackageOpen } from 'lucide-react'
import { useAppStore }   from '@/store/appStore'
import { NODE_REGISTRY, PORT_COLORS, CAT_COLORS } from '@/lib/constants'
import {
  WebImportNode, XToolsImportNode,
  PromptNode, HeadlineNode, CTANode, HeadlineCTANode, CopyVariantsNode,
  CopyGroupNode, StyleNode,
  ImageGenNode, BGLibraryNode,
  BannerComposerNode, BatchExportNode,
  ThemeNode,
  CreativeNode,
  BannerGridNode,
} from './nodes'
import { HintNode } from './nodes/HintNode'
import { CampaignNode } from './nodes/CampaignNode'
import { ChannelNode }  from './nodes/ChannelNode'

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
  themeNode:          ThemeNode,
  hintNode:           HintNode,
  campaignNode:       CampaignNode,
  channelNode:        ChannelNode,
  creativeNode:       CreativeNode,
  bannerGridNode:     BannerGridNode,
}

// Section bounds for navigation pills
const SECTION_BOUNDS: Record<string, Rect> = {
  'brand':    { x: -480, y: 0,   width: 380, height: 1000 },
  'import':   { x:    0, y: 0,   width: 440, height: 1400 },
  'generate': { x:  460, y: 0,   width: 440, height: 900  },
  'export':   { x:  900, y: 100, width: 440, height: 1000 },
}

// Demo flow
const DEMO_NODES: Node[] = [
  // ── Brand (col 0, x=-420) ──────────────────────────
  { id:'th1', type:'themeNode',        position:{x:-420, y:80  }, data:{} },
  { id:'s1',  type:'styleNode',        position:{x:-420, y:480 }, data:{format:'ig-square'} },
  // ── Input (col 1, x=60) ────────────────────────────
  { id:'xt1', type:'xToolsImportNode', position:{x:60,   y:80  }, data:{} },
  { id:'wi1', type:'webImportNode',    position:{x:60,   y:600 }, data:{} },
  { id:'p1',  type:'promptNode',       position:{x:60,   y:900 }, data:{text:'Kampania letnia dla marki odzieżowej premium. Styl minimalistyczny, kobiety 25-40 lat.',tone:'minimal',lang:'pl'} },
  { id:'cv1', type:'copyVariantsNode', position:{x:60,   y:1200}, data:{} },
  // ── Generate (col 2, x=520) ─────────────────────────
  { id:'ig1', type:'imageGenNode',     position:{x:520,  y:80  }, data:{} },
  { id:'bg1', type:'bgLibraryNode',    position:{x:520,  y:580 }, data:{} },
  // ── Output (col 3, x=960) ───────────────────────────
  { id:'bc1', type:'bannerComposerNode', position:{x:960, y:200 }, data:{} },
  { id:'be1', type:'batchExportNode',    position:{x:960, y:720 }, data:{} },
]

const mke = (id: string, src: string, sh: string, tgt: string, th: string, type: string): Edge => ({
  id, source: src, sourceHandle: sh, target: tgt, targetHandle: th,
  animated: true, type: 'smoothstep',
  style: { stroke: PORT_COLORS[type] ?? '#C8D4F0', strokeWidth: 1.5, opacity: 0.7 },
})

// ── Setup view: tylko CampaignNode (przed uruchomieniem kampanii) ───
const SETUP_NODES: Node[] = [
  { id:'camp1', type:'campaignNode', position:{x:0, y:0}, data:{} },
]

// ── Wizard flow for Marketer mode (legacy / agency mode) ───────────
const WIZARD_NODES: Node[] = [
  { id:'camp1', type:'campaignNode',      position:{x:0,    y:-680}, data:{} },
  { id:'th1',   type:'themeNode',         position:{x:0,    y:-280}, data:{} },
  { id:'s1',    type:'styleNode',         position:{x:0,    y:-60 }, data:{format:'ig-square'} },
  { id:'cv1',   type:'copyVariantsNode',  position:{x:0,    y:200 }, data:{} },
  { id:'wi1',   type:'webImportNode',     position:{x:0,    y:560 }, data:{} },
  { id:'ig1',   type:'imageGenNode',      position:{x:420,  y:200 }, data:{} },
  { id:'bg1',   type:'bgLibraryNode',     position:{x:420,  y:600 }, data:{} },
  { id:'bc1',   type:'bannerComposerNode',position:{x:840,  y:200 }, data:{} },
  { id:'be1',   type:'batchExportNode',   position:{x:1280, y:200 }, data:{} },
]

const WIZARD_EDGES: Edge[] = [
  mke('wth1','th1','theme',     'bc1','theme',     'theme'),
  mke('wth2','th1','theme',     'be1','theme',     'theme'),
  mke('ws1', 's1', 'style',     'ig1','style',     'style'),
  mke('ws2', 's1', 'style',     'bc1','style',     'style'),
  mke('ws3', 's1', 'style',     'be1','style',     'style'),
  mke('wcv1','cv1','headline',  'bc1','headline',  'headline'),
  mke('wcv2','cv1','cta',       'bc1','cta',       'cta'),
  mke('wcv3','cv1','headline',  'be1','headline',  'headline'),
  mke('wcv4','cv1','cta',       'be1','cta',       'cta'),
  mke('wcv5','cv1','headline',  'ig1','headline',  'headline'),
  mke('wwi1','wi1','prompt',    'ig1','prompt',    'prompt'),
  mke('wwi2','wi1','background','bc1','background','background'),
  mke('wwi3','wi1','headline',  'bc1','headline',  'headline'),
  mke('wig1','ig1','image',     'bg1','image',     'image'),
  mke('wig2','ig1','image',     'bc1','image',     'image'),
  mke('wbg1','bg1','background','bc1','background','background'),
  mke('wbg2','bg1','background','be1','background','background'),
  mke('wbc1','bc1','banner',    'be1','banner',    'banner'),
]

const DEMO_EDGES: Edge[] = [
  // Theme → BannerComposer
  mke('eth1','th1','theme',     'bc1','theme',     'theme'),
  // Theme → BatchExport
  mke('eth2','th1','theme',     'be1','theme',     'theme'),
  // Style → ImageGen, BannerComposer, BatchExport
  mke('es1', 's1', 'style',     'ig1','style',     'style'),
  mke('es2', 's1', 'style',     'bc1','style',     'style'),
  mke('es3', 's1', 'style',     'be1','style',     'style'),
  // XTools → BannerComposer direct (headline, cta, background) — priority
  mke('ext1','xt1','headline',  'bc1','headline',  'headline'),
  mke('ext2','xt1','cta',       'bc1','cta',       'cta'),
  mke('ext3','xt1','background','bc1','background','background'),
  // XTools → BatchExport direct
  mke('ext4','xt1','headline',  'be1','headline',  'headline'),
  mke('ext5','xt1','cta',       'be1','cta',       'cta'),
  mke('ext6','xt1','background','be1','background','background'),
  // CopyVariants → BannerComposer (fallback when XTools empty)
  mke('ecv1','cv1','headline',  'bc1','headline',  'headline'),
  mke('ecv2','cv1','cta',       'bc1','cta',       'cta'),
  // CopyVariants → BatchExport (fallback)
  mke('ecv3','cv1','headline',  'be1','headline',  'headline'),
  mke('ecv4','cv1','cta',       'be1','cta',       'cta'),
  // Prompt → ImageGen (p1 first, wi1 as fallback)
  mke('e1',  'p1', 'prompt',    'ig1','prompt',    'prompt'),
  mke('ewi1','wi1','prompt',    'ig1','prompt',    'prompt'),
  // WebImport → BannerComposer/BatchExport (headline + background, fallback after XTools)
  mke('ewi2','wi1','background','bc1','background','background'),
  mke('ewi3','wi1','background','be1','background','background'),
  mke('ewi4','wi1','headline',  'bc1','headline',  'headline'),
  mke('ewi5','wi1','headline',  'be1','headline',  'headline'),
  // XTools → ImageGen (context for image prompt, fallback)
  mke('ext7','xt1','headline',  'ig1','headline',  'headline'),
  mke('ecv5','cv1','headline',  'ig1','headline',  'headline'),
  // ImageGen → BGLibrary (save to lib) + BannerComposer direct
  mke('eig1','ig1','image',     'bg1','image',     'image'),
  mke('e9',  'ig1','image',     'bc1','image',     'image'),
  mke('e7',  'bg1','background','bc1','background','background'),
  mke('e7b', 'bg1','background','be1','background','background'),
  // BannerComposer → BatchExport
  mke('ea',  'bc1','banner',    'be1','banner',    'banner'),
]

interface FlowCanvasProps {
  onChange: (nodes: Node[], edges: Edge[]) => void
}

interface FlowCanvasInnerProps extends FlowCanvasProps {
  initialNodes: Node[]
  initialEdges: Edge[]
}

function FlowCanvasInner({ onChange, initialNodes, initialEdges }: FlowCanvasInnerProps) {
  const syncEdges         = useAppStore(s => s.syncEdges)
  const deleteNode        = useAppStore(s => s.deleteNode)
  const addToast          = useAppStore(s => s.addToast)
  const selectNode        = useAppStore(s => s.selectNode)
  const zoomToId          = useAppStore(s => s.zoomToId)
  const clearZoom         = useAppStore(s => s.clearZoom)
  const campaignLaunchKey = useAppStore(s => s.campaignLaunchKey)
  const campaign          = useAppStore(s => s.campaign)
  const canvasResetKey    = useAppStore(s => s.canvasResetKey)
  const { setCenter, getNode, fitBounds, fitView } = useReactFlow()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [rfInstance, setRfInstance] = useState<{ screenToFlowPosition: (p: {x:number,y:number}) => {x:number,y:number} } | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const idRef = useRef(200)

  // Sync initial state to store + Inspector on mount
  useEffect(() => {
    syncEdges(initialEdges)
    onChange(initialNodes, initialEdges)
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

  // Spawn nodes when campaign is launched
  useEffect(() => {
    if (campaignLaunchKey === 0 || !campaign) return

    // ── 6 nodów: Campaign | Brand | Copy | Image | Lib | Preview ────
    //
    //  [Campaign]   [HeadlineCTA]  [ImageGen]
    //  [Theme    ]  [             [BGLibrary] → [BannerGrid]
    //
    const spawnNodes: Node[] = [
      { id:'camp1',  type:'campaignNode',    position:{x:0,    y:0},   data:{} },
      { id:'th1',    type:'themeNode',       position:{x:0,    y:340}, data:{} },
      { id:'copy1',  type:'headlineCTANode', position:{x:480,  y:0},   data:{} },
      { id:'img1',   type:'imageGenNode',    position:{x:480,  y:340}, data:{} },
      { id:'lib1',   type:'bgLibraryNode',   position:{x:880,  y:340}, data:{} },
      { id:'grid1',  type:'bannerGridNode',  position:{x:1320, y:0},   data:{} },
    ]
    const spawnEdges: Edge[] = [
      mke('e-hl',    'copy1', 'headline',   'grid1', 'headline',   'headline'),
      mke('e-cta',   'copy1', 'cta',        'grid1', 'cta',        'cta'),
      mke('e-theme', 'th1',   'theme',      'grid1', 'theme',      'theme'),
      mke('e-img',   'img1',  'image',      'lib1',  'image',      'image'),
      mke('e-bg',    'lib1',  'background', 'grid1', 'image',      'image'),
    ]
    setNodes(spawnNodes)
    setEdges(spawnEdges)
    syncEdges(spawnEdges)
    setTimeout(() => fitView({ padding: 0.15, duration: 600 }), 150)
  }, [campaignLaunchKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset canvas
  useEffect(() => {
    if (canvasResetKey === 0) return
    setNodes([{ id:'camp1', type:'campaignNode', position:{x:0, y:0}, data:{} }])
    setEdges([])
    syncEdges([])
    setTimeout(() => fitView({ padding: 0.3, duration: 400 }), 100)
  }, [canvasResetKey]) // eslint-disable-line react-hooks/exhaustive-deps

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
      {/* Navigation pills */}
      <div style={{
        position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, display: 'flex', gap: 3,
        background: 'rgba(255,255,255,0.92)',
        border: '1px solid rgba(210,220,250,0.5)',
        borderRadius: 18, padding: '4px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 2px 8px rgba(26,34,64,0.07), 0 8px 24px rgba(26,34,64,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
      }}>
        {[
          { key: 'brand',    label: 'Brand',   Icon: Palette,    color: '#3A67F0', bg: 'rgba(58,103,240,0.1)'  },
          { key: 'import',   label: 'Import',  Icon: FolderInput,color: '#7C5CF5', bg: 'rgba(124,92,245,0.1)'  },
          { key: 'generate', label: 'Generuj', Icon: Sparkles,   color: '#0EA87A', bg: 'rgba(14,168,122,0.1)'  },
          { key: 'export',   label: 'Eksport', Icon: PackageOpen,color: '#F07A3A', bg: 'rgba(240,122,58,0.1)'  },
        ].map(({ key, label, Icon, color, bg }) => (
          <button
            key={key}
            onClick={() => {
              const b = SECTION_BOUNDS[key]
              if (b) fitBounds(b, { padding: 0.15, duration: 500 })
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', fontSize: 11, fontWeight: 600, borderRadius: 13, cursor: 'pointer',
              border: 'none', background: 'transparent', color: 'var(--color-text-muted)',
              transition: 'background .18s, color .18s',
              letterSpacing: '.01em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = bg
              e.currentTarget.style.color = color
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--color-text-muted)'
            }}
          >
            <Icon size={12} strokeWidth={2} />
            {label}
          </button>
        ))}
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
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
  const appMode = useAppStore(s => s.appMode)
  // Marketer mode zaczyna od samego CampaignNode — reszta pojawia się po "Uruchom"
  const initialNodes = appMode === 'marketer' ? SETUP_NODES : DEMO_NODES
  const initialEdges = appMode === 'marketer' ? [] : DEMO_EDGES
  return (
    <ReactFlowProvider key={appMode}>
      <FlowCanvasInner
        onChange={onChange}
        initialNodes={initialNodes}
        initialEdges={initialEdges}
      />
    </ReactFlowProvider>
  )
}
