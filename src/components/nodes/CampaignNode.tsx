'use client'
import { useState, useRef, useEffect } from 'react'
import { useReactFlow } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import { useAppStore } from '@/store/appStore'
import { Eye, TrendingUp, Mail, Rocket, Sparkles, RefreshCw, Users, ArrowUpRight, CalendarDays, Heart, type LucideIcon } from '@/lib/icons'
import type { CampaignConfig } from '@/store/appStore'
import type { NodeProps } from '@xyflow/react'

const CAMPAIGN_TYPES: { id: CampaignConfig['type']; label: string; Icon: LucideIcon; desc: string; color: string }[] = [
  { id: 'brand',       label: 'Brand Awareness', Icon: Eye,        desc: 'Zasięg i wizerunek',  color: '#3A67F0' },
  { id: 'performance', label: 'Performance',      Icon: TrendingUp, desc: 'Konwersja i sprzedaż',color: '#0EA87A' },
  { id: 'leads',       label: 'Lead Generation',  Icon: Mail,       desc: 'Zapisy, formularze',  color: '#7C5CF5' },
  { id: 'launch',      label: 'Product Launch',   Icon: Rocket,     desc: 'Nowy produkt',        color: '#F07A3A' },
  { id: 'seasonal',    label: 'Seasonal',         Icon: Sparkles,   desc: 'Promocja sezonowa',   color: '#E7A800' },
  { id: 'remarketing', label: 'Remarketing',      Icon: RefreshCw,  desc: 'Retargeting',         color: '#E54D6A' },
]

const GOALS_BY_TYPE: Record<CampaignConfig['type'], { id: string; label: string }[]> = {
  brand:       [{ id:'awareness',label:'Świadomość marki'},{id:'reach',label:'Zasięg'},{id:'recall',label:'Zapamiętanie'}],
  performance: [{ id:'sales',label:'Sprzedaż'},{id:'cart',label:'Porzucony koszyk'},{id:'upsell',label:'Upsell'},{id:'traffic',label:'Ruch na stronie'}],
  leads:       [{ id:'form',label:'Formularz zapisu'},{id:'demo',label:'Demo / Konsultacja'},{id:'download',label:'Pobranie materiału'}],
  launch:      [{ id:'awareness',label:'Świadomość produktu'},{id:'waitlist',label:'Lista oczekujących'},{id:'preorder',label:'Przedsprzedaż'}],
  seasonal:    [{ id:'promo',label:'Promocja / Rabat'},{id:'event',label:'Wydarzenie'},{id:'gift',label:'Prezenty / Okazje'}],
  remarketing: [{ id:'visitors',label:'Odwiedzający stronę'},{id:'cart',label:'Porzucony koszyk'},{id:'customers',label:'Dotychczasowi klienci'}],
}

const BANNER_GROUPS: { id: CampaignConfig['groups'][number]; label: string; Icon: LucideIcon; desc: string; color: string }[] = [
  { id: 'prospecting', label: 'Prospecting', Icon: Users,         desc: 'Nowi klienci',          color: '#3A67F0' },
  { id: 'remarketing', label: 'Remarketing', Icon: RefreshCw,     desc: 'Odwiedzili, nie kupili', color: '#E54D6A' },
  { id: 'upsell',      label: 'Upsell',      Icon: ArrowUpRight,  desc: 'Aktualni klienci',      color: '#0EA87A' },
  { id: 'seasonal',    label: 'Sezonowy',    Icon: CalendarDays,  desc: 'Promocja czasowa',      color: '#E7A800' },
  { id: 'brand',       label: 'Brand',       Icon: Heart,         desc: 'Wizerunek marki',       color: '#7C5CF5' },
]

const COL_W = 164

export function CampaignNode({ id }: NodeProps) {
  const launchCampaign = useAppStore(s => s.launchCampaign)
  const campaign       = useAppStore(s => s.campaign)
  const setCampaign    = useAppStore(s => s.setCampaign)

  const { setNodes } = useReactFlow()

  const [type,     setType]     = useState<CampaignConfig['type'] | null>(null)
  const [goals,    setGoals]    = useState<string[]>([])
  const [groups,   setGroups]   = useState<CampaignConfig['groups']>([])
  const [headline, setHeadline] = useState('')
  const [audience, setAudience] = useState('')

  const xShiftRef        = useRef(0)
  const prevExtraColsRef = useRef(0)

  const showGoals   = !!type
  const showGroups  = goals.length > 0
  const showContent = groups.length > 0

  const numExtraCols = (showGoals ? 1 : 0) + (showGroups ? 1 : 0) + (showContent ? 1 : 0)

  // ── Symmetric expansion via position shift ────────────────────────
  useEffect(() => {
    const delta = numExtraCols - prevExtraColsRef.current
    if (delta !== 0) {
      const dx = delta * COL_W / 2
      setNodes(nds => nds.map(n =>
        n.id === id ? { ...n, position: { ...n.position, x: n.position.x - dx } } : n
      ))
      xShiftRef.current        += dx
      prevExtraColsRef.current  = numExtraCols
    }
  }, [numExtraCols]) // eslint-disable-line react-hooks/exhaustive-deps

  function restoreNode() {
    if (xShiftRef.current !== 0) {
      setNodes(nds => nds.map(n =>
        n.id === id ? { ...n, position: { ...n.position, x: n.position.x + xShiftRef.current } } : n
      ))
      xShiftRef.current        = 0
      prevExtraColsRef.current = 0
    }
  }

  function handleSelectType(t: CampaignConfig['type']) {
    setType(t)
    setGoals([])
    setGroups([])
  }

  function toggleGoal(g: string) {
    setGoals(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g])
    if (goals.includes(g) && goals.length === 1) setGroups([])
  }

  function toggleGroup(g: CampaignConfig['groups'][number]) {
    setGroups(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g])
  }

  function handleLaunch() {
    if (!type || !goals.length || !groups.length) return
    launchCampaign({
      type, goals, groups,
      headline: headline.trim() || undefined,
      audience: audience.trim() || undefined,
    })
  }

  // ── Summary view ─────────────────────────────────────────────────
  if (campaign) {
    const typeInfo = CAMPAIGN_TYPES.find(t => t.id === campaign.type)
    return (
      <BaseNode id={id} nodeType="campaignNode">
        <div style={{ display:'flex', flexDirection:'column', gap:8, minWidth:180 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            {typeInfo && (
              <div style={{
                width:32, height:32, borderRadius:9, flexShrink:0,
                background: `${typeInfo.color}18`,
                border: `1px solid ${typeInfo.color}30`,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <typeInfo.Icon size={16} strokeWidth={1.75} color={typeInfo.color} />
              </div>
            )}
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--color-text)' }}>{typeInfo?.label}</div>
              <div style={{ fontSize:10, color:'var(--color-text-muted)' }}>{campaign.goals.join(' · ')}</div>
            </div>
          </div>

          {campaign.headline && (
            <div style={{ fontSize:11, color:'var(--color-text)', fontStyle:'italic', padding:'4px 0' }}>
              "{campaign.headline}"
            </div>
          )}
          {campaign.audience && (
            <div style={{ fontSize:10, color:'var(--color-text-muted)' }}>
              Dla: {campaign.audience}
            </div>
          )}

          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
            {campaign.groups.map(g => {
              const info = BANNER_GROUPS.find(x => x.id === g)
              return (
                <span key={g} style={{
                  fontSize:9, fontWeight:600, padding:'2px 7px', borderRadius:20,
                  background: `${info?.color ?? '#7C5CF5'}15`,
                  color: info?.color ?? '#7C5CF5',
                  border: `1px solid ${info?.color ?? '#7C5CF5'}25`,
                  display:'inline-flex', alignItems:'center', gap:3,
                }}>
                  {info && <info.Icon size={9} strokeWidth={2} />}
                  {info?.label}
                </span>
              )
            })}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ width:'100%', justifyContent:'center', fontSize:10 }}
            onMouseDown={e => {
              e.stopPropagation()
              restoreNode()
              // Przywróć poprzednie wybory zamiast resetować
              setType(campaign.type)
              setGoals([...campaign.goals])
              setGroups([...campaign.groups])
              setHeadline(campaign.headline ?? '')
              setAudience(campaign.audience ?? '')
              setCampaign(null)
            }}
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

  const colBorder: React.CSSProperties = {
    borderLeft: '1px solid var(--color-field-border)',
    paddingLeft: 10, marginLeft: -10,
  }

  const canLaunch = !!(type && goals.length && groups.length)

  return (
    <BaseNode id={id} nodeType="campaignNode">
      <div style={{ display:'flex', flexDirection:'column', gap:0 }}>

        {/* ── Columns row ── */}
        <div style={{ display:'flex', gap:0, alignItems:'flex-start', overflow:'hidden' }}>

          {/* ── Col 1: Typ ── */}
          <div style={{ width: COL_W, flexShrink: 0, display:'flex', flexDirection:'column', gap:2 }}>
            <div style={colHeader}>Typ kampanii</div>
            {CAMPAIGN_TYPES.map(t => (
              <div
                key={t.id}
                onMouseDown={e => { e.stopPropagation(); handleSelectType(t.id) }}
                style={{
                  display:'flex', alignItems:'center', gap:8,
                  padding:'6px 7px', borderRadius:8, cursor:'pointer',
                  background: type === t.id ? `${t.color}12` : 'transparent',
                  border: `1px solid ${type === t.id ? `${t.color}40` : 'transparent'}`,
                  transition: 'all .15s',
                }}
              >
                <div style={{
                  width:24, height:24, borderRadius:6, flexShrink:0,
                  background: type === t.id ? `${t.color}18` : 'rgba(120,130,160,0.08)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition: 'background .15s',
                }}>
                  <t.Icon size={13} strokeWidth={1.75} color={type === t.id ? t.color : 'var(--color-text-muted)'} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, fontWeight: type === t.id ? 600 : 400, color: type === t.id ? t.color : 'var(--color-text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.label}</div>
                  <div style={{ fontSize:9, color:'var(--color-text-muted)' }}>{t.desc}</div>
                </div>
                {type === t.id && <span style={{ color: t.color, fontSize:11, fontWeight:600 }}>›</span>}
              </div>
            ))}
          </div>

          {/* ── Col 2: Cele ── */}
          <div style={{
            width: showGoals ? COL_W : 0,
            opacity: showGoals ? 1 : 0,
            overflow: 'hidden',
            transition: 'width 0.28s cubic-bezier(.4,0,.2,1), opacity 0.22s ease',
            flexShrink: 0,
          }}>
            <div style={{ width: COL_W, paddingLeft: 10, display:'flex', flexDirection:'column', gap:2 }}>
              <div style={{ ...colHeader, ...colBorder }}>
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

          {/* ── Col 3: Grupy ── */}
          <div style={{
            width: showGroups ? COL_W : 0,
            opacity: showGroups ? 1 : 0,
            overflow: 'hidden',
            transition: 'width 0.28s cubic-bezier(.4,0,.2,1), opacity 0.22s ease',
            flexShrink: 0,
          }}>
            <div style={{ width: COL_W, paddingLeft: 10, display:'flex', flexDirection:'column', gap:2 }}>
              <div style={{ ...colHeader, ...colBorder }}>
                Grupy {groups.length > 0 && <span style={{ color:'var(--color-gen)' }}>✓{groups.length}</span>}
              </div>
              {BANNER_GROUPS.map(g => (
                <label
                  key={g.id}
                  onMouseDown={e => e.stopPropagation()}
                  style={{
                    display:'flex', alignItems:'center', gap:8,
                    padding:'6px 7px', borderRadius:8, cursor:'pointer',
                    background: groups.includes(g.id) ? `${g.color}12` : 'transparent',
                    border: `1px solid ${groups.includes(g.id) ? `${g.color}40` : 'transparent'}`,
                    transition: 'all .15s',
                  }}
                >
                  <div style={{
                    width:24, height:24, borderRadius:6, flexShrink:0,
                    background: groups.includes(g.id) ? `${g.color}18` : 'rgba(120,130,160,0.08)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    transition: 'background .15s',
                  }}>
                    <g.Icon size={13} strokeWidth={1.75} color={groups.includes(g.id) ? g.color : 'var(--color-text-muted)'} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:11, color: groups.includes(g.id) ? g.color : 'var(--color-text)', fontWeight: groups.includes(g.id) ? 600 : 400 }}>
                      {g.label}
                    </div>
                    <div style={{ fontSize:9, color:'var(--color-text-muted)' }}>{g.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={groups.includes(g.id)}
                    onChange={() => toggleGroup(g.id)}
                    style={{ accentColor: g.color, width:12, height:12, flexShrink:0 }}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* ── Col 4: Treść (Headline + Dla kogo) ── */}
          <div style={{
            width: showContent ? COL_W : 0,
            opacity: showContent ? 1 : 0,
            overflow: 'hidden',
            transition: 'width 0.28s cubic-bezier(.4,0,.2,1), opacity 0.22s ease',
            flexShrink: 0,
          }}>
            <div style={{ width: COL_W, paddingLeft: 10, display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ ...colHeader, ...colBorder }}>Treść</div>

              {/* Headline */}
              <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                <div style={{ fontSize:9, fontWeight:600, color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'.06em' }}>
                  Hasło kampanii
                </div>
                <input
                  onMouseDown={e => e.stopPropagation()}
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  placeholder="Np. Twoja marka. Twój sukces."
                  style={{
                    width:'100%', fontSize:11, padding:'6px 8px', borderRadius:7,
                    border:'1px solid var(--color-field-border)',
                    background:'var(--color-field-bg)',
                    color:'var(--color-text)',
                    fontFamily:'var(--font-ui)',
                    outline:'none',
                  }}
                />
              </div>

              {/* Audience */}
              <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                <div style={{ fontSize:9, fontWeight:600, color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'.06em' }}>
                  Dla kogo?
                </div>
                <textarea
                  onMouseDown={e => e.stopPropagation()}
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  placeholder="Np. Kobiety 25–40, zainteresowane modą"
                  rows={3}
                  style={{
                    width:'100%', fontSize:11, padding:'6px 8px', borderRadius:7,
                    border:'1px solid var(--color-field-border)',
                    background:'var(--color-field-bg)',
                    color:'var(--color-text)',
                    fontFamily:'var(--font-ui)',
                    resize:'none', outline:'none',
                    lineHeight:1.4,
                  }}
                />
              </div>
            </div>
          </div>

        </div>{/* end columns row */}

        {/* ── Bottom: Uruchom button ── */}
        <div style={{
          height: canLaunch ? 44 : 0,
          opacity: canLaunch ? 1 : 0,
          overflow: 'hidden',
          transition: 'height 0.28s cubic-bezier(.4,0,.2,1), opacity 0.22s ease',
        }}>
          <div style={{ paddingTop: 10 }}>
            <button
              className="btn btn-primary btn-sm"
              disabled={!canLaunch}
              onMouseDown={e => { e.stopPropagation(); handleLaunch() }}
              style={{ width:'100%', justifyContent:'center' }}
            >
              Uruchom →
            </button>
          </div>
        </div>

      </div>
    </BaseNode>
  )
}
