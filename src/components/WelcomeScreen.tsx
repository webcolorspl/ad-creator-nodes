'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import { Wand2, Layers, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react'
import type { LucideIcon } from '@/lib/icons'
import { SectionComingSoon, SectionFeatures, SectionTestimonials, SectionPricing, SectionFinalCTA } from './WelcomeSections'

// ── Slides ────────────────────────────────────────────────────
interface Slide { num: string; headline: string; sub: string }

const SLIDES: Slide[] = [
  {
    num: '01',
    headline: 'Wreszcie budujesz kampanię,\na nie walczysz z narzędziem.',
    sub: 'Łącz kreacje, kanały i budżety na jednym ekranie — tak intuicyjnie, jak tablica z post-itami.',
  },
  {
    num: '02',
    headline: 'Brief rano,\ngotowe banery przed kawą.',
    sub: 'Podaj wytyczne, wybierz formaty — AI przygotuje kreacje za Ciebie w kilka sekund.',
  },
  {
    num: '03',
    headline: 'Dziesięciu klientów, jeden ekran,\nzero maili z „Gdzie jest ta kreacja?"',
    sub: 'Każda kampania w jednym miejscu — od briefu po finalne pliki.',
  },
  {
    num: '04',
    headline: 'Koniec przeskakiwania\nmiędzy dwunastoma zakładkami.',
    sub: 'Kreacja, media plan, formaty i eksport — wszystko w jednym oknie.',
  },
  {
    num: '05',
    headline: 'Od pomysłu do gotowej paczki\nw minutach, nie w dniach.',
    sub: 'Eksportuj kreacje per kanał — gotowe do wrzucenia w Meta, Google czy TikTok.',
  },
  {
    num: '06',
    headline: 'Jedno narzędzie zamiast pięciu.\nI jeszcze robi kreacje za Was.',
    sub: 'Planowanie, generowanie i eksport kampanii — w jednym miejscu, z AI na pokładzie.',
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
  colorDark: string
  colorLight: string
  href?: string
}

const TOOL_TILES: ToolTile[] = [
  {
    id: 'creator',
    Icon: Wand2,
    label: 'Creator',
    tag: 'AI-powered',
    desc: 'Generuj banery, teksty i kreacje reklamowe w sekundach — wystarczy brief i wybór formatu.',
    colorDark: '#f1f5f9',
    colorLight: '#16a34a',
    href: '/creator',
  },
  {
    id: 'composer',
    Icon: Layers,
    label: 'Composer',
    tag: 'Visual canvas',
    desc: 'Przeciągnij, połącz, gotowe — kampanię składasz w minuty bez jednej linii kodu.',
    colorDark: '#cbd5e1',
    colorLight: '#7C5CF5',
    href: '/composer',
  },
]

// ── Theme tokens ──────────────────────────────────────────────
function theme(dark: boolean) {
  return dark ? {
    bg:            '#07070b',
    bgLeft:        '#050508',
    fadeColor:     '#07070b',
    dotColor:      'rgba(255,255,255,0.05)',
    text:          '#ffffff',
    textSub:       'rgba(255,255,255,0.82)',
    textMuted:     'rgba(255,255,255,0.55)',
    textFaint:     'rgba(255,255,255,0.28)',
    tileBg:        'rgba(255,255,255,0.03)',
    tileBgHover:   'rgba(255,255,255,0.07)',
    tileBorder:    'rgba(255,255,255,0.08)',
    tileBorderH:   'rgba(255,255,255,0.22)',
    tileTag:       'rgba(255,255,255,0.2)',
    tileTagH:      'rgba(255,255,255,0.5)',
    progressTrack: 'rgba(255,255,255,0.1)',
    progressFill:  'rgba(255,255,255,0.75)',
    arrowBg:       'rgba(255,255,255,0.08)',
    arrowBgH:      'rgba(255,255,255,0.16)',
    arrowColor:    'rgba(255,255,255,0.6)',
    divider:       'rgba(255,255,255,0.07)',
    badgeBg:       'rgba(0,0,0,0.55)',
    bubbleShadow:  'rgba(22,163,74,0.5)',
    toggleBg:      'rgba(255,255,255,0.08)',
    toggleColor:   'rgba(255,255,255,0.6)',
  } : {
    bg:            '#f4f4f7',
    bgLeft:        '#e8e8ed',
    fadeColor:     '#f4f4f7',
    dotColor:      'rgba(0,0,0,0.06)',
    text:          '#0f0f12',
    textSub:       '#3a3a4a',
    textMuted:     '#6b6b80',
    textFaint:     '#aaaabc',
    tileBg:        'rgba(0,0,0,0.03)',
    tileBgHover:   'rgba(0,0,0,0.06)',
    tileBorder:    'rgba(0,0,0,0.1)',
    tileBorderH:   'rgba(0,0,0,0.25)',
    tileTag:       '#888',
    tileTagH:      '#444',
    progressTrack: 'rgba(0,0,0,0.12)',
    progressFill:  'rgba(0,0,0,0.7)',
    arrowBg:       'rgba(0,0,0,0.07)',
    arrowBgH:      'rgba(0,0,0,0.14)',
    arrowColor:    '#555',
    divider:       'rgba(0,0,0,0.1)',
    badgeBg:       'rgba(255,255,255,0.7)',
    bubbleShadow:  'rgba(22,163,74,0.4)',
    toggleBg:      'rgba(0,0,0,0.07)',
    toggleColor:   '#555',
  }
}

interface WelcomeScreenProps {
  onSelect: (campaignType: string) => void
  onSkip: () => void
}

// ── HeroSlider ─────────────────────────────────────────────────
function HeroSlider({ dark }: { dark: boolean }) {
  const t = theme(dark)
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
      const pct = Math.min((now - startTs.current) / SLIDE_DURATION, 1)
      setProgress(pct)
      if (pct < 1) { rafRef.current = requestAnimationFrame(tick) }
      else { goTo((active + 1) % SLIDES.length) }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [active, goTo])

  const slide = SLIDES[active]
  const prev  = () => goTo((active - 1 + SLIDES.length) % SLIDES.length)
  const next  = () => goTo((active + 1) % SLIDES.length)

  const arrowStyle = (hover: boolean): React.CSSProperties => ({
    width: 34, height: 34, borderRadius: '50%', border: 'none',
    background: hover ? t.arrowBgH : t.arrowBg,
    color: t.arrowColor, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'background .15s',
  })

  const [hoverPrev, setHoverPrev] = useState(false)
  const [hoverNext, setHoverNext] = useState(false)

  return (
    <div style={{ marginBottom: 56 }}>
      {/* Slide content */}
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity .28s ease, transform .28s ease',
        minHeight: 160,
      }}>
        {/* Number + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <span style={{
            fontSize: 20, fontWeight: 900, letterSpacing: '0.14em',
            color: t.text, fontFamily: 'var(--font-mono, monospace)',
          }}>
            {slide.num}
          </span>
          <div style={{ width: 28, height: 1, background: t.divider }} />
          <span style={{
            fontSize: 14, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: t.textSub,
          }}>
            FlowCampaigns · AI Studio
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(42px, 4vw, 68px)', fontWeight: 800,
          lineHeight: 1.1, color: t.text, marginBottom: 22,
          letterSpacing: '-0.02em',
        }}>
          {slide.headline.split('\n').map((line, i) =>
            i === 0
              ? <span key={i}>{line}<br /></span>
              : <span key={i} style={{ color: '#16a34a' }}>{line}</span>
          )}
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: 20, color: t.textSub,
          lineHeight: 1.65, maxWidth: 560,
        }}>
          {slide.sub}
        </p>
      </div>

      {/* Progress bars + arrows */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 32 }}>
        <button
          style={arrowStyle(hoverPrev)}
          onMouseEnter={() => setHoverPrev(true)}
          onMouseLeave={() => setHoverPrev(false)}
          onClick={prev}
        >
          <ChevronLeft size={16} strokeWidth={2} color={t.arrowColor} />
        </button>

        <div style={{ display: 'flex', gap: 6, flex: 1 }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                flex: 1, height: 3, borderRadius: 2, border: 'none',
                background: t.progressTrack,
                cursor: 'pointer', padding: 0, position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute', inset: 0,
                background: t.progressFill,
                transformOrigin: 'left',
                transform: i === active ? `scaleX(${progress})` : i < active ? 'scaleX(1)' : 'scaleX(0)',
                transition: i === active ? 'none' : 'transform .28s ease',
              }} />
            </button>
          ))}
        </div>

        <button
          style={arrowStyle(hoverNext)}
          onMouseEnter={() => setHoverNext(true)}
          onMouseLeave={() => setHoverNext(false)}
          onClick={next}
        >
          <ChevronRight size={16} strokeWidth={2} color={t.arrowColor} />
        </button>
      </div>
    </div>
  )
}

// ── BigTile ────────────────────────────────────────────────────
function BigTile({ tile, dark, onClick }: { tile: ToolTile; dark: boolean; onClick: () => void }) {
  const t     = theme(dark)
  const [hover, setHover] = useState(false)
  const { Icon, label, tag, desc, colorDark, colorLight, href } = tile
  const accent = dark ? colorDark : colorLight

  function handleClick() {
    if (!href) { onClick(); return }
    if (href.startsWith('/')) window.location.href = href
    else window.open(href, '_blank', 'noopener,noreferrer')
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
        border: `1px solid ${hover ? t.tileBorderH : t.tileBorder}`,
        background: hover ? t.tileBgHover : t.tileBg,
        boxShadow: hover
          ? dark ? '0 16px 48px rgba(0,0,0,0.5)' : '0 12px 36px rgba(0,0,0,0.12)'
          : dark ? '0 2px 8px rgba(0,0,0,0.3)'   : '0 1px 4px rgba(0,0,0,0.06)',
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all .2s cubic-bezier(0.34,1.4,0.64,1)',
        flex: 1,
      }}
    >
      {/* Icon */}
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: hover ? (dark ? 'rgba(255,255,255,0.12)' : `${accent}18`) : (dark ? 'rgba(255,255,255,0.06)' : `${accent}10`),
        border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : `${accent}30`}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .18s',
        boxShadow: hover && !dark ? `0 4px 16px ${accent}25` : 'none',
      }}>
        <Icon size={26} strokeWidth={1.5}
          color={dark ? (hover ? '#fff' : 'rgba(255,255,255,0.45)') : (hover ? accent : `${accent}bb`)}
        />
      </div>

      {/* Label + desc */}
      <div>
        <div style={{
          fontSize: 36, fontWeight: 800,
          color: hover ? (dark ? '#fff' : accent) : t.text,
          lineHeight: 1.1, marginBottom: 10,
          letterSpacing: '-0.02em',
          transition: 'color .15s',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 16, color: t.textSub,
          lineHeight: 1.65, transition: 'color .15s',
        }}>
          {desc}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        marginTop: 'auto',
        fontSize: 13, fontWeight: 600,
        color: hover ? (dark ? 'rgba(255,255,255,0.7)' : accent) : t.textFaint,
        display: 'flex', alignItems: 'center', gap: 6,
        transition: 'all .15s', letterSpacing: '0.02em',
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
  const videoRef     = useRef<HTMLVideoElement>(null)
  const talkRef      = useRef<HTMLVideoElement>(null)
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rightRef     = useRef<HTMLDivElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [talkLoaded,  setTalkLoaded]  = useState(false)
  const [talking,     setTalking]     = useState(false)
  const [muted, setMuted]   = useState(true)
  const [dark, setDark]     = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const el = rightRef.current
    if (!el) return
    const onScroll = () => setScrollY(el.scrollTop)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const t = theme(dark)

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

  // talk video ended → wróć do loop
  const handleTalkEnded = useCallback(() => {
    const t = talkRef.current
    if (t) { t.currentTime = 0; t.pause() }
    setTalking(false)
    const v = videoRef.current
    if (v) { v.currentTime = 0; v.play().catch(() => {}) }
  }, [])

  // klik w przycisk → przełącz na talk video z dźwiękiem
  function playTalk() {
    const t = talkRef.current
    if (!t) return
    const v = videoRef.current
    if (v) v.pause()
    setTalking(true)
    t.currentTime = 0
    t.muted = false
    t.play().catch(() => {})
  }

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
      background: t.bg,
      display: 'flex', alignItems: 'flex-start',
      overflow: 'hidden',
      transition: 'background .3s',
    }}>

      {/* ── LEFT: Hero video (sticky) ───────────────────── */}
      <div style={{
        width: '38%', minWidth: 340, position: 'sticky', top: 0,
        height: '100vh', flexShrink: 0, background: t.bgLeft,
        transition: 'background .3s',
      }}>
        {/* Loop video (idle) */}
        <video
          ref={videoRef}
          src="/avatar.mp4"
          playsInline loop muted
          onCanPlay={() => setVideoLoaded(true)}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: !talking && videoLoaded ? 1 : 0,
            transition: 'opacity .4s',
          }}
        />

        {/* Talk video (on click) */}
        <video
          ref={talkRef}
          src="/avatar-talk.mp4"
          playsInline
          onCanPlay={() => setTalkLoaded(true)}
          onEnded={handleTalkEnded}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: talking && talkLoaded ? 1 : 0,
            transition: 'opacity .4s',
          }}
        />

        {!videoLoaded && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: t.bgLeft,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              border: `2px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderTopColor: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        )}

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 140,
          background: `linear-gradient(to top, ${t.fadeColor} 0%, transparent 100%)`,
          pointerEvents: 'none', transition: 'background .3s',
        }} />

        {/* Chat window + bubble */}
        <div style={{
          position: 'absolute', bottom: '14%', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
          width: 240,
        }}>
          {/* Chat window */}
          <div style={{
            width: '100%',
            background: 'rgba(12,12,18,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            {/* Chat header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.04)',
            }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #16a34a, #0d9488)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13,
                }}>M</div>
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#4ade80', border: '1.5px solid #0c0c12',
                  boxShadow: '0 0 6px #4ade80',
                }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>Mary</div>
                <div style={{ fontSize: 9, color: '#4ade80', fontWeight: 600 }}>● online</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ padding: '12px 12px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{
                alignSelf: 'flex-start',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '12px 12px 12px 3px',
                padding: '7px 11px',
                fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.45,
                maxWidth: '90%',
              }}>
                Cześć! 👋 Jak mogę Ci dziś pomóc?
              </div>
              <div style={{
                alignSelf: 'flex-end',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                borderRadius: '12px 12px 3px 12px',
                padding: '7px 11px',
                fontSize: 12, color: '#fff', lineHeight: 1.45,
              }}>
                Chcę stworzyć kampanię 🚀
              </div>
              {/* Typing indicator */}
              <div style={{
                alignSelf: 'flex-start',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '12px 12px 12px 3px',
                padding: '8px 14px',
                display: 'flex', gap: 4, alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.45)',
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>

          {/* Connector line */}
          <div style={{ width: 2, height: 10, background: 'rgba(255,255,255,0.1)' }} />

          {/* Green CTA bubble */}
          <button
            onClick={playTalk}
            style={{
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              border: 'none', borderRadius: 50,
              padding: '13px 28px',
              cursor: 'pointer',
              boxShadow: `0 8px 28px ${t.bubbleShadow}, 0 2px 8px rgba(0,0,0,0.3)`,
              whiteSpace: 'nowrap',
              transition: 'transform .15s, box-shadow .15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 16px 40px rgba(22,163,74,0.6), 0 2px 8px rgba(0,0,0,0.3)`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = `0 8px 28px ${t.bubbleShadow}, 0 2px 8px rgba(0,0,0,0.3)`
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
              W czym możesz mi pomóc?
            </span>
          </button>
        </div>

        {/* Logo */}
        <div style={{
          position: 'absolute', top: 20, left: 20,
        }}>
          <span style={{
            fontSize: 32, fontWeight: 900, color: '#fff',
            letterSpacing: '-0.03em', lineHeight: 1,
            textShadow: '0 2px 16px rgba(0,0,0,0.4)',
            fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          }}>
            XTOOLS<span style={{ color: '#4ade80' }}>.PL</span>
          </span>
        </div>
      </div>

      {/* ── RIGHT: Scrollable content ──────────────────── */}
      <div
        ref={rightRef}
        style={{
          flex: 1, overflowY: 'auto', height: '100vh',
          position: 'relative',
          backgroundImage: `radial-gradient(circle, ${t.dotColor} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          backgroundPosition: `0 ${scrollY * 0.3}px`,
          transition: 'background-color .3s',
        }}
      >
        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: dark
            ? 'radial-gradient(ellipse 90% 90% at 55% 50%, transparent 40%, #07070b 100%)'
            : 'radial-gradient(ellipse 90% 90% at 55% 50%, transparent 40%, #f4f4f7 100%)',
          transition: 'background .3s',
        }} />

        {/* Top-right controls */}
        <div style={{
          position: 'absolute', top: 24, right: 24, zIndex: 2,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          {/* Zaloguj się */}
          <a
            href="/logowanie"
            style={{
              height: 36, borderRadius: 18, padding: '0 16px',
              border: `1.5px solid ${dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
              background: 'transparent',
              display: 'flex', alignItems: 'center',
              fontSize: 12, fontWeight: 700,
              color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
              textDecoration: 'none', letterSpacing: '0.02em',
              transition: 'all .15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = dark ? '#fff' : '#0f0f12'
              e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'
              e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
            }}
          >
            Zaloguj się
          </a>

          {/* Zarejestruj się */}
          <a
            href="/rejestracja"
            style={{
              height: 36, borderRadius: 18, padding: '0 18px',
              border: 'none',
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              display: 'flex', alignItems: 'center',
              fontSize: 12, fontWeight: 800,
              color: '#fff',
              textDecoration: 'none', letterSpacing: '0.02em',
              boxShadow: '0 4px 14px rgba(22,163,74,0.4)',
              transition: 'all .15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(22,163,74,0.5)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(22,163,74,0.4)'
            }}
          >
            Zarejestruj się →
          </a>

          {/* Dark/light toggle */}
          <button
            onClick={() => setDark(d => !d)}
            style={{
              height: 36, borderRadius: 18, border: `1.5px solid ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
              background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px',
              transition: 'all .2s',
            }}
            title={dark ? 'Tryb jasny' : 'Tryb ciemny'}
          >
            {dark
              ? <Sun  size={15} strokeWidth={2} color="#facc15" />
              : <Moon size={15} strokeWidth={2} color="#6366f1" />
            }
            <span style={{ fontSize: 12, fontWeight: 700, color: dark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)', letterSpacing: '0.02em' }}>
              {dark ? 'Jasny' : 'Ciemny'}
            </span>
          </button>
        </div>

        <div style={{ position: 'relative', zIndex: 1, padding: '64px 72px 0 64px' }}>
          <HeroSlider dark={dark} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
            <div style={{ flex: 1, height: 1, background: t.divider }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.textMuted }}>
              Wybierz narzędzie
            </span>
            <div style={{ flex: 1, height: 1, background: t.divider }} />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            {TOOL_TILES.map(tile => (
              <BigTile key={tile.id} tile={tile} dark={dark} onClick={() => onSelect(tile.id)} />
            ))}
          </div>

          <SectionComingSoon dark={dark} />
          <SectionFeatures dark={dark} />
          <SectionTestimonials dark={dark} />
          <SectionPricing dark={dark} scrollY={scrollY} padL={64} padR={72} />
          <SectionFinalCTA dark={dark} />
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: .4; }
          30%            { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
