'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import { Wand2, Layers } from 'lucide-react'
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
    headline: 'Wreszcie budujesz kampanię,\na nie walczysz z narzędziem.',
    sub: 'Łącz kreacje, kanały i budżety na jednym ekranie — tak intuicyjnie, jak tablica z post-itami.',
    color: '#e2e8f0',
  },
  {
    num: '02',
    headline: 'Brief rano,\ngotowe banery przed kawą.',
    sub: 'Podaj wytyczne, wybierz formaty — AI przygotuje kreacje za Ciebie w kilka sekund.',
    color: '#cbd5e1',
  },
  {
    num: '03',
    headline: 'Dziesięciu klientów, jeden ekran,\nzero maili z „Gdzie jest ta kreacja?"',
    sub: 'Każda kampania w jednym miejscu — od briefu po finalne pliki.',
    color: '#94a3b8',
  },
  {
    num: '04',
    headline: 'Koniec przeskakiwania\nmiędzy dwunastoma zakładkami.',
    sub: 'Kreacja, media plan, formaty i eksport — wszystko w jednym oknie.',
    color: '#cbd5e1',
  },
  {
    num: '05',
    headline: 'Od pomysłu do gotowej paczki\nw minutach, nie w dniach.',
    sub: 'Eksportuj kreacje per kanał — gotowe do wrzucenia w Meta, Google czy TikTok.',
    color: '#e2e8f0',
  },
  {
    num: '06',
    headline: 'Jedno narzędzie zamiast pięciu.\nI jeszcze robi kreacje za Was.',
    sub: 'Planowanie, generowanie i eksport kampanii — w jednym miejscu, z AI na pokładzie.',
    color: '#94a3b8',
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
    color: '#f1f5f9',
    href: 'https://xtools.pl/ad-generator',
  },
  {
    id: 'composer',
    Icon: Layers,
    label: 'Composer',
    tag: 'Visual canvas',
    desc: 'Przeciągnij, połącz, gotowe — kampanię składasz w minuty bez jednej linii kodu.',
    color: '#cbd5e1',
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
    <div style={{ marginBottom: 56 }}>
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity .28s ease, transform .28s ease',
      }}>
        {/* Slide number + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <span style={{
            fontSize: 11, fontWeight: 900, letterSpacing: '0.14em',
            color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono, monospace)',
          }}>
            {slide.num}
          </span>
          <div style={{ width: 28, height: 1, background: 'rgba(255,255,255,0.12)' }} />
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
          }}>
            FlowCampaigns · AI Studio
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(28px, 2.8vw, 42px)', fontWeight: 800,
          lineHeight: 1.15, color: '#fff', marginBottom: 18,
          letterSpacing: '-0.02em',
        }}>
          {slide.headline.split('\n').map((line, i) =>
            i === 0
              ? <span key={i}>{line}<br /></span>
              : <span key={i} style={{ color: 'rgba(255,255,255,0.45)' }}>{line}</span>
          )}
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: 15, color: 'rgba(255,255,255,0.32)',
          lineHeight: 1.7, maxWidth: 480,
        }}>
          {slide.sub}
        </p>
      </div>

      {/* Progress bars */}
      <div style={{ display: 'flex', gap: 8, marginTop: 36 }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              flex: 1, height: 3, borderRadius: 2, border: 'none',
              background: 'rgba(255,255,255,0.08)',
              cursor: 'pointer', padding: 0, position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(255,255,255,0.6)',
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
        gap: 20, padding: '36px 32px',
        borderRadius: 24, cursor: 'pointer', textAlign: 'left',
        border: `1px solid ${hover ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}`,
        background: hover ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
        boxShadow: hover ? '0 16px 48px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all .2s cubic-bezier(0.34,1.4,0.64,1)',
        flex: 1,
      }}
    >
      {/* Icon + tag row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: hover ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .18s',
        }}>
          <Icon size={26} strokeWidth={1.5} color={hover ? '#fff' : 'rgba(255,255,255,0.4)'} />
        </div>
        <span style={{
          fontSize: 9, fontWeight: 800, letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: hover ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6, padding: '4px 10px',
          transition: 'all .15s',
        }}>
          {tag}
        </span>
      </div>

      {/* Label + desc */}
      <div>
        <div style={{
          fontSize: 26, fontWeight: 800,
          color: hover ? '#fff' : 'rgba(255,255,255,0.8)',
          lineHeight: 1.1, marginBottom: 10,
          letterSpacing: '-0.02em',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 13, color: hover ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.25)',
          lineHeight: 1.65,
          transition: 'color .15s',
        }}>
          {desc}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        marginTop: 'auto',
        fontSize: 12, fontWeight: 600,
        color: hover ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.18)',
        display: 'flex', alignItems: 'center', gap: 6,
        transition: 'all .15s',
        letterSpacing: '0.02em',
      }}>
        Otwórz {label}
        <span style={{
          transform: hover ? 'translateX(4px)' : 'translateX(0)',
          transition: 'transform .15s', display: 'inline-block',
        }}>→</span>
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
      background: '#07070b',
      display: 'flex', alignItems: 'stretch',
      overflow: 'hidden',
    }}>
      {/* ── LEFT: Hero video ───────────────────────────── */}
      <div style={{
        width: '38%', minWidth: 340, position: 'relative',
        flexShrink: 0, background: '#050508',
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
            background: '#050508',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.1)',
              borderTopColor: 'rgba(255,255,255,0.5)',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        )}

        {/* Gradient — right edge fade into dot grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to right, transparent 50%, #07070b 100%)',
        }} />

        {/* Bottom gradient */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 140,
          background: 'linear-gradient(to top, #07070b 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Speech bubble */}
        <button
          onClick={() => {
            const v = videoRef.current
            if (!v) return
            if (timerRef.current) clearTimeout(timerRef.current)
            v.currentTime = 0
            v.muted = false
            setMuted(false)
            v.play().catch(() => {})
          }}
          style={{
            position: 'absolute', bottom: '22%', left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            border: 'none', borderRadius: 20,
            padding: '16px 26px',
            cursor: 'pointer',
            boxShadow: '0 12px 40px rgba(22,163,74,0.5), 0 4px 16px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            whiteSpace: 'nowrap',
            transition: 'transform .15s, box-shadow .15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateX(-50%) translateY(-3px)'
            e.currentTarget.style.boxShadow = '0 20px 50px rgba(22,163,74,0.6), 0 4px 16px rgba(0,0,0,0.5)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateX(-50%)'
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(22,163,74,0.5), 0 4px 16px rgba(0,0,0,0.5)'
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Hej!
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.01em' }}>
            Jestem Marry 👋
          </span>
        </button>

        {/* Bubble tail */}
        <div style={{
          position: 'absolute', bottom: 'calc(22% - 10px)', left: '50%',
          transform: 'translateX(-50%)',
          width: 16, height: 10,
          background: '#15803d',
          clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
          pointerEvents: 'none',
        }} />

        {/* Live badge */}
        <div style={{
          position: 'absolute', top: 20, left: 20,
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)',
          borderRadius: 20, padding: '6px 12px',
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#4ade80', boxShadow: '0 0 8px #4ade80',
          }} />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: 700, letterSpacing: '0.08em' }}>
            AI AGENT
          </span>
        </div>

      </div>

      {/* ── RIGHT: Content — dot grid bg ───────────────── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        padding: '64px 72px 64px 64px',
        overflowY: 'auto',
        position: 'relative',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}>
        {/* Subtle vignette over grid — fades edges */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 90% 90% at 55% 50%, transparent 40%, #07070b 100%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Hero slider */}
          <HeroSlider />

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22,
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)',
            }}>
              Wybierz narzędzie
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
          </div>

          {/* Big tool tiles */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 44 }}>
            {TOOL_TILES.map(tile => (
              <BigTile key={tile.id} tile={tile} onClick={() => onSelect(tile.id)} />
            ))}
          </div>

          {/* Skip */}
          <button
            onClick={onSkip}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, color: 'rgba(255,255,255,0.18)',
              padding: 0, textAlign: 'left',
              transition: 'color .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.18)')}
          >
            Pomiń i zacznij od zera →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
