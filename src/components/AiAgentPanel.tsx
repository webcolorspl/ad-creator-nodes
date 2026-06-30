'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import { Send, Minimize2, ChevronUp, Volume2, VolumeX } from 'lucide-react'

interface Message {
  role: 'agent' | 'user'
  text: string
}

interface AiAgentPanelProps {
  campaignType?: string
}

const GREETINGS: Record<string, string> = {
  social:  'Świetny wybór! Tworzę kampanię Social Media. Opisz swój produkt lub wklej brief.',
  display: 'Okej, banery display. Powiedz mi jaki produkt i grupę docelową masz na myśli.',
  email:   'Email marketing — efektywny wybór. Opisz kampanię: produkt, cel, tone of voice.',
  video:   'Wideo ads! Opisz koncept lub powiedz co chcesz zakomunikować.',
  search:  'Search / SEO. Podaj produkt, frazy kluczowe albo opis działalności.',
  all:     'Kampania 360°! Opisz markę i cel kampanii — zajmę się resztą.',
  default: 'Cześć! Opisz swoją kampanię, a pomogę ją zaplanować w tym edytorze.',
}

export function AiAgentPanel({ campaignType }: AiAgentPanelProps) {
  const videoRef       = useRef<HTMLVideoElement>(null)
  const inputRef       = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const timerRef       = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [expanded,    setExpanded]    = useState(true)
  const [input,       setInput]       = useState('')
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [messages,    setMessages]    = useState<Message[]>([])
  const [muted,       setMuted]       = useState(true)

  useEffect(() => {
    const greeting = GREETINGS[campaignType ?? 'default'] ?? GREETINGS.default
    setMessages([{ role: 'agent', text: greeting }])
  }, [campaignType])

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    const text = input.trim()
    if (!text) return
    setMessages(prev => [
      ...prev,
      { role: 'user', text },
      { role: 'agent', text: 'Rozumiem! Pracuję nad tym... Wkrótce dodam tę funkcję pełnego AI 🚀' },
    ])
    setInput('')
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 4000,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
      gap: 8,
    }}>

      {/* Expanded chat panel */}
      {expanded && (
        <div style={{
          width: 320,
          background: 'rgba(14,14,22,0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(124,92,245,0.25)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column',
        }}>

          {/* Video strip */}
          <div style={{ position: 'relative', background: '#0a0a14', lineHeight: 0 }}>
            <video
              ref={videoRef}
              src="/avatar.mp4"
              playsInline
              onCanPlay={() => setVideoLoaded(true)}
              onEnded={handleEnded}
              style={{
                width: '100%', maxHeight: 180,
                objectFit: 'cover',
                opacity: videoLoaded ? 1 : 0,
                transition: 'opacity .4s',
              }}
            />
            {!videoLoaded && (
              <div style={{
                height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: '2px solid rgba(124,92,245,0.3)',
                  borderTopColor: '#7C5CF5',
                  animation: 'spin 1s linear infinite',
                }} />
              </div>
            )}

            {/* Header overlay */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              padding: '10px 12px',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#22c55e', boxShadow: '0 0 6px #22c55e',
                }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                  AI Agent
                </span>
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                <button
                  onClick={() => setMuted(v => !v)}
                  title={muted ? 'Włącz dźwięk' : 'Wycisz'}
                  style={{
                    background: 'rgba(0,0,0,0.4)', border: `1px solid ${muted ? 'rgba(255,255,255,0.1)' : 'rgba(124,92,245,0.5)'}`,
                    borderRadius: 6, padding: '3px 5px', cursor: 'pointer',
                    color: muted ? 'rgba(255,255,255,0.5)' : '#a78bfa',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {muted ? <VolumeX size={12} strokeWidth={1.75} /> : <Volume2 size={12} strokeWidth={1.75} />}
                </button>
                <button
                  onClick={() => setExpanded(false)}
                  style={{
                    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 6, padding: '3px 5px', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center',
                  }}
                >
                  <Minimize2 size={12} strokeWidth={1.75} />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '10px 12px',
            display: 'flex', flexDirection: 'column', gap: 8,
            maxHeight: 200,
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '82%',
                  padding: '8px 11px',
                  borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #3A67F0, #7C5CF5)'
                    : 'rgba(255,255,255,0.07)',
                  border: msg.role === 'agent' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  fontSize: 13, lineHeight: 1.5,
                  color: msg.role === 'user' ? '#fff' : 'rgba(255,255,255,0.82)',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send() }}
              placeholder="Opisz kampanię..."
              style={{
                flex: 1, padding: '8px 10px', fontSize: 13,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: '#fff',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim()}
              style={{
                width: 34, height: 34, borderRadius: 8, border: 'none',
                background: input.trim()
                  ? 'linear-gradient(135deg, #3A67F0, #7C5CF5)'
                  : 'rgba(255,255,255,0.06)',
                cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all .15s',
              }}
            >
              <Send size={14} strokeWidth={1.75} color={input.trim() ? '#fff' : 'rgba(255,255,255,0.25)'} />
            </button>
          </div>
        </div>
      )}

      {/* Collapsed — avatar bubble */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          style={{
            width: 64, height: 64, borderRadius: '50%',
            overflow: 'hidden', border: '2px solid rgba(124,92,245,0.5)',
            boxShadow: '0 4px 20px rgba(124,92,245,0.35)',
            cursor: 'pointer', background: '#0a0a14',
            position: 'relative', padding: 0,
          }}
          title="Otwórz AI Agent"
        >
          <video
            src="/avatar.mp4"
            autoPlay playsInline muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', bottom: 2, right: 2,
            width: 12, height: 12, borderRadius: '50%',
            background: '#22c55e', border: '2px solid #0a0a14',
            boxShadow: '0 0 6px #22c55e',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
            padding: 4,
          }}>
            <ChevronUp size={14} color="rgba(255,255,255,0.7)" strokeWidth={2} />
          </div>
        </button>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
