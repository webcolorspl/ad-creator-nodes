'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import { Volume2, VolumeX, Megaphone, Layers, Wand2 } from 'lucide-react'
import { Eye, TrendingUp, Mail, Rocket, Sparkles, RefreshCw } from '@/lib/icons'
import type { LucideIcon } from '@/lib/icons'

// ── Campaign tiles ───────────────────────────────────────────
interface CampaignTile {
  id: string
  Icon: LucideIcon
  label: string
  desc: string
  color: string
}

const CAMPAIGN_TILES: CampaignTile[] = [
  { id: 'social',   Icon: Megaphone,   label: 'Social Media',   desc: 'Facebook, Instagram, TikTok', color: '#7C5CF5' },
  { id: 'display',  Icon: Eye,          label: 'Display / GDN',  desc: 'Google, banery web',          color: '#3A67F0' },
  { id: 'email',    Icon: Mail,         label: 'Email Marketing', desc: 'Newsletter, mailing',         color: '#0EA5E9' },
  { id: 'video',    Icon: Sparkles,     label: 'Wideo / YouTube', desc: 'YouTube, TikTok Ads',         color: '#EC4899' },
  { id: 'search',   Icon: TrendingUp,   label: 'Search / SEO',   desc: 'Google Ads, tekstowe',        color: '#10B981' },
  { id: 'all',      Icon: Rocket,       label: 'Kampania 360°',  desc: 'Pełna strategia multi-ch.',   color: '#F59E0B' },
]

const TOOL_TILES: CampaignTile[] = [
  { id: 'adgen',    Icon: Wand2,        label: 'AI Generator',   desc: 'Generuj kreacje z AI',        color: '#8B5CF6' },
  { id: 'nodes',    Icon: Layers,       label: 'Visual Nodes',   desc: 'Flow canvas node-based',      color: '#6366F1' },
  { id: 'refresh',  Icon: RefreshCw,    label: 'Kontynuuj',      desc: 'Wróć do poprzedniej sesji',   color: '#64748B' },
]

interface WelcomeScreenProps {
  onSelect: (campaignType: string) => void
  onSkip: () => void
}

function Tile({ tile, onClick }: { tile: CampaignTile; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  const { Icon, label, desc, color } = tile
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        gap: 10, padding: '20px 18px',
        borderRadius: 16, cursor: 'pointer', textAlign: 'left',
        border: `1.5px solid ${hover ? color + '60' : 'rgba(255,255,255,0.07)'}`,
        background: hover
          ? `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`
          : 'rgba(255,255,255,0.03)',
        boxShadow: hover ? `0 8px 32px ${color}20` : 'none',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all .18s cubic-bezier(0.34,1.4,0.64,1)',
        minHeight: 110,
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: hover ? `${color}28` : `${color}14`,
        border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .15s',
        boxShadow: hover ? `0 4px 12px ${color}30` : 'none',
      }}>
        <Icon size={20} strokeWidth={1.75} color={hover ? color : color + 'CC'} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: hover ? '#fff' : 'rgba(255,255,255,0.85)', lineHeight: 1.2, marginBottom: 3 }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', lineHeight: 1.4 }}>
          {desc}
        </div>
      </div>
    </button>
  )
}

export function WelcomeScreen({ onSelect, onSkip }: WelcomeScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    v.play().catch(() => {})
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (v) v.muted = muted
  }, [muted])

  const handleEnded = useCallback(() => {
    timerRef.current = setTimeout(() => {
      const v = videoRef.current
      if (!v) return
      v.currentTime = 0
      v.play().catch(() => {})
    }, 20_000)
  }, [])

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 5000,
      background: 'linear-gradient(135deg, #080810 0%, #0d0d1e 60%, #080810 100%)',
      display: 'flex', alignItems: 'stretch',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 50% 70% at 25% 50%, rgba(124,92,245,0.07) 0%, transparent 70%)',
      }} />

      {/* ── LEFT: Hero video ───────────────────────────── */}
      <div style={{
        width: '38%', minWidth: 340, position: 'relative',
        flexShrink: 0, background: '#06060f',
      }}>
        <video
          ref={videoRef}
          src="/avatar.mp4"
          playsInline
          onCanPlay={() => setVideoLoaded(true)}
          onEnded={handleEnded}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: videoLoaded ? 1 : 0,
            transition: 'opacity .6s',
          }}
        />

        {/* Loading spinner */}
        {!videoLoaded && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#06060f',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              border: '3px solid rgba(124,92,245,0.2)',
              borderTopColor: '#7C5CF5',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        )}

        {/* Gradient overlay — right edge fade */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to right, transparent 55%, #080810 100%)',
        }} />

        {/* Bottom gradient */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
          background: 'linear-gradient(to top, #080810 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Live badge */}
        <div style={{
          position: 'absolute', top: 20, left: 20,
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
          borderRadius: 20, padding: '6px 12px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#22c55e', boxShadow: '0 0 8px #22c55e',
          }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 700, letterSpacing: '0.06em' }}>
            AI AGENT
          </span>
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => setMuted(v => !v)}
          style={{
            position: 'absolute', top: 20, right: 20,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
            border: `1px solid ${muted ? 'rgba(255,255,255,0.1)' : 'rgba(124,92,245,0.5)'}`,
            borderRadius: 10, padding: '7px 10px', cursor: 'pointer',
            color: muted ? 'rgba(255,255,255,0.45)' : '#a78bfa',
            display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all .15s',
          }}
          title={muted ? 'Włącz dźwięk' : 'Wycisz'}
        >
          {muted
            ? <VolumeX size={15} strokeWidth={1.75} />
            : <Volume2 size={15} strokeWidth={1.75} />
          }
          <span style={{ fontSize: 11, fontWeight: 600 }}>
            {muted ? 'Dźwięk' : 'Wycisz'}
          </span>
        </button>
      </div>

      {/* ── RIGHT: Content ─────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 56px 48px 48px',
        overflowY: 'auto',
      }}>
        {/* Eyebrow */}
        <div style={{
          fontSize: 11, fontWeight: 800, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: '#7C5CF5', marginBottom: 12,
        }}>
          FlowCampaigns · AI Studio
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(28px, 2.8vw, 42px)', fontWeight: 800,
          lineHeight: 1.15, color: '#fff', marginBottom: 10,
        }}>
          Cześć! Jaki rodzaj<br />
          <span style={{
            background: 'linear-gradient(90deg, #7C5CF5 0%, #3A67F0 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>kampanii</span> tworzysz?
        </h1>
        <p style={{
          fontSize: 14, color: 'rgba(255,255,255,0.38)',
          marginBottom: 32, lineHeight: 1.6, maxWidth: 420,
        }}>
          Wybierz typ — dopasuję formaty, szablony i workflow do Twojego celu.
        </p>

        {/* Campaign tiles grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10, marginBottom: 28,
        }}>
          {CAMPAIGN_TILES.map(tile => (
            <Tile key={tile.id} tile={tile} onClick={() => onSelect(tile.id)} />
          ))}
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
        }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            lub wybierz narzędzie
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Tool tiles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10, marginBottom: 32,
        }}>
          {TOOL_TILES.map(tile => (
            <Tile key={tile.id} tile={tile} onClick={() => onSelect(tile.id)} />
          ))}
        </div>

        {/* Skip */}
        <button
          onClick={onSkip}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, color: 'rgba(255,255,255,0.22)',
            padding: 0, textAlign: 'left',
            transition: 'color .15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.22)')}
        >
          Pomiń i zacznij od zera →
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
