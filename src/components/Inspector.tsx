'use client'
import type { Node, Edge } from '@xyflow/react'
import { useAppStore } from '@/store/appStore'
import { NODE_REGISTRY, PORT_COLORS } from '@/lib/constants'

interface InspectorProps { nodes: Node[]; edges: Edge[] }

export function Inspector({ nodes, edges }: InspectorProps) {
  const selectedId     = useAppStore(s => s.selectedId)
  const nodeOutputs    = useAppStore(s => s.nodeOutputs)
  const nodeErrors     = useAppStore(s => s.nodeErrors)
  const inspectorTab   = useAppStore(s => s.inspectorTab)
  const genHistory     = useAppStore(s => s.genHistory)
  const setInspectorTab = useAppStore(s => s.setInspectorTab)
  const selNode = nodes.find(n => n.id === selectedId)
  const output  = selectedId ? nodeOutputs[selectedId] : null
  const errs    = selectedId ? nodeErrors[selectedId]  : []
  const def     = selNode ? NODE_REGISTRY[selNode.type!] : null
  const errNodes = nodes.filter(n => (nodeErrors[n.id] ?? []).length > 0)

  return (
    <aside className="inspector">
      <div className="inspector-tabs">
        {(['node', 'flow', 'history'] as const).map(tab => (
          <button key={tab} className={`inspector-tab${inspectorTab === tab ? ' active' : ''}`} onClick={() => setInspectorTab(tab)}>
            {tab === 'node' ? 'Node' : tab === 'flow' ? 'Flow' : 'Hist.'}
          </button>
        ))}
      </div>

      <div className="inspector-body">
        {inspectorTab === 'node' && (!selectedId ? (
          <div className="inspector-empty">Kliknij node<br />aby zobaczyć dane</div>
        ) : (
          <>
            <div className="inspector-section-title">Identyfikacja</div>
            <div className="inspector-kv"><div className="inspector-key">ID</div><div className="inspector-value">{selectedId}</div></div>
            {def && <div className="inspector-kv"><div className="inspector-key">Typ</div><div className="inspector-value">{def.icon} {def.label} [{def.cat}]</div></div>}
            {errs && errs.length > 0 && (
              <>
                <div className="inspector-section-title" style={{ color: '#FF6B6B' }}>Błędy</div>
                {errs.map((e, i) => <div key={i} className="inspector-value" style={{ color: '#FF6B6B', background: '#2A0A0A' }}>{e}</div>)}
              </>
            )}
            {output && Object.keys(output).length > 0 && (
              <>
                <div className="inspector-section-title">Output</div>
                {Object.entries(output).map(([k, v]) => (
                  <div key={k} className="inspector-kv">
                    <div className="inspector-key">{k}</div>
                    <div className="inspector-value">{typeof v === 'object' ? JSON.stringify(v, null, 2).slice(0, 200) : String(v)}</div>
                  </div>
                ))}
              </>
            )}
            {def && (
              <>
                <div className="inspector-section-title">Porty</div>
                {def.ins.map(p => {
                  const conn = edges.some(e => e.target === selectedId && e.targetHandle === p.id)
                  return (
                    <div key={p.id} className="inspector-kv">
                      <div className="inspector-key">IN: {p.id}</div>
                      <span className={`port-indicator ${conn ? 'port-connected' : 'port-disconnected'}`}>
                        <span>{conn ? '●' : '○'}</span><span>{conn ? 'ok' : '—'}</span>
                      </span>
                    </div>
                  )
                })}
                {def.outs.map(p => (
                  <div key={p.id} className="inspector-kv">
                    <div className="inspector-key">OUT: {p.id}</div>
                    <div className="inspector-value" style={{ color: PORT_COLORS[p.type] }}>{p.type}</div>
                  </div>
                ))}
              </>
            )}
          </>
        ))}

        {inspectorTab === 'flow' && (
          <>
            <div className="inspector-section-title">Statystyki</div>
            <div className="inspector-kv"><div className="inspector-key">Nodes</div><div className="inspector-value">{nodes.length} · {nodes.filter(n => !(nodeErrors[n.id] ?? []).length).length} ok · {errNodes.length} błędów</div></div>
            <div className="inspector-kv"><div className="inspector-key">Edges</div><div className="inspector-value">{edges.length} połączeń</div></div>
            {errNodes.length > 0 && (
              <>
                <div className="inspector-section-title" style={{ color: '#FF6B6B' }}>Nodes z błędami</div>
                {errNodes.map(n => (
                  <div key={n.id} className="inspector-kv">
                    <div className="inspector-key">{NODE_REGISTRY[n.type!]?.label}</div>
                    <div className="inspector-value" style={{ color: '#FF6B6B', background: '#2A0A0A' }}>{(nodeErrors[n.id] ?? []).join(' · ')}</div>
                  </div>
                ))}
              </>
            )}
            {edges.length > 0 && (
              <>
                <div className="inspector-section-title">Połączenia</div>
                {edges.map(e => {
                  const sn = nodes.find(n => n.id === e.source); const tn = nodes.find(n => n.id === e.target)
                  const sd = sn ? NODE_REGISTRY[sn.type!] : null; const td = tn ? NODE_REGISTRY[tn.type!] : null
                  return (
                    <div key={e.id} className="flow-edge-row">
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: (e.style as { stroke?: string })?.stroke ?? '#6B6B85', flexShrink: 0 }} />
                      <span style={{ color: 'var(--color-text-muted)' }}>{sd?.icon} {sd?.label}</span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>→</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>{td?.icon} {td?.label}</span>
                    </div>
                  )
                })}
              </>
            )}
          </>
        )}

        {inspectorTab === 'history' && (
          <>
            <div className="inspector-section-title">Historia generowania</div>
            {genHistory.length === 0 ? (
              <div className="inspector-empty">Brak grafik<br />w tej sesji</div>
            ) : (
              <div className="history-strip">
                {genHistory.map(item => (
                  <div key={item.id} className="history-item">
                    <img src={item.url} alt="" className="history-thumb" />
                    <div className="history-meta">
                      <div className="history-name">{item.prompt}</div>
                      <div className="history-time">{item.ts}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  )
}
