'use client'
import { useState } from 'react'
import { BaseNode } from './BaseNode'
import { useAppStore } from '@/store/appStore'
import type { CampaignConfig } from '@/store/appStore'
import type { NodeProps } from '@xyflow/react'

const CAMPAIGN_TYPES: { id: CampaignConfig['type']; label: string; icon: string; desc: string }[] = [
  { id: 'brand',       label: 'Brand Awareness', icon: '◎', desc: 'Zasięg i wizerunek marki' },
  { id: 'performance', label: 'Performance',      icon: '⚡', desc: 'Konwersja i sprzedaż' },
  { id: 'leads',       label: 'Lead Generation',  icon: '✉', desc: 'Zapisy, formularze' },
  { id: 'launch',      label: 'Product Launch',   icon: '★', desc: 'Nowy produkt / usługa' },
  { id: 'seasonal',    label: 'Seasonal',         icon: '◈', desc: 'Promocja sezonowa' },
  { id: 'remarketing', label: 'Remarketing',      icon: '↺', desc: 'Retargeting, powrót' },
]

const GOALS_BY_TYPE: Record<CampaignConfig['type'], { id: string; label: string }[]> = {
  brand:       [{ id:'awareness',label:'Świadomość marki'},{id:'reach',label:'Zasięg'},{id:'recall',label:'Zapamiętanie'}],
  performance: [{ id:'sales',label:'Sprzedaż bezpośrednia'},{id:'cart',label:'Porzucony koszyk'},{id:'upsell',label:'Upsell / Cross-sell'},{id:'traffic',label:'Ruch na stronie'}],
  leads:       [{ id:'form',label:'Formularz zapisu'},{id:'demo',label:'Demo / Konsultacja'},{id:'download',label:'Pobranie materiału'}],
  launch:      [{ id:'awareness',label:'Świadomość produktu'},{id:'waitlist',label:'Lista oczekujących'},{id:'preorder',label:'Przedsprzedaż'}],
  seasonal:    [{ id:'promo',label:'Promocja / Rabat'},{id:'event',label:'Wydarzenie'},{id:'gift',label:'Prezenty / Okazje'}],
  remarketing: [{ id:'visitors',label:'Odwiedzający stronę'},{id:'cart',label:'Porzucony koszyk'},{id:'customers',label:'Dotychczasowi klienci'}],
}

const BANNER_GROUPS: { id: CampaignConfig['groups'][number]; label: string; icon: string; desc: string }[] = [
  { id: 'prospecting', label: 'Prospecting', icon: '◎', desc: 'Nowi klienci, zimny ruch' },
  { id: 'remarketing', label: 'Remarketing', icon: '↺', desc: 'Odwiedzili, nie kupili' },
  { id: 'upsell',      label: 'Upsell',      icon: '⬆', desc: 'Aktualni klienci' },
  { id: 'seasonal',    label: 'Sezonowy',    icon: '◈', desc: 'Promocja czasowa' },
  { id: 'brand',       label: 'Brand',       icon: '◇', desc: 'Wizerunek marki' },
]

type Tab = 'type' | 'goals' | 'groups'

const TABS: { id: Tab; label: string }[] = [
  { id: 'type',   label: 'TYP'    },
  { id: 'goals',  label: 'CELE'   },
  { id: 'groups', label: 'GRUPY'  },
]

export function CampaignNode({ id }: NodeProps) {
  const launchCampaign = useAppStore(s => s.launchCampaign)
  const campaign       = useAppStore(s => s.campaign)
  const setCampaign    = useAppStore(s => s.setCampaign)

  const [tab,    setTab]    = useState<Tab>('type')
  const [type,   setType]   = useState<CampaignConfig['type'] | null>(null)
  const [goals,  setGoals]  = useState<string[]>([])
  const [groups, setGroups] = useState<CampaignConfig['groups']>([])

  function toggleGoal(g: string) {
    setGoals(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g])
  }
  function toggleGroup(g: CampaignConfig['groups'][number]) {
    setGroups(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g])
  }

  const canLaunch = !!type && goals.length > 0 && groups.length > 0

  function handleLaunch() {
    if (!type || !goals.length || !groups.length) return
    launchCampaign({ type, goals, groups })
  }

  // ── Summary view (after launch) ──────────────────────────────────
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
            onClick={() => { setCampaign(null); setTab('type'); setType(null); setGoals([]); setGroups([]) }}
          >
            ✎ Zmień konfigurację
          </button>
        </div>
      </BaseNode>
    )
  }

  // ── Config view ──────────────────────────────────────────────────
  const tabDone: Record<Tab, boolean> = {
    type:   !!type,
    goals:  goals.length > 0,
    groups: groups.length > 0,
  }

  return (
    <BaseNode id={id} nodeType="campaignNode">
      <div style={{ display:'flex', flexDirection:'column', gap:0, minWidth:240 }}>

        {/* Tab bar */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-field-border)',
          marginBottom: 10,
          gap: 0,
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onMouseDown={e => { e.stopPropagation(); setTab(t.id) }}
              style={{
                flex: 1,
                padding: '6px 4px',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '.07em',
                border: 'none',
                borderBottom: tab === t.id ? '2px solid var(--color-process)' : '2px solid transparent',
                background: 'none',
                color: tab === t.id ? 'var(--color-process)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                transition: 'all .12s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
              }}
            >
              {tabDone[t.id] && (
                <span style={{ color:'var(--color-gen)', fontSize:8, fontWeight:900 }}>✓</span>
              )}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: TYP */}
        {tab === 'type' && (
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {CAMPAIGN_TYPES.map(t => (
              <div
                key={t.id}
                onMouseDown={e => {
                  e.stopPropagation()
                  setType(t.id)
                  setGoals([])
                  setTimeout(() => setTab('goals'), 120)
                }}
                style={{
                  display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:6, cursor:'pointer',
                  border:`1px solid ${type === t.id ? 'var(--color-process)' : 'var(--color-field-border)'}`,
                  background: type === t.id ? 'rgba(124,92,245,0.08)' : 'var(--color-field-bg)',
                  transition:'all .12s',
                }}
              >
                <span style={{ fontSize:13, width:18, textAlign:'center' }}>{t.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'var(--color-text)' }}>{t.label}</div>
                  <div style={{ fontSize:9, color:'var(--color-text-muted)' }}>{t.desc}</div>
                </div>
                {type === t.id && <span style={{ color:'var(--color-process)', fontSize:11, fontWeight:900 }}>✓</span>}
              </div>
            ))}
          </div>
        )}

        {/* Tab: CELE */}
        {tab === 'goals' && (
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {!type ? (
              <div style={{ fontSize:11, color:'var(--color-text-muted)', padding:'8px', textAlign:'center' }}>
                Najpierw wybierz typ kampanii
              </div>
            ) : (
              <>
                {GOALS_BY_TYPE[type].map(g => (
                  <label
                    key={g.id}
                    onMouseDown={e => e.stopPropagation()}
                    style={{
                      display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:6, cursor:'pointer',
                      border:`1px solid ${goals.includes(g.id) ? 'var(--color-process)' : 'var(--color-field-border)'}`,
                      background: goals.includes(g.id) ? 'rgba(124,92,245,0.08)' : 'var(--color-field-bg)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={goals.includes(g.id)}
                      onChange={() => toggleGoal(g.id)}
                      style={{ accentColor:'var(--color-process)', width:13, height:13, flexShrink:0 }}
                    />
                    <span style={{ fontSize:11, color:'var(--color-text)', fontWeight: goals.includes(g.id) ? 600 : 400 }}>
                      {g.label}
                    </span>
                  </label>
                ))}
                <button
                  className="btn btn-primary btn-sm"
                  disabled={!goals.length}
                  onMouseDown={e => { e.stopPropagation(); setTab('groups') }}
                  style={{ width:'100%', justifyContent:'center', marginTop:6 }}
                >
                  Dalej → Grupy
                </button>
              </>
            )}
          </div>
        )}

        {/* Tab: GRUPY */}
        {tab === 'groups' && (
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {BANNER_GROUPS.map(g => (
              <label
                key={g.id}
                onMouseDown={e => e.stopPropagation()}
                style={{
                  display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:6, cursor:'pointer',
                  border:`1px solid ${groups.includes(g.id) ? 'var(--color-process)' : 'var(--color-field-border)'}`,
                  background: groups.includes(g.id) ? 'rgba(124,92,245,0.08)' : 'var(--color-field-bg)',
                }}
              >
                <input
                  type="checkbox"
                  checked={groups.includes(g.id)}
                  onChange={() => toggleGroup(g.id)}
                  style={{ accentColor:'var(--color-process)', width:13, height:13, flexShrink:0 }}
                />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, color:'var(--color-text)', fontWeight: groups.includes(g.id) ? 600 : 400 }}>
                    {g.icon} {g.label}
                  </div>
                  <div style={{ fontSize:9, color:'var(--color-text-muted)' }}>{g.desc}</div>
                </div>
              </label>
            ))}
            <button
              className="btn btn-primary btn-sm"
              disabled={!groups.length}
              onMouseDown={e => { e.stopPropagation(); handleLaunch() }}
              style={{ width:'100%', justifyContent:'center', marginTop:6 }}
            >
              Uruchom kampanię →
            </button>
          </div>
        )}

      </div>
    </BaseNode>
  )
}
