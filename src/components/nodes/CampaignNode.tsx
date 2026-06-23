'use client'
import { useState } from 'react'
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

const COL_W = 168
const COL_STYLE: React.CSSProperties = {
  width: COL_W,
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}
const DIVIDER: React.CSSProperties = {
  width: 1,
  background: 'var(--color-field-border)',
  flexShrink: 0,
  alignSelf: 'stretch',
}
const COL_HEADER: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '.08em',
  textTransform: 'uppercase' as const,
  color: 'var(--color-text-muted)',
  padding: '0 2px 6px',
  borderBottom: '1px solid var(--color-field-border)',
  marginBottom: 4,
}

function Row({ active, done, onClick, children }: {
  active: boolean; done?: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <div
      onMouseDown={e => { e.stopPropagation(); onClick() }}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 7px', borderRadius: 5, cursor: 'pointer',
        background: active ? 'rgba(124,92,245,0.12)' : 'transparent',
        border: `1px solid ${active ? 'var(--color-process)' : 'transparent'}`,
        transition: 'all .1s',
      }}
    >
      <div style={{ flex: 1 }}>{children}</div>
      {done && <span style={{ color: 'var(--color-gen)', fontSize: 9, fontWeight: 900 }}>✓</span>}
      {active && !done && <span style={{ color: 'var(--color-process)', fontSize: 9 }}>›</span>}
    </div>
  )
}

function CheckRow({ checked, onChange, children }: {
  checked: boolean; onChange: () => void; children: React.ReactNode
}) {
  return (
    <label
      onMouseDown={e => e.stopPropagation()}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 7px', borderRadius: 5, cursor: 'pointer',
        background: checked ? 'rgba(124,92,245,0.12)' : 'transparent',
        border: `1px solid ${checked ? 'var(--color-process)' : 'transparent'}`,
        transition: 'all .1s',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ accentColor: 'var(--color-process)', width: 12, height: 12, flexShrink: 0 }}
      />
      <div style={{ flex: 1 }}>{children}</div>
    </label>
  )
}

export function CampaignNode({ id }: NodeProps) {
  const launchCampaign = useAppStore(s => s.launchCampaign)
  const campaign       = useAppStore(s => s.campaign)
  const setCampaign    = useAppStore(s => s.setCampaign)

  const [type,   setType]   = useState<CampaignConfig['type'] | null>(null)
  const [goals,  setGoals]  = useState<string[]>([])
  const [groups, setGroups] = useState<CampaignConfig['groups']>([])

  function toggleGoal(g: string) {
    setGoals(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g])
  }
  function toggleGroup(g: CampaignConfig['groups'][number]) {
    setGroups(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g])
  }
  function handleSelectType(t: CampaignConfig['type']) {
    setType(t)
    setGoals([])
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
        <div style={{ display:'flex', flexDirection:'column', gap:8, minWidth:220 }}>
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
                <span key={g} style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:4, background:'var(--color-process)', color:'#fff', opacity:0.9 }}>
                  {info?.icon} {info?.label}
                </span>
              )
            })}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ width:'100%', justifyContent:'center', fontSize:10, marginTop:2 }}
            onMouseDown={e => { e.stopPropagation(); setCampaign(null); setType(null); setGoals([]); setGroups([]) }}
          >
            ✎ Zmień konfigurację
          </button>
        </div>
      </BaseNode>
    )
  }

  // ── Finder-column config ──────────────────────────────────────────
  const canLaunch = !!type && goals.length > 0 && groups.length > 0

  return (
    <BaseNode id={id} nodeType="campaignNode">
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>

        {/* 3 columns */}
        <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>

          {/* Col 1 — Typ */}
          <div style={COL_STYLE}>
            <div style={COL_HEADER}>Typ kampanii</div>
            {CAMPAIGN_TYPES.map(t => (
              <Row
                key={t.id}
                active={type === t.id}
                onClick={() => handleSelectType(t.id)}
              >
                <div style={{ fontSize:11, fontWeight:600, color:'var(--color-text)' }}>
                  {t.icon} {t.label}
                </div>
                <div style={{ fontSize:9, color:'var(--color-text-muted)' }}>{t.desc}</div>
              </Row>
            ))}
          </div>

          <div style={DIVIDER} />

          {/* Col 2 — Cele */}
          <div style={COL_STYLE}>
            <div style={COL_HEADER}>
              Cele {goals.length > 0 && <span style={{ color:'var(--color-gen)' }}>({goals.length})</span>}
            </div>
            {!type ? (
              <div style={{ fontSize:10, color:'var(--color-text-muted)', padding:'4px 2px', fontStyle:'italic' }}>
                ← wybierz typ
              </div>
            ) : GOALS_BY_TYPE[type].map(g => (
              <CheckRow
                key={g.id}
                checked={goals.includes(g.id)}
                onChange={() => toggleGoal(g.id)}
              >
                <div style={{ fontSize:11, color:'var(--color-text)', fontWeight: goals.includes(g.id) ? 600 : 400 }}>
                  {g.label}
                </div>
              </CheckRow>
            ))}
          </div>

          <div style={DIVIDER} />

          {/* Col 3 — Grupy */}
          <div style={COL_STYLE}>
            <div style={COL_HEADER}>
              Grupy {groups.length > 0 && <span style={{ color:'var(--color-gen)' }}>({groups.length})</span>}
            </div>
            {BANNER_GROUPS.map(g => (
              <CheckRow
                key={g.id}
                checked={groups.includes(g.id)}
                onChange={() => toggleGroup(g.id)}
              >
                <div style={{ fontSize:11, color:'var(--color-text)', fontWeight: groups.includes(g.id) ? 600 : 400 }}>
                  {g.icon} {g.label}
                </div>
                <div style={{ fontSize:9, color:'var(--color-text-muted)' }}>{g.desc}</div>
              </CheckRow>
            ))}
          </div>

        </div>

        {/* Launch */}
        <div style={{ borderTop:'1px solid var(--color-field-border)', paddingTop:8 }}>
          <button
            className="btn btn-primary btn-sm"
            disabled={!canLaunch}
            onMouseDown={e => { e.stopPropagation(); handleLaunch() }}
            style={{ width:'100%', justifyContent:'center' }}
          >
            {canLaunch ? 'Uruchom kampanię →' : `Uzupełnij: ${!type ? 'typ' : !goals.length ? 'cele' : 'grupy'}`}
          </button>
        </div>

      </div>
    </BaseNode>
  )
}
