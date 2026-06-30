'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

const CAMPAIGN_TYPES = [
  { id: 'social',   emoji: '📱', label: 'Social Media',    desc: 'Facebook, Instagram, TikTok' },
  { id: 'display',  emoji: '🖥️', label: 'Display / GDN',   desc: 'Google, banery web' },
  { id: 'email',    emoji: '📧', label: 'Email Marketing',  desc: 'Newsletter, mailing' },
  { id: 'video',    emoji: '🎬', label: 'Wideo / YouTube',  desc: 'YouTube, TikTok Ads' },
  { id: 'search',   emoji: '🔍', label: 'Search / SEO',     desc: 'Google Ads, tekstowe' },
  { id: 'all',      emoji: '⚡', label: 'Wszystko',          desc: 'Pełna kampania 360°' },
]

interface WelcomeScreenProps {
  onSelect: (campaignType: string) => void
  onSkip: () => void
}

export function WelcomeScreen({ onSelect, onSkip }: WelcomeScreenProps) {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [hovered,     setHovered]     = useState<string | null>(null)
  const [muted,       setMuted]       = useState(true)

  const playVideo = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
    v.muted = muted
    v.play().catch(() => {})
  }, [muted])

  // Initial play
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    v.play().catch(() => {})
  }, [])

  // When user toggles sound — apply immediately
  useEffect(() => {
    const v = videoRef.current
    if (v) v.muted = muted
  }, [muted])

  // On video end → wait 20s → replay
  const handleEnded = useCallback(() => {
    timerRef.current = setTimeout(() => playVideo(), 20_000)
  }, [playVideo])

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 5000,
      background: 'linear-gradient(135deg, #0a0a14 0%, #0f0f1e 50%, #0a0a14 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>

      {/* Background glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 30% 50%, rgba(124,92,245,0.08) 0%, transparent 70%)',
      }} />

      {/* Main layout */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 64,
        maxWidth: 1200,
        width: '100%',
        padding: '40px 48px',
      }}>

        {/* LEFT — video avatar */}
        <div style={{ flexShrink: 0, position: 'relative' }}>
          {/* Glow ring */}
          <div style={{
            position: 'absolute', inset: -3,
            borderRadius: 24,
            background: 'linear-gradient(135deg, #7C5CF5, #3A67F0)',
            opacity: videoLoaded ? 0.6 : 0,
            transition: 'opacity .6s',
            filter: 'blur(8px)',
          }} />
          <div style={{
            position: 'relative',
            width: 340,
            borderRadius: 22,
            overflow: 'hidden',
            border: '1.5px solid rgba(124,92,245,0.3)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            background: '#0d0d1a',
          }}>
            <video
              ref={videoRef}
              src="/avatar.mp4"
              playsInline
              onCanPlay={() => setVideoLoaded(true)}
              onEnded={handleEnded}
              style={{
                width: '100%',
                display: 'block',
                opacity: videoLoaded ? 1 : 0,
                transition: 'opacity .5s',
              }}
            />
            {!videoLoaded && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  border: '3px solid rgba(124,92,245,0.3)',
                  borderTopColor: '#7C5CF5',
                  animation: 'spin 1s linear infinite',
                }} />
              </div>
            )}
            {/* Live indicator */}
            <div style={{
              position: 'absolute', top: 12, left: 12,
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
              borderRadius: 20, padding: '4px 10px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 6px #22c55e',
              }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: 600, letterSpacing: '0.04em' }}>
                AI Agent
              </span>
            </div>

            {/* Sound toggle */}
            <button
              onClick={() => setMuted(v => !v)}
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
                border: `1px solid ${muted ? 'rgba(255,255,255,0.12)' : 'rgba(124,92,245,0.5)'}`,
                borderRadius: 20, padding: '5px 10px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
                color: muted ? 'rgba(255,255,255,0.5)' : '#a78bfa',
                transition: 'all .15s',
              }}
              title={muted ? 'Włącz dźwięk' : 'Wycisz'}
            >
              {muted
                ? <VolumeX size={13} strokeWidth={1.75} />
                : <Volume2 size={13} strokeWidth={1.75} />
              }
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.04em' }}>
                {muted ? 'Włącz dźwięk' : 'Wycisz'}
              </span>
            </button>
          </div>
        </div>

        {/* RIGHT — text + campaign picker */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#7C5CF5',
            }}>FlowCampaigns AI</span>
          </div>

          <h1 style={{
            fontSize: 36, fontWeight: 800, lineHeight: 1.2,
            color: '#fff',
            marginBottom: 12,
          }}>
            Cześć! Jaki rodzaj<br />
            <span style={{ background: 'linear-gradient(90deg, #7C5CF5, #3A67F0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              kampanii
            </span>{' '}tworzysz?
          </h1>

          <p style={{
            fontSize: 15, color: 'rgba(255,255,255,0.45)',
            marginBottom: 32, lineHeight: 1.6,
          }}>
            Wybierz typ kampanii, a dobiorę odpowiednie formaty i ustawienia.
          </p>

          {/* Campaign type grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 32 }}>
            {CAMPAIGN_TYPES.map(ct => (
              <button
                key={ct.id}
                onClick={() => onSelect(ct.id)}
                onMouseEnter={() => setHovered(ct.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  gap: 4, padding: '14px 16px',
                  borderRadius: 12, cursor: 'pointer',
                  border: `1.5px solid ${hovered === ct.id ? 'rgba(124,92,245,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  background: hovered === ct.id
                    ? 'rgba(124,92,245,0.12)'
                    : 'rgba(255,255,255,0.04)',
                  transition: 'all .15s',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 22 }}>{ct.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{ct.label}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.3 }}>{ct.desc}</span>
              </button>
            ))}
          </div>

          <button
            onClick={onSkip}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, color: 'rgba(255,255,255,0.3)',
              textDecoration: 'underline', padding: 0,
            }}
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
