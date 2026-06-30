'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import { Volume2, VolumeX, Wand2, Layers } from 'lucide-react'
import type { LucideIcon } from '@/lib/icons'

// ── Hero slides ───────────────────────────────────────────────
interface Slide {
  num: string
  headline: string
  sub: string
  color: string
}

const SLIDES: Slide[] = [
  {
    num: '01',
    headline: 'Buduj kampanie\ntak, jak je myślisz.',
    sub: 'Wizualny canvas, w którym łączysz kreacje, kanały i budżety — node po node.',
    color: '#7C5CF5',
  },
  {
    num: '02',
    headline: 'Kreacje na wczoraj?\nAI wygeneruje je teraz.',
    sub: 'Podaj brief, wybierz formaty — otrzymasz gotowe banery w sekundach.',
    color: '#3A67F0',
  },
  {
    num: '03',
    headline: 'Jeden flow.\nDziesięć klientów. Zero chaosu.',
    sub: 'Zarządzaj wieloma kampaniami na jednym boardzie — od briefu po eksport.',
    color: '#10B981',
  },
]

const SLIDE_DURATION = 5000

// ── Tool tiles ────────────────────────────────────────────────
interface ToolTile {
  id: string
  Icon: LucideIcon
  label: string
  tag: string
  desc: string
  color: string
  href?: string
}

const TOOL_TILES: ToolTile[] = [
  {
    id: 'creator',
    Icon: Wand2,
    label: 'Creator',
    tag: 'AI-powered',
    desc: 'Generuj banery, teksty i kreacje reklamowe w sekundach — wystarczy brief i wybór formatu.',
    color: '#8B5CF6',
    href: 'https://xtools.pl',
  },
  {
    id: 'composer',
    Icon: Layers,
    label: 'Composer',
    tag: 'Visual canvas',
    desc: 'Buduj kampanie wizualnie — połącz formaty, kanały i budżety na flow canvas node po node.',
    color: '#6366F1',
  },
]

interface WelcomeScreenProps {
  onSelect: (campaignType: string) => void
  onSkip: () => void
}

// ── HeroSlider ─────────────────────────────────────────────────
function HeroSlider() {
  const [active, setActive]     = useState(0)
  const [visible, setVisible]   = useState(true)
  const [progress, setProgress] = useState(0)
  const rafRef  = useRef<number | null>(null)
  const startTs = useRef<number>(0)

  const goTo = useCallback((idx: number) => {
    setVisible(false)
    setTimeout(() => {
      setActive(idx)
      setVisible(true)
      setProgress(0)
      startTs.current = performance.now()
    }, 280)
  }, [])

  useEffect(() => {
    startTs.current = performance.now()

    function tick(now: number) {
      const elapsed = now - startTs.current
      const pct = Math.min(elapsed / SLIDE_DURATION, 1)
      setProgress(pct)
      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        goTo((active + 1) % SLIDES.length)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [active, goTo])

  const slide = SLIDES[active]

  return (
    <div style={{ marginBottom: 44 }}>
      {/* Slide content */}
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity .28s ease, transform .28s ease',
      }}>
        {/* Slide number + tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{
            fontSize: 9, fontWeight: 900, letterSpacing: '0.12em',
            color: slide.color, fontFamily: 'var(--font-mono, monospace)',
          }}>
            {slide.num}
          </span>
          <div style={{ width: 32, height: 1, background: slide.color + '60' }} />
          <span style={{
            fontSize: 8, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
          }}>
            FlowCampaigns · AI Studio
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(14px, 1.4vw, 20px)', fontWeight: 800,
          lineHeight: 1.18, color: '#fff', marginBottom: 11,
          whiteSpace: 'pre-line',
        }}>
          {slide.headline.split('\n').map((line, i) =>
            i === 0
              ? <span key={i}>{line}<br /></span>
              : <span key={i} style={{
                  background: `linear-gradient(90deg, ${slide.color} 0%, ${slide.color}99 100%)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>{line}</span>
          )}
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: 12, color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.65, maxWidth: 440,
        }}>
          {slide.sub}
        </p>
      </div>

      {/* Progress bars */}
      <div style={{ display: 'flex', gap: 6, marginTop: 28 }}>
        {SLIDES.map((s, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              flex: 1, height: 8, borderRadius: 4, border: 'none',
              background: 'rgba(255,255,255,0.1)',
              cursor: 'pointer', padding: 0, position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              background: s.color,
              transformOrigin: 'left',
              transform: i === active
                ? `scaleX(${progress})`
                : i < active ? 'scaleX(1)' : 'scaleX(0)',
              transition: i === active ? 'none' : 'transform .28s ease',
            }} />
          </button>
        ))}
      </div>
    </div>
  )
}

// ── BigTile ────────────────────────────────────────────────────
function BigTile({ tile, onClick }: { tile: ToolTile; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  const { Icon, label, tag, desc, color, href } = tile

  function handleClick() {
    if (href) window.open(href, '_blank', 'noopener,noreferrer')
    else onClick()
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        gap: 14, padding: '28px 24px',
        borderRadius: 20, cursor: 'pointer', textAlign: 'left',
        border: `1.5px solid ${hover ? color + '55' : 'rgba(255,255,255,0.07)'}`,
        background: hover
          ? `linear-gradient(140deg, ${color}1A 0%, ${color}08 100%)`
          : 'rgba(255,255,255,0.03)',
        boxShadow: hover ? `0 12px 40px ${color}22` : '0 2px 8px rgba(0,0,0,0.2)',
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all .2s cubic-bezier(0.34,1.4,0.64,1)',
        flex: 1,
      }}
    >
      {/* Icon + tag row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{
          width: 52, height: 52, borderRadius: 15,
          background: hover ? `${color}30` : `${color}18`,
          border: `1px solid ${color}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .18s',
          boxShadow: hover ? `0 6px 18px ${color}35` : 'none',
        }}>
          <Icon size={24} strokeWidth={1.6} color={hover ? color : color + 'CC'} />
        </div>
        <span style={{
          fontSize: 7, fontWeight: 800, letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: hover ? color : 'rgba(255,255,255,0.2)',
          border: `1px solid ${hover ? color + '40' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 6, padding: '3px 8px',
          transition: 'all .15s',
        }}>
          {tag}
        </span>
      </div>

      {/* Label */}
      <div>
        <div style={{
          fontSize: 18, fontWeight: 800,
          color: hover ? '#fff' : 'rgba(255,255,255,0.9)',
          lineHeight: 1.15, marginBottom: 8,
          letterSpacing: '-0.01em',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 10, color: hover ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.32)',
          lineHeight: 1.6,
          transition: 'color .15s',
        }}>
          {desc}
        </div>
      </div>

      {/* CTA arrow */}
      <div style={{
        marginTop: 'auto',
        fontSize: 10, fontWeight: 700,
        color: hover ? color : 'rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', gap: 6,
        transition: 'all .15s',
      }}>
        Otwórz {label}
        <span style={{ transform: hover ? 'translateX(3px)' : 'translateX(0)', transition: 'transform .15s', display: 'inline-block' }}>→</span>
      </div>
    </button>
  )
}

// ── WelcomeScreen ──────────────────────────────────────────────
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

        {/* Gradient overlay — right edge */}
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
        padding: '52px 60px 52px 52px',
        overflowY: 'auto',
      }}>
        {/* Hero slider */}
        <HeroSlider />

        {/* Section label */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18,
        }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          <span style={{
            fontSize: 8, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)',
          }}>
            Wybierz narzędzie
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Big tool tiles */}
        <div style={{
          display: 'flex', gap: 14, marginBottom: 36,
        }}>
          {TOOL_TILES.map(tile => (
            <BigTile key={tile.id} tile={tile} onClick={() => onSelect(tile.id)} />
          ))}
        </div>

        {/* Skip */}
        <button
          onClick={onSkip}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 10, color: 'rgba(255,255,255,0.2)',
            padding: 0, textAlign: 'left',
            transition: 'color .15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
        >
          Pomiń i zacznij od zera →
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
