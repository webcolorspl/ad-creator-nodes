'use client'
import { useState } from 'react'
import { useReactFlow } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { NodeProps } from '@xyflow/react'

interface Channel {
  id: string
  label: string
  icon: string
  desc: string
  formats: Format[]
}

interface Format {
  id: string
  label: string
  size: string
}

const CHANNELS: Channel[] = [
  {
    id: 'google-display',
    label: 'Google Display',
    icon: '🟦',
    desc: 'Sieć reklamowa Google',
    formats: [
      { id: 'gd-leaderboard',  label: 'Leaderboard',   size: '728×90'   },
      { id: 'gd-rectangle',    label: 'Rectangle',     size: '300×250'  },
      { id: 'gd-skyscraper',   label: 'Skyscraper',    size: '160×600'  },
      { id: 'gd-mobile',       label: 'Mobile banner', size: '320×50'   },
      { id: 'gd-billboard',    label: 'Billboard',     size: '970×250'  },
    ],
  },
  {
    id: 'meta',
    label: 'Meta (FB + IG)',
    icon: '🟪',
    desc: 'Facebook & Instagram',
    formats: [
      { id: 'meta-feed',       label: 'Feed square',   size: '1080×1080' },
      { id: 'meta-landscape',  label: 'Feed landscape',size: '1200×628'  },
      { id: 'meta-story',      label: 'Story / Reel',  size: '1080×1920' },
      { id: 'meta-carousel',   label: 'Carousel card', size: '1080×1080' },
    ],
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: '🟦',
    desc: 'B2B, profesjonaliści',
    formats: [
      { id: 'li-landscape',    label: 'Sponsored content', size: '1200×628'  },
      { id: 'li-square',       label: 'Square',            size: '1200×1200' },
      { id: 'li-story',        label: 'Story',             size: '1080×1920' },
    ],
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: '⬛',
    desc: 'Video-first, Gen Z/Millennial',
    formats: [
      { id: 'tt-topview',      label: 'TopView / In-Feed', size: '1080×1920' },
      { id: 'tt-square',       label: 'Square video',      size: '1080×1080' },
    ],
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: '🟥',
    desc: 'Pre-roll, bumper, display',
    formats: [
      { id: 'yt-companion',    label: 'Companion banner',  size: '300×60'    },
      { id: 'yt-display',      label: 'Display overlay',   size: '300×250'   },
    ],
  },
  {
    id: 'programmatic',
    label: 'Programmatic',
    icon: '◻',
    desc: 'RTB / DSP / DV360',
    formats: [
      { id: 'pg-leaderboard',  label: 'Leaderboard',       size: '728×90'    },
      { id: 'pg-rectangle',    label: 'Rectangle',         size: '300×250'   },
      { id: 'pg-halfpage',     label: 'Half page',         size: '300×600'   },
      { id: 'pg-billboard',    label: 'Billboard',         size: '970×250'   },
    ],
  },
]

const COL_W = 170

export function ChannelNode({ id }: NodeProps) {
  const { fitView } = useReactFlow()

  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [selectedFormats, setSelectedFormats]  = useState<string[]>([])
  const [confirmed, setConfirmed]              = useState(false)

  const channel = CHANNELS.find(c => c.id === selectedChannel)

  function recenter() {
    setTimeout(() => fitView({ nodes: [{ id }], duration: 350, padding: 0.35 }), 320)
  }

  function handleSelectChannel(cid: string) {
    if (selectedChannel !== cid) {
      setSelectedChannel(cid)
      setSelectedFormats([])
      if (!selectedChannel) recenter()
    }
  }

  function toggleFormat(fid: string) {
    setSelectedFormats(p => p.includes(fid) ? p.filter(x => x !== fid) : [...p, fid])
  }

  function selectAll() {
    if (!channel) return
    setSelectedFormats(channel.formats.map(f => f.id))
  }

  const canConfirm = !!selectedChannel && selectedFormats.length > 0

  // ── Summary view ─────────────────────────────────────────────────
  if (confirmed && channel) {
    const formats = channel.formats.filter(f => selectedFormats.includes(f.id))
    return (
      <BaseNode id={id} nodeType="channelNode">
        <div style={{ display:'flex', flexDirection:'column', gap:8, minWidth:200 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:18 }}>{channel.icon}</span>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--color-text)' }}>{channel.label}</div>
              <div style={{ fontSize:10, color:'var(--color-text-muted)' }}>{formats.length} formatów</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
            {formats.map(f => (
              <span key={f.id} style={{
                fontSize:9, fontWeight:600, padding:'2px 6px', borderRadius:4,
                background:'var(--color-input)', color:'#fff', opacity:0.9,
              }}>
                {f.size}
              </span>
            ))}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ width:'100%', justifyContent:'center', fontSize:10 }}
            onMouseDown={e => { e.stopPropagation(); setConfirmed(false) }}
          >
            ✎ Zmień kanał
          </button>
        </div>
      </BaseNode>
    )
  }

  // ── Config view ───────────────────────────────────────────────────
  const colHeader: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, letterSpacing: '.08em',
    textTransform: 'uppercase', color: 'var(--color-text-muted)',
    paddingBottom: 6, marginBottom: 4,
    borderBottom: '1px solid var(--color-field-border)',
  }

  return (
    <BaseNode id={id} nodeType="channelNode">
      <div style={{ display:'flex', gap:0, alignItems:'flex-start', overflow:'hidden' }}>

        {/* ── Col 1: Kanały ── */}
        <div style={{ width: COL_W, flexShrink:0, display:'flex', flexDirection:'column', gap:2 }}>
          <div style={colHeader}>Kanał</div>
          {CHANNELS.map(c => (
            <div
              key={c.id}
              onMouseDown={e => { e.stopPropagation(); handleSelectChannel(c.id) }}
              style={{
                display:'flex', alignItems:'center', gap:7,
                padding:'5px 7px', borderRadius:5, cursor:'pointer',
                background: selectedChannel === c.id ? 'rgba(58,103,240,0.1)' : 'transparent',
                border: `1px solid ${selectedChannel === c.id ? 'var(--color-input)' : 'transparent'}`,
                transition:'all .15s',
              }}
            >
              <span style={{ fontSize:12, width:16, textAlign:'center', flexShrink:0 }}>{c.icon}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:11, fontWeight: selectedChannel === c.id ? 600 : 400, color:'var(--color-text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {c.label}
                </div>
                <div style={{ fontSize:9, color:'var(--color-text-muted)' }}>{c.desc}</div>
              </div>
              {selectedChannel === c.id && <span style={{ color:'var(--color-input)', fontSize:10 }}>›</span>}
            </div>
          ))}
        </div>

        {/* ── Col 2: Formaty — wsuwa się po wyborze kanału ── */}
        <div style={{
          width: selectedChannel ? COL_W : 0,
          opacity: selectedChannel ? 1 : 0,
          overflow: 'hidden',
          transition: 'width 0.28s cubic-bezier(.4,0,.2,1), opacity 0.22s ease',
          flexShrink: 0,
        }}>
          <div style={{ width: COL_W, paddingLeft:10, display:'flex', flexDirection:'column', gap:2 }}>
            <div style={{ ...colHeader, borderLeft:'1px solid var(--color-field-border)', paddingLeft:10, marginLeft:-10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span>
                Formaty {selectedFormats.length > 0 && <span style={{ color:'var(--color-gen)' }}>✓{selectedFormats.length}</span>}
              </span>
              {channel && (
                <span
                  onMouseDown={e => { e.stopPropagation(); selectAll() }}
                  style={{ fontSize:9, color:'var(--color-input)', cursor:'pointer', fontWeight:600 }}
                >
                  wszystkie
                </span>
              )}
            </div>

            {channel?.formats.map(f => (
              <label
                key={f.id}
                onMouseDown={e => e.stopPropagation()}
                style={{
                  display:'flex', alignItems:'center', gap:6,
                  padding:'5px 7px', borderRadius:5, cursor:'pointer',
                  background: selectedFormats.includes(f.id) ? 'rgba(58,103,240,0.1)' : 'transparent',
                  border: `1px solid ${selectedFormats.includes(f.id) ? 'var(--color-input)' : 'transparent'}`,
                  transition:'all .15s',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedFormats.includes(f.id)}
                  onChange={() => toggleFormat(f.id)}
                  style={{ accentColor:'var(--color-input)', width:12, height:12, flexShrink:0 }}
                />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, color:'var(--color-text)', fontWeight: selectedFormats.includes(f.id) ? 600 : 400 }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize:9, color:'var(--color-text-muted)', fontFamily:'var(--font-mono, monospace)' }}>
                    {f.size}
                  </div>
                </div>
              </label>
            ))}

            <button
              className="btn btn-primary btn-sm"
              disabled={!canConfirm}
              onMouseDown={e => { e.stopPropagation(); setConfirmed(true) }}
              style={{ width:'100%', justifyContent:'center', marginTop:8 }}
            >
              Zatwierdź kanał →
            </button>
          </div>
        </div>

      </div>
    </BaseNode>
  )
}
