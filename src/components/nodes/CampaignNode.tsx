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

export function CampaignNode({ id }: NodeProps) {
  const launchCampaign = useAppStore(s => s.launchCampaign)
  const campaign       = useAppStore(s => s.campaign)
  const setCampaign    = useAppStore(s => s.setCampaign)

  const [step,   setStep]   = useState<1 | 2 | 3>(1)
  const [type,   setType]   = useState<CampaignConfig['type'] | null>(null)
  const [goals,  setGoals]  = useState<string[]>([])
  const [groups, setGroups] = useState<CampaignConfig['groups']>([])

  function toggleGoal(g: string) {
    setGoals(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g])
  }
  function toggleGroup(g: CampaignConfig['groups'][number]) {
    setGroups(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g])
  }
  function handleLaunch() {
    if (!type || !goals.length || !groups.length) return
    launchCampaign({ type, goals, groups })
  }

  if (campaign) {
    const typeInfo = CAMPAIGN_TYPES.find(t => t.id === campaign.type)
    return (
      <BaseNode id={id} nodeType="campaignNode">
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:18 }}>{typeInfo?.icon}</span>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--color-text)' }}>{typeInfo?.label}</div>
              <div style={{ fontSize:10, color:'var(--color-text-muted)' }}>{campaign.goals.join(' · ')}</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:2 }}>
            {campaign.groups.map(g => {
              const info = BANNER_GROUPS.find(x => x.id === g)
              return (
                <span key={g} style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:4, background:'var(--color-process)', color:'#fff', opacity:0.85 }}>
                  {info?.icon} {info?.label}
                </span>
              )
            })}
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop:4, width:'100%', justifyContent:'center', fontSize:10 }}
            onClick={() => { setCampaign(null); setStep(1); setType(null); setGoals([]); setGroups([]) }}>
            ✎ Zmień konfigurację
          </button>
        </div>
      </BaseNode>
    )
  }

  return (
    <BaseNode id={id} nodeType="campaignNode">
      <div style={{ display:'flex', flexDirection:'column', gap:10, minWidth:220 }}>

        {/* Progress bar */}
        <div style={{ display:'flex', gap:3, marginBottom:2 }}>
          {([1,2,3] as const).map(s => (
            <div key={s} style={{ flex:1, height:2, borderRadius:2, background: s <= step ? 'var(--color-process)' : 'var(--color-field-border)', transition:'background .2s' }} />
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'.08em' }}>Krok 1 — Typ kampanii</div>
            {CAMPAIGN_TYPES.map(t => (
              <div key={t.id} onClick={() => setType(t.id)} style={{
                display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:6, cursor:'pointer',
                border:`1px solid ${type === t.id ? 'var(--color-process)' : 'var(--color-field-border)'}`,
                background: type === t.id ? 'rgba(99,102,241,0.08)' : 'var(--color-field-bg)', transition:'all .12s',
              }}>
                <span style={{ fontSize:14, width:20, textAlign:'center' }}>{t.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'var(--color-text)' }}>{t.label}</div>
                  <div style={{ fontSize:9, color:'var(--color-text-muted)' }}>{t.desc}</div>
                </div>
                {type === t.id && <span style={{ color:'var(--color-process)', fontSize:12 }}>✓</span>}
              </div>
            ))}
            <button className="btn btn-primary btn-sm" disabled={!type} onClick={() => type && setStep(2)} style={{ width:'100%', justifyContent:'center', marginTop:4 }}>
              Dalej →
            </button>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && type && (
          <>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'.08em' }}>Krok 2 — Cele kampanii</div>
            {GOALS_BY_TYPE[type].map(g => (
              <label key={g.id} style={{
                display:'flex', alignItems:'center', gap:8, padding:'5px 8px', borderRadius:6, cursor:'pointer',
                border:`1px solid ${goals.includes(g.id) ? 'var(--color-process)' : 'var(--color-field-border)'}`,
                background: goals.includes(g.id) ? 'rgba(99,102,241,0.08)' : 'var(--color-field-bg)',
              }}>
                <input type="checkbox" checked={goals.includes(g.id)} onChange={() => toggleGoal(g.id)}
                  style={{ accentColor:'var(--color-process)', width:13, height:13 }} />
                <span style={{ fontSize:11, color:'var(--color-text)', fontWeight: goals.includes(g.id) ? 600 : 400 }}>{g.label}</span>
              </label>
            ))}
            <div style={{ display:'flex', gap:6, marginTop:4 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)} style={{ flex:1, justifyContent:'center' }}>← Wróć</button>
              <button className="btn btn-primary btn-sm" disabled={!goals.length} onClick={() => setStep(3)} style={{ flex:1, justifyContent:'center' }}>Dalej →</button>
            </div>
          </>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'.08em' }}>Krok 3 — Grupy banerów</div>
            {BANNER_GROUPS.map(g => (
              <label key={g.id} style={{
                display:'flex', alignItems:'center', gap:8, padding:'5px 8px', borderRadius:6, cursor:'pointer',
                border:`1px solid ${groups.includes(g.id) ? 'var(--color-process)' : 'var(--color-field-border)'}`,
                background: groups.includes(g.id) ? 'rgba(99,102,241,0.08)' : 'var(--color-field-bg)',
              }}>
                <input type="checkbox" checked={groups.includes(g.id)} onChange={() => toggleGroup(g.id)}
                  style={{ accentColor:'var(--color-process)', width:13, height:13 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, color:'var(--color-text)', fontWeight: groups.includes(g.id) ? 600 : 400 }}>{g.icon} {g.label}</div>
                  <div style={{ fontSize:9, color:'var(--color-text-muted)' }}>{g.desc}</div>
                </div>
              </label>
            ))}
            <div style={{ display:'flex', gap:6, marginTop:4 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(2)} style={{ flex:1, justifyContent:'center' }}>← Wróć</button>
              <button className="btn btn-primary btn-sm" disabled={!groups.length} onClick={handleLaunch} style={{ flex:1, justifyContent:'center' }}>Uruchom →</button>
            </div>
          </>
        )}
      </div>
    </BaseNode>
  )
}
