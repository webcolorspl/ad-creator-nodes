'use client'
import { useState } from 'react'
import { useReactFlow } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import { useAppStore } from '@/store/appStore'
import type { CampaignConfig } from '@/store/appStore'
import type { NodeProps } from '@xyflow/react'

const CAMPAIGN_TYPES: { id: CampaignConfig['type']; label: string; icon: string; desc: string }[] = [
  { id: 'brand',       label: 'Brand Awareness', icon: '◎', desc: 'Zasięg i wizerunek' },
  { id: 'performance', label: 'Performance',      icon: '⚡', desc: 'Konwersja i sprzedaż' },
  { id: 'leads',       label: 'Lead Generation',  icon: '✉', desc: 'Zapisy, formularze' },
  { id: 'launch',      label: 'Product Launch',   icon: '★', desc: 'Nowy produkt' },
  { id: 'seasonal',    label: 'Seasonal',         icon: '◈', desc: 'Promocja sezonowa' },
  { id: 'remarketing', label: 'Remarketing',      icon: '↺', desc: 'Retargeting' },
]

const GOALS_BY_TYPE: Record<CampaignConfig['type'], { id: string; label: string }[]> = {
  brand:       [{ id:'awareness',label:'Świadomość marki'},{id:'reach',label:'Zasięg'},{id:'recall',label:'Zapamiętanie'}],
  performance: [{ id:'sales',label:'Sprzedaż'},{id:'cart',label:'Porzucony koszyk'},{id:'upsell',label:'Upsell'},{id:'traffic',label:'Ruch na stronie'}],
  leads:       [{ id:'form',label:'Formularz zapisu'},{id:'demo',label:'Demo / Konsultacja'},{id:'download',label:'Pobranie materiału'}],
  launch:      [{ id:'awareness',label:'Świadomość produktu'},{id:'waitlist',label:'Lista oczekujących'},{id:'preorder',label:'Przedsprzedaż'}],
  seasonal:    [{ id:'promo',label:'Promocja / Rabat'},{id:'event',label:'Wydarzenie'},{id:'gift',label:'Prezenty / Okazje'}],
  remarketing: [{ id:'visitors',label:'Odwiedzający stronę'},{id:'cart',label:'Porzucony koszyk'},{id:'customers',label:'Dotychczasowi klienci'}],
}

const BANNER_GROUPS: { id: CampaignConfig['groups'][number]; label: string; icon: string; desc: string }[] = [
  { id: 'prospecting', label: 'Prospecting', icon: '◎', desc: 'Nowi klienci' },
  { id: 'remarketing', label: 'Remarketing', icon: '↺', desc: 'Odwiedzili, nie kupili' },
  { id: 'upsell',      label: 'Upsell',      icon: '⬆', desc: 'Aktualni klienci' },
  { id: 'seasonal',    label: 'Sezonowy',    icon: '◈', desc: 'Promocja czasowa' },
  { id: 'brand',       label: 'Brand',       icon: '◇', desc: 'Wizerunek marki' },
]

const COL_W = 164

export function CampaignNode({ id }: NodeProps) {
  const launchCampaign = useAppStore(s => s.launchCampaign)
  const campaign       = useAppStore(s => s.campaign)
  const setCampaign    = useAppStore(s => s.setCampaign)

  const { fitView } = useReactFlow()

  const [type,   setType]   = useState<CampaignConfig['type'] | null>(null)
  const [goals,  setGoals]  = useState<string[]>([])
  const [groups, setGroups] = useState<CampaignConfig['groups']>([])

  const showGoals  = !!type
  const showGroups = goals.length > 0

  function recenter() {
    setTimeout(() => fitView({ nodes: [{ id }], duration: 350, padding: 0.35 }), 320)
  }

  function handleSelectType(t: CampaignConfig['type']) {
    setType(t)
    setGoals([])
    if (!type) recenter()   // tylko pierwsze rozwinięcie
  }
  function toggleGoal(g: string) {
    const wasEmpty = goals.length === 0
    setGoals(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g])
    if (wasEmpty) recenter()  // pierwsze zaznaczenie → pojawia się col3
  }
  function toggleGroup(g: CampaignConfig['groups'][number]) {
    setGroups(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g])
  }
  function handleLaunch() {
    if (!type || !goals.length || !groups.length) return
    launchCampaign({ type, goals, groups })
  }

  // ── Summary view ─────────────────────────────────────────────────
  if (campaign) {
    const typeInfo = CAMPAIGN_TYPES.find(t => t.id === campaign.type)
    return (
      <BaseNode id={id} nodeType="campaignNode">
        <div style={{ display:'flex', flexDirection:'column', gap:8, minWidth:180 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:18 }}>{typeInfo?.icon}</span>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--color-text)' }}>{typeInfo?.label}</div>
              <div style={{ fontSize:10, color:'var(--color-text-muted)' }}>{campaign.goals.join(' · ')}</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
            {campaign.groups.map(g => {
              const info = BANNER_GROUPS.find(x => x.id === g)
              return (
                <span key={g} style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:4, background:'var(--color-process)', color:'#fff' }}>
                  {info?.icon} {info?.label}
                </span>
              )
            })}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ width:'100%', justifyContent:'center', fontSize:10 }}
            onMouseDown={e => { e.stopPropagation(); setCampaign(null); setType(null); setGoals([]); setGroups([]) }}
          >
            ✎ Zmień konfigurację
          </button>
        </div>
      </BaseNode>
    )
  }

  // ── Finder-style expanding columns ──────────────────────────────
  const colHeader: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, letterSpacing: '.08em',
    textTransform: 'uppercase', color: 'var(--color-text-muted)',
    paddingBottom: 6, marginBottom: 4,
    borderBottom: '1px solid var(--color-field-border)',
  }

  return (
    <BaseNode id={id} nodeType="campaignNode">
      <div style={{ display:'flex', gap:0, alignItems:'flex-start', overflow:'hidden' }}>

        {/* ── Col 1: Typ ── */}
        <div style={{ width: COL_W, flexShrink: 0, display:'flex', flexDirection:'column', gap:2 }}>
          <div style={colHeader}>Typ kampanii</div>
          {CAMPAIGN_TYPES.map(t => (
            <div
              key={t.id}
              onMouseDown={e => { e.stopPropagation(); handleSelectType(t.id) }}
              style={{
                display:'flex', alignItems:'center', gap:7,
                padding:'5px 7px', borderRadius:5, cursor:'pointer',
                background: type === t.id ? 'rgba(124,92,245,0.12)' : 'transparent',
                border: `1px solid ${type === t.id ? 'var(--color-process)' : 'transparent'}`,
                transition: 'all .15s',
              }}
            >
              <span style={{ fontSize:12, width:16, textAlign:'center', flexShrink:0 }}>{t.icon}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:11, fontWeight: type === t.id ? 600 : 400, color:'var(--color-text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.label}</div>
                <div style={{ fontSize:9, color:'var(--color-text-muted)' }}>{t.desc}</div>
              </div>
              {type === t.id && <span style={{ color:'var(--color-process)', fontSize:10 }}>›</span>}
            </div>
          ))}
        </div>

        {/* ── Col 2: Cele — wsuwa się po wyborze typu ── */}
        <div style={{
          width: showGoals ? COL_W : 0,
          opacity: showGoals ? 1 : 0,
          overflow: 'hidden',
          transition: 'width 0.28s cubic-bezier(.4,0,.2,1), opacity 0.22s ease',
          flexShrink: 0,
        }}>
          <div style={{ width: COL_W, paddingLeft: 10, display:'flex', flexDirection:'column', gap:2 }}>
            <div style={{ ...colHeader, borderLeft: '1px solid var(--color-field-border)', paddingLeft:10, marginLeft:-10 }}>
              Cele {goals.length > 0 && <span style={{ color:'var(--color-gen)' }}>✓{goals.length}</span>}
            </div>
            {type && GOALS_BY_TYPE[type].map(g => (
              <label
                key={g.id}
                onMouseDown={e => e.stopPropagation()}
                style={{
                  display:'flex', alignItems:'center', gap:6,
                  padding:'5px 7px', borderRadius:5, cursor:'pointer',
                  background: goals.includes(g.id) ? 'rgba(124,92,245,0.12)' : 'transparent',
                  border: `1px solid ${goals.includes(g.id) ? 'var(--color-process)' : 'transparent'}`,
                  transition: 'all .15s',
                }}
              >
                <input
                  type="checkbox"
                  checked={goals.includes(g.id)}
                  onChange={() => toggleGoal(g.id)}
                  style={{ accentColor:'var(--color-process)', width:12, height:12, flexShrink:0 }}
                />
                <span style={{ fontSize:11, color:'var(--color-text)', fontWeight: goals.includes(g.id) ? 600 : 400 }}>
                  {g.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ── Col 3: Grupy — wsuwa się po wyborze celu ── */}
        <div style={{
          width: showGroups ? COL_W : 0,
          opacity: showGroups ? 1 : 0,
          overflow: 'hidden',
          transition: 'width 0.28s cubic-bezier(.4,0,.2,1), opacity 0.22s ease',
          flexShrink: 0,
        }}>
          <div style={{ width: COL_W, paddingLeft: 10, display:'flex', flexDirection:'column', gap:2 }}>
            <div style={{ ...colHeader, borderLeft: '1px solid var(--color-field-border)', paddingLeft:10, marginLeft:-10 }}>
              Grupy {groups.length > 0 && <span style={{ color:'var(--color-gen)' }}>✓{groups.length}</span>}
            </div>
            {BANNER_GROUPS.map(g => (
              <label
                key={g.id}
                onMouseDown={e => e.stopPropagation()}
                style={{
                  display:'flex', alignItems:'center', gap:6,
                  padding:'5px 7px', borderRadius:5, cursor:'pointer',
                  background: groups.includes(g.id) ? 'rgba(124,92,245,0.12)' : 'transparent',
                  border: `1px solid ${groups.includes(g.id) ? 'var(--color-process)' : 'transparent'}`,
                  transition: 'all .15s',
                }}
              >
                <input
                  type="checkbox"
                  checked={groups.includes(g.id)}
                  onChange={() => toggleGroup(g.id)}
                  style={{ accentColor:'var(--color-process)', width:12, height:12, flexShrink:0 }}
                />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, color:'var(--color-text)', fontWeight: groups.includes(g.id) ? 600 : 400 }}>
                    {g.icon} {g.label}
                  </div>
                  <div style={{ fontSize:9, color:'var(--color-text-muted)' }}>{g.desc}</div>
                </div>
              </label>
            ))}

            {/* Uruchom na dole col3 */}
            <button
              className="btn btn-primary btn-sm"
              disabled={!groups.length}
              onMouseDown={e => { e.stopPropagation(); handleLaunch() }}
              style={{ width:'100%', justifyContent:'center', marginTop:8 }}
            >
              Uruchom →
            </button>
          </div>
        </div>

      </div>
    </BaseNode>
  )
}
