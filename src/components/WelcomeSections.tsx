'use client'
import { useEffect, useRef, useState } from 'react'
import { BookOpen, Video, Camera, Zap, Target, Bot, Package, Lock, Users, Check } from 'lucide-react'
import type { LucideIcon } from '@/lib/icons'

// ── Theme ─────────────────────────────────────────────────────
function theme(dark: boolean) {
  return dark ? {
    bg:            '#07070b',
    text:          '#ffffff',
    textSub:       'rgba(255,255,255,0.82)',
    textMuted:     'rgba(255,255,255,0.55)',
    textFaint:     'rgba(255,255,255,0.28)',
    divider:       'rgba(255,255,255,0.07)',
    cardBg:        'rgba(255,255,255,0.03)',
    cardBorder:    'rgba(255,255,255,0.08)',
    cardBorderH:   'rgba(255,255,255,0.2)',
    badgeSoon:     { bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: 'rgba(99,102,241,0.3)' },
    badgeWip:      { bg: 'rgba(234,179,8,0.15)',  color: '#fde047', border: 'rgba(234,179,8,0.3)'  },
    planBg:        'rgba(255,255,255,0.04)',
    planBorder:    'rgba(255,255,255,0.1)',
    planBorderPro: '#16a34a',
    planProBg:     'rgba(22,163,74,0.08)',
    checkColor:    '#4ade80',
  } : {
    bg:            '#f4f4f7',
    text:          '#0f0f12',
    textSub:       '#3a3a4a',
    textMuted:     '#6b6b80',
    textFaint:     '#aaaabc',
    divider:       'rgba(0,0,0,0.08)',
    cardBg:        '#ffffff',
    cardBorder:    'rgba(0,0,0,0.08)',
    cardBorderH:   'rgba(0,0,0,0.22)',
    badgeSoon:     { bg: 'rgba(99,102,241,0.08)', color: '#6366f1', border: 'rgba(99,102,241,0.2)' },
    badgeWip:      { bg: 'rgba(234,179,8,0.1)',   color: '#b45309', border: 'rgba(234,179,8,0.25)'  },
    planBg:        '#ffffff',
    planBorder:    'rgba(0,0,0,0.1)',
    planBorderPro: '#16a34a',
    planProBg:     'rgba(22,163,74,0.05)',
    checkColor:    '#16a34a',
  }
}

// ── Fade-in on scroll ─────────────────────────────────────────
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function FadeSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useFadeIn()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(40px)',
      transition: `opacity .65s ease ${delay}ms, transform .65s ease ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

// ── Section header ────────────────────────────────────────────
function SectionHeader({ label, title, green, sub, dark }: {
  label: string; title: string; green: string; sub: string; dark: boolean
}) {
  const t = theme(dark)
  return (
    <div style={{ marginBottom: 56 }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(22,163,74,0.1)', borderRadius: 20,
        padding: '5px 18px', marginBottom: 22,
        border: '1px solid rgba(22,163,74,0.2)',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      <h2 style={{
        fontSize: 'clamp(36px, 3.5vw, 54px)', fontWeight: 900,
        color: t.text, lineHeight: 1.08, letterSpacing: '-0.025em', marginBottom: 18,
      }}>
        {title}<br /><span style={{ color: '#16a34a' }}>{green}</span>
      </h2>
      <p style={{ fontSize: 20, color: t.textMuted, lineHeight: 1.7, maxWidth: 560 }}>{sub}</p>
    </div>
  )
}

// ── SEKCJA 2: Więcej narzędzi ─────────────────────────────────
interface ComingTool {
  label: string
  desc: string
  longDesc: string
  badge: 'SOON' | 'IN PROGRESS'
  photo: string
  gradient: string
}

const COMING: ComingTool[] = [
  {
    label: 'Brandbook',
    badge: 'SOON',
    photo: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=480&h=320&fit=crop&auto=format',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    desc: 'Spójna identyfikacja wizualna w minuty.',
    longDesc: 'Opisz swoją markę, podaj wartości i grupę docelową — AI wygeneruje kompletny brandbook: logo w wariantach, paletę kolorów, typografię, przykłady zastosowania i gotowy PDF do przekazania klientowi. Koniec z tygodniami pracy studio graficznego.',
  },
  {
    label: 'Video Creator',
    badge: 'IN PROGRESS',
    photo: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=480&h=320&fit=crop&auto=format',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    desc: 'Filmy reklamowe z briefu, bez ekipy.',
    longDesc: 'Podaj brief, wybierz styl i muzykę — AI generuje gotowy film reklamowy z lektorem, napisami i animacjami. Obsługuje formaty pionowe (Reels, TikTok), poziome (YouTube) i kwadratowe (FB). Eksport w rozdzielczości 4K, gotowy do publikacji.',
  },
  {
    label: 'Photo Generator',
    badge: 'SOON',
    photo: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=480&h=320&fit=crop&auto=format',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    desc: 'Zdjęcia produktowe bez sesji foto.',
    longDesc: 'Wgraj zdjęcie produktu ze smartfona — AI umieści go w profesjonalnym otoczeniu: białe tło, lifestyle, sezon, dowolna lokalizacja. Generuj dziesiątki wariantów w kilka sekund. Idealne dla e-commerce, które nie mają budżetu na fotografa.',
  },
]

export function SectionComingSoon({ dark }: { dark: boolean }) {
  const t = theme(dark)
  return (
    <section style={{ padding: '120px 0' }}>
      <FadeSection>
        <SectionHeader
          label="Na horyzoncie"
          title="Kolejne narzędzia"
          green="już wkrótce."
          sub="Rozbudowujemy ekosystem. Zarejestruj się dziś i jako pierwszy dostaniesz dostęp do nowych modułów — jeszcze przed oficjalnym startem."
          dark={dark}
        />
      </FadeSection>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {COMING.map((tool, i) => {
          const badge = tool.badge === 'SOON' ? t.badgeSoon : t.badgeWip
          return (
            <FadeSection key={tool.label} delay={i * 100}>
              <div style={{
                display: 'flex', alignItems: 'stretch',
                borderRadius: 24,
                border: `1px solid ${t.cardBorder}`,
                background: t.cardBg,
                overflow: 'hidden',
                filter: dark ? 'grayscale(0.3)' : 'grayscale(0.15)',
                opacity: 0.85,
              }}>
                {/* Photo */}
                <div style={{
                  width: 260, flexShrink: 0, position: 'relative',
                  background: tool.gradient,
                }}>
                  <img
                    src={tool.photo}
                    alt={tool.label}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover', display: 'block',
                      mixBlendMode: dark ? 'luminosity' : 'luminosity',
                      opacity: dark ? 0.5 : 0.65,
                    }}
                  />
                  {/* gradient overlay on photo */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(to right, transparent 60%, ${dark ? 'rgba(7,7,11,0.6)' : 'rgba(244,244,247,0.5)'} 100%)`,
                  }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Badge + title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center',
                      background: badge.bg, border: `1px solid ${badge.border}`,
                      borderRadius: 20, padding: '4px 12px',
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: badge.color, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        {tool.badge}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: t.textMuted, marginBottom: 6, letterSpacing: '-0.02em' }}>
                      {tool.label}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: t.textFaint, marginBottom: 16 }}>
                      {tool.desc}
                    </div>
                    <p style={{ fontSize: 15, color: t.textMuted, lineHeight: 1.75, maxWidth: 580 }}>
                      {tool.longDesc}
                    </p>
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    <a
                      href="/rejestracja"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 13, fontWeight: 700, color: t.textFaint,
                        textDecoration: 'none', letterSpacing: '0.02em',
                      }}
                    >
                      Powiadom mnie o starcie →
                    </a>
                  </div>
                </div>
              </div>
            </FadeSection>
          )
        })}
      </div>
    </section>
  )
}

// ── SEKCJA 3: Features ────────────────────────────────────────
interface Feature { Icon: LucideIcon; title: string; desc: string }
const FEATURES: Feature[] = [
  { Icon: Zap,     title: 'Od briefu do kreacji w minuty',    desc: 'Zapomnij o godzinach w Photoshopie. Opisz co chcesz — AI robi resztę.' },
  { Icon: Target,  title: 'Multi-channel w jednym miejscu',   desc: 'Meta, Google, TikTok, LinkedIn — wszystkie formaty generujesz w jednej sesji.' },
  { Icon: Bot,     title: 'AI wbudowane, nie doklejone',      desc: 'Generowanie tekstu i grafiki to rdzeń narzędzia, nie dodatek.' },
  { Icon: Package, title: 'Eksport gotowy do wrzucenia',      desc: 'Pliki per format i kanał. ZIP jednym kliknięciem, gotowy do upload.' },
  { Icon: Lock,    title: 'Twoje dane, tylko Twoje',          desc: 'Nie trenujemy na Twoich kreacjach. Zero udostępniania danych do modeli.' },
  { Icon: Users,   title: 'Praca zespołowa bez chaosu',       desc: 'Komentarze, wersje, role. Agencja i klient w jednym workspace.' },
]

export function SectionFeatures({ dark }: { dark: boolean }) {
  const t = theme(dark)
  const [hovered, setHovered] = useState<number | null>(null)
  return (
    <section style={{ padding: '120px 0', borderTop: `1px solid ${t.divider}` }}>
      <FadeSection>
        <SectionHeader
          label="Dlaczego XTOOLS"
          title="Mniej narzędzi."
          green="Więcej kampanii."
          sub="Agencje tracą średnio 40% czasu na przełączanie się między narzędziami. XTOOLS łączy planowanie, generowanie kreacji i eksport w jednym miejscu — żeby Twój zespół skupił się na tym, co naprawdę przynosi wyniki."
          dark={dark}
        />
      </FadeSection>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {FEATURES.map((f, i) => (
          <FadeSection key={f.title} delay={i * 60}>
            <div
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: '36px 30px',
                borderRadius: 20,
                border: `1px solid ${hovered === i ? t.cardBorderH : t.cardBorder}`,
                background: hovered === i ? (dark ? 'rgba(255,255,255,0.06)' : '#fff') : t.cardBg,
                transition: 'all .2s', cursor: 'default',
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14, marginBottom: 18,
                background: hovered === i ? 'rgba(22,163,74,0.15)' : (dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background .2s',
              }}>
                <f.Icon size={24} strokeWidth={1.5} color={hovered === i ? '#16a34a' : t.textMuted} />
              </div>
              <div style={{ fontSize: 19, fontWeight: 800, color: t.text, marginBottom: 10 }}>{f.title}</div>
              <div style={{ fontSize: 15, color: t.textMuted, lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          </FadeSection>
        ))}
      </div>
    </section>
  )
}

// ── SEKCJA 4: Testimonials ────────────────────────────────────
interface Testimonial { name: string; role: string; company: string; quote: string; avatar: number }
const TESTIMONIALS: Testimonial[] = [
  { name: 'Marta Kowalczyk', role: 'Head of Performance', company: 'Agencja Wzrost',    quote: 'Skróciliśmy czas produkcji kreacji o 70%. Klienci dostają materiały następnego dnia po briefie, nie po tygodniu.', avatar: 44 },
  { name: 'Piotr Zając',     role: 'Freelance Art Director', company: 'Self-employed',   quote: 'W końcu narzędzie, które rozumie workflow agencyjny. Generuję paczki na 5 kanałów jednocześnie — to jest przyszłość.', avatar: 68 },
  { name: 'Karolina Nowak',  role: 'Marketing Manager',   company: 'Sklep Zenith',      quote: 'Wdrożyliśmy XTOOLS dla całego zespołu marketingu. Oszczędzamy 20h tygodniowo tylko na formatowaniu kreacji.', avatar: 56 },
]

export function SectionTestimonials({ dark }: { dark: boolean }) {
  const t = theme(dark)
  return (
    <section style={{ padding: '120px 0', borderTop: `1px solid ${t.divider}` }}>
      <FadeSection>
        <SectionHeader
          label="Opinie użytkowników"
          title="Agencje i freelancerzy"
          green="już to wiedzą."
          sub="Dołącz do setek marketerów, którzy skrócili czas produkcji kreacji o połowę."
          dark={dark}
        />
      </FadeSection>
      <div style={{ display: 'flex', gap: 22 }}>
        {TESTIMONIALS.map((tm, i) => (
          <FadeSection key={tm.name} delay={i * 100}>
            <div style={{
              flex: 1, padding: '36px 30px',
              borderRadius: 24,
              border: `1px solid ${t.cardBorder}`,
              background: t.cardBg,
              display: 'flex', flexDirection: 'column', gap: 24,
            }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[...Array(5)].map((_, s) => <span key={s} style={{ color: '#facc15', fontSize: 18 }}>★</span>)}
              </div>
              <p style={{ fontSize: 17, color: t.textSub, lineHeight: 1.75, flex: 1, fontStyle: 'italic' }}>
                „{tm.quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img
                  src={`https://i.pravatar.cc/56?img=${tm.avatar}`}
                  alt={tm.name}
                  width={48} height={48}
                  style={{ borderRadius: '50%', border: `2px solid ${t.cardBorder}` }}
                />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{tm.name}</div>
                  <div style={{ fontSize: 13, color: t.textMuted }}>{tm.role} · {tm.company}</div>
                </div>
              </div>
            </div>
          </FadeSection>
        ))}
      </div>
    </section>
  )
}

// ── SEKCJA 5: Cennik (full-width + parallax gradient) ─────────
import { Gift, Rocket, Star, Building2, Sparkles } from 'lucide-react'

interface Plan {
  name: string; price: string; period: string; desc: string
  Icon: LucideIcon; iconColor: string; iconBg: string
  tokens: number; tokenDesc: string; tokenRate: string
  savings?: string
  features: string[]; missing: string[]; cta: string; highlighted?: boolean
}
const PLANS: Plan[] = [
  {
    name: 'Free', price: '0 zł', period: 'na zawsze',
    desc: 'Idealny start — bez karty kredytowej, bez zobowiązań.',
    Icon: Gift, iconColor: '#6366f1', iconBg: 'rgba(99,102,241,0.12)',
    tokens: 100, tokenDesc: '~20 banerów lub 50 tekstów', tokenRate: '0,24 zł / token',
    features: ['3 aktywne projekty', 'Creator (generator banerów)', '20 eksportów miesięcznie', 'Formaty: FB, IG, Google'],
    missing: ['Composer (canvas)', 'Eksport bez watermarku', 'Historia wersji', 'Wsparcie priorytetowe'],
    cta: 'Zacznij za darmo',
  },
  {
    name: 'Starter', price: '119 zł', period: '/ miesiąc',
    desc: 'Dla freelancerów, którzy chcą dostarczać więcej bez zwiększania zespołu.',
    Icon: Rocket, iconColor: '#16a34a', iconBg: 'rgba(22,163,74,0.15)',
    tokens: 500, tokenDesc: '~100 banerów lub 25 zdjęć AI', tokenRate: '0,24 zł / token',
    features: ['Nielimitowane projekty', 'Creator + Composer', 'Nielimitowany eksport', 'Brak watermarku', 'Historia i wersje', 'Wszystkie formaty i kanały', 'Chat support'],
    missing: ['Multi-klient workspace', 'Brandbook (SOON)', 'White-label'],
    cta: 'Wypróbuj 14 dni gratis',
    highlighted: true,
  },
  {
    name: 'Pro', price: '249 zł', period: '/ miesiąc',
    desc: 'Dla rosnących firm, które potrzebują więcej mocy AI i kilku workspace\'ów.',
    Icon: Star, iconColor: '#f59e0b', iconBg: 'rgba(245,158,11,0.12)',
    tokens: 1500, tokenDesc: '~300 banerów lub 75 zdjęć AI', tokenRate: '0,17 zł / token',
    savings: 'O 30% taniej za token niż Starter',
    features: ['Wszystko ze Starter', '3 workspace\'y klientów', 'Priorytetowe generowanie AI', 'Wczesny dostęp do nowych modułów', 'Brandbook (SOON)'],
    missing: ['White-label eksport', 'Dedykowany opiekun'],
    cta: 'Wybierz Pro',
  },
  {
    name: 'Agency', price: '699 zł', period: '/ miesiąc',
    desc: 'Dla agencji obsługujących wielu klientów — 15 workspace\'ów za cenę 6 kont Starter.',
    Icon: Building2, iconColor: '#0ea5e9', iconBg: 'rgba(14,165,233,0.12)',
    tokens: 5000, tokenDesc: '~1 000 banerów lub 100 filmów AI', tokenRate: '0,14 zł / token',
    savings: 'Oszczędzasz 1 086 zł/mies vs 15 × Starter',
    features: ['Wszystko z Pro', 'Do 15 workspace\'ów klientów', 'Brandbook (SOON)', 'Video Creator (wkrótce)', 'White-label eksport', 'Dedykowany opiekun', 'Priorytetowe wsparcie 24/7'],
    missing: [],
    cta: 'Porozmawiaj z nami',
  },
]

// yearly discounts: Free 0%, Starter 10%, Pro 20%, Agency 30%
const YEARLY_DISCOUNT = [0, 0.10, 0.20, 0.30]

function yearlyMonthly(monthlyPrice: string, discountIdx: number): { crossed: string; price: string; saving: string } | null {
  const disc = YEARLY_DISCOUNT[discountIdx]
  if (!disc) return null
  const num = parseInt(monthlyPrice)
  const discounted = Math.round(num * (1 - disc))
  const saving = Math.round(num * disc * 12)
  return { crossed: monthlyPrice, price: `${discounted} zł`, saving: `Oszczędzasz ${saving} zł/rok` }
}

export function SectionPricing({ dark, scrollY }: { dark: boolean; scrollY: number }) {
  const t = theme(dark)
  const [hovered, setHovered] = useState<number | null>(null)
  const [yearly, setYearly] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const offsetTop = sectionRef.current?.offsetTop ?? 0
  const parallaxY = (scrollY - offsetTop) * 0.35

  return (
    <section
      ref={sectionRef}
      style={{
        borderTop: `1px solid ${t.divider}`,
        position: 'relative', overflow: 'hidden',
        padding: '120px 0',
        background: dark ? '#020204' : '#e8e8ee',
      }}
    >
      {/* Parallax gradient layers */}
      <div style={{
        position: 'absolute', inset: '-50% -20%', pointerEvents: 'none',
        background: dark
          ? 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(22,163,74,0.13) 0%, rgba(99,102,241,0.08) 55%, transparent 100%)'
          : 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(22,163,74,0.09) 0%, rgba(99,102,241,0.05) 55%, transparent 100%)',
        transform: `translateY(${parallaxY}px)`,
        transition: 'background .3s',
      }} />
      <div style={{
        position: 'absolute', inset: '-30% -10%', pointerEvents: 'none',
        background: dark
          ? 'radial-gradient(ellipse 45% 35% at 15% 85%, rgba(14,165,233,0.08) 0%, transparent 100%)'
          : 'radial-gradient(ellipse 45% 35% at 15% 85%, rgba(14,165,233,0.06) 0%, transparent 100%)',
        transform: `translateY(${parallaxY * 1.7}px)`,
      }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '0 72px 0 64px' }}>
        {/* Header — centered */}
        <FadeSection>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(22,163,74,0.1)', borderRadius: 20,
              padding: '5px 18px', marginBottom: 22,
              border: '1px solid rgba(22,163,74,0.2)',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Cennik
              </span>
            </div>
            <h2 style={{
              fontSize: 'clamp(36px, 3.5vw, 54px)', fontWeight: 900,
              color: t.text, lineHeight: 1.08, letterSpacing: '-0.025em', marginBottom: 18,
            }}>
              Zacznij za darmo,<br /><span style={{ color: '#16a34a' }}>skaluj gdy rośniesz.</span>
            </h2>
            <p style={{ fontSize: 19, color: t.textMuted, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 32px' }}>
              Bez ukrytych opłat. Zmień lub anuluj plan w każdej chwili.
            </p>

            {/* Switcher miesięcznie / rocznie */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: !yearly ? t.text : t.textMuted, transition: 'color .2s' }}>
                Miesięcznie
              </span>
              <button
                onClick={() => setYearly(y => !y)}
                style={{
                  width: 52, height: 28, borderRadius: 14, border: 'none',
                  background: yearly
                    ? 'linear-gradient(135deg, #16a34a, #15803d)'
                    : (dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'),
                  cursor: 'pointer', position: 'relative',
                  transition: 'background .25s',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 4, left: yearly ? 28 : 4,
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                  transition: 'left .25s cubic-bezier(0.34,1.4,0.64,1)',
                }} />
              </button>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: yearly ? t.text : t.textMuted, transition: 'color .2s' }}>
                  Rocznie
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 800, color: '#16a34a',
                  background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.25)',
                  borderRadius: 20, padding: '2px 10px', letterSpacing: '0.05em',
                }}>
                  do −30%
                </span>
              </span>
            </div>
          </div>
        </FadeSection>

        {/* Cards — grid dla równej wysokości */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, alignItems: 'stretch' }}>
          {PLANS.map((plan, i) => {
            const isHovered = hovered === i
            const yr = yearly ? yearlyMonthly(plan.price, i) : null

            return (
              <FadeSection key={plan.name} delay={i * 90}>
                <div
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    height: '100%', display: 'flex', flexDirection: 'column',
                    borderRadius: 24,
                    border: `2px solid ${plan.highlighted
                      ? plan.iconColor
                      : isHovered ? t.cardBorderH : t.planBorder}`,
                    background: plan.highlighted
                      ? (dark ? `${plan.iconColor}10` : `${plan.iconColor}07`)
                      : (dark ? 'rgba(255,255,255,0.03)' : '#fff'),
                    padding: '32px 22px',
                    position: 'relative',
                    boxShadow: plan.highlighted
                      ? `0 24px 60px ${plan.iconColor}22`
                      : isHovered ? (dark ? '0 12px 40px rgba(0,0,0,0.4)' : '0 8px 28px rgba(0,0,0,0.08)') : 'none',
                    transition: 'all .25s ease',
                  }}
                >
                  {plan.highlighted && (
                    <div style={{
                      position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                      background: `linear-gradient(135deg, ${plan.iconColor}, ${plan.iconColor}cc)`,
                      borderRadius: 20, padding: '5px 16px',
                      fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: '0.1em',
                      textTransform: 'uppercase', whiteSpace: 'nowrap',
                      boxShadow: `0 4px 12px ${plan.iconColor}50`,
                    }}>
                      ✦ Najpopularniejszy
                    </div>
                  )}

                  {/* Icon */}
                  <div style={{
                    width: 52, height: 52, borderRadius: 16, marginBottom: 20,
                    background: isHovered || plan.highlighted ? plan.iconBg : (dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${isHovered || plan.highlighted ? plan.iconColor + '35' : t.cardBorder}`,
                    transition: 'all .2s',
                  }}>
                    <plan.Icon size={24} strokeWidth={1.5}
                      color={isHovered || plan.highlighted ? plan.iconColor : t.textMuted} />
                  </div>

                  {/* Name */}
                  <div style={{
                    fontSize: 12, fontWeight: 800,
                    color: isHovered || plan.highlighted ? plan.iconColor : t.textMuted,
                    marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em',
                    transition: 'color .2s',
                  }}>
                    {plan.name}
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: 6, minHeight: 64 }}>
                    {yr ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <span style={{
                            fontSize: 15, fontWeight: 600, color: t.textFaint,
                            textDecoration: 'line-through',
                          }}>{yr.crossed}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 800, color: '#16a34a',
                            background: 'rgba(22,163,74,0.12)', borderRadius: 10, padding: '2px 7px',
                          }}>
                            −{YEARLY_DISCOUNT[i] * 100}%
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                          <span style={{ fontSize: 38, fontWeight: 900, color: t.text, letterSpacing: '-0.03em', lineHeight: 1 }}>
                            {yr.price}
                          </span>
                          <span style={{ fontSize: 13, color: t.textMuted }}>/ miesiąc</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginTop: 4 }}>{yr.saving}</div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                        <span style={{ fontSize: 38, fontWeight: 900, color: t.text, letterSpacing: '-0.03em', lineHeight: 1 }}>
                          {plan.price}
                        </span>
                        <span style={{ fontSize: 13, color: t.textMuted }}>{plan.period}</span>
                      </div>
                    )}
                  </div>

                  <p style={{ fontSize: 13, color: t.textMuted, marginBottom: 18, lineHeight: 1.65 }}>
                    {plan.desc}
                  </p>

                  {/* Savings badge */}
                  {plan.savings && (
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: plan.iconColor,
                      background: `${plan.iconColor}12`,
                      border: `1px solid ${plan.iconColor}28`,
                      borderRadius: 10, padding: '5px 10px', marginBottom: 16,
                    }}>
                      ✦ {plan.savings}
                    </div>
                  )}

                  {/* Tokens */}
                  <div style={{
                    borderRadius: 12,
                    background: isHovered || plan.highlighted ? `${plan.iconColor}12` : (dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                    border: `1px solid ${isHovered || plan.highlighted ? plan.iconColor + '25' : t.divider}`,
                    padding: '12px 14px', marginBottom: 20,
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'all .2s',
                  }}>
                    <Sparkles size={16} strokeWidth={1.5} color={plan.iconColor} style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: plan.iconColor, letterSpacing: '-0.02em', lineHeight: 1 }}>
                        {plan.tokens.toLocaleString('pl-PL')} tokenów
                        <span style={{ fontSize: 10, fontWeight: 600, color: t.textFaint, marginLeft: 5 }}>/ mies.</span>
                      </div>
                      <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>{plan.tokenDesc}</div>
                    </div>
                  </div>

                  <div style={{ height: 1, background: t.divider, marginBottom: 16 }} />

                  {/* Features */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                          background: `${plan.iconColor}18`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Check size={10} strokeWidth={3} color={plan.iconColor} />
                        </div>
                        <span style={{ fontSize: 13, color: t.textSub, lineHeight: 1.5 }}>{f}</span>
                      </div>
                    ))}
                    {plan.missing.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, opacity: 0.28 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                          background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <div style={{ width: 7, height: 1.5, background: t.textFaint, borderRadius: 1 }} />
                        </div>
                        <span style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <a
                    href="/rejestracja"
                    style={{
                      display: 'block', textAlign: 'center',
                      padding: '14px', borderRadius: 14,
                      fontSize: 14, fontWeight: 800,
                      textDecoration: 'none', letterSpacing: '-0.01em',
                      background: plan.highlighted
                        ? `linear-gradient(135deg, ${plan.iconColor}, ${plan.iconColor}cc)`
                        : (dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'),
                      color: plan.highlighted ? '#fff' : t.text,
                      border: plan.highlighted ? 'none' : `1.5px solid ${t.planBorder}`,
                      boxShadow: plan.highlighted ? `0 6px 20px ${plan.iconColor}40` : 'none',
                      transition: 'all .15s',
                    }}
                  >
                    {plan.cta}
                  </a>
                </div>
              </FadeSection>
            )
          })}
        </div>

        <FadeSection delay={400}>
          <p style={{ fontSize: 13, color: t.textFaint, textAlign: 'center', marginTop: 28 }}>
            Wszystkie ceny netto + VAT. Starter i Pro: pierwszy miesiąc gratis. Anuluj kiedy chcesz.
          </p>
        </FadeSection>
      </div>
    </section>
  )
}

// ── SEKCJA 6: Final CTA ───────────────────────────────────────
const STATS = [
  { value: '8',     label: 'obsługiwanych platform social media' },
  { value: '30 min', label: 'średni czas produkcji kampanii' },
  { value: '4×',    label: 'szybciej niż tradycyjne narzędzia' },
]

export function SectionFinalCTA({ dark }: { dark: boolean }) {
  const t = theme(dark)
  const [hoverBtn, setHoverBtn] = useState(false)
  return (
    <section style={{ padding: '120px 0 140px', borderTop: `1px solid ${t.divider}` }}>
      <FadeSection>
        <div style={{ display: 'flex', gap: 0, marginBottom: 72 }}>
          {STATS.map((s, i) => (
            <div key={s.value} style={{
              flex: 1, textAlign: 'center', padding: '32px 20px',
              borderRight: i < STATS.length - 1 ? `1px solid ${t.divider}` : 'none',
            }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#16a34a', letterSpacing: '-0.025em', marginBottom: 8 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 15, color: t.textMuted, lineHeight: 1.6 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{
          borderRadius: 28,
          background: dark
            ? 'linear-gradient(135deg, rgba(22,163,74,0.14) 0%, rgba(15,118,110,0.09) 100%)'
            : 'linear-gradient(135deg, rgba(22,163,74,0.08) 0%, rgba(15,118,110,0.05) 100%)',
          border: `1px solid ${dark ? 'rgba(22,163,74,0.25)' : 'rgba(22,163,74,0.18)'}`,
          padding: '64px 48px', textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: 'clamp(32px, 3.5vw, 50px)', fontWeight: 900,
            color: t.text, letterSpacing: '-0.025em', marginBottom: 14, lineHeight: 1.12,
          }}>
            Zacznij tworzyć kampanie<br />
            <span style={{ color: '#16a34a' }}>szybciej niż kiedykolwiek.</span>
          </h2>
          <p style={{ fontSize: 19, color: t.textMuted, marginBottom: 40, lineHeight: 1.7 }}>
            Bezpłatne konto. Bez karty kredytowej. Bez umów.<br />
            Pierwsze kreacje gotowe w 5 minut.
          </p>
          <a
            href="/rejestracja"
            onMouseEnter={() => setHoverBtn(true)}
            onMouseLeave={() => setHoverBtn(false)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '18px 44px', borderRadius: 50,
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#fff', textDecoration: 'none',
              fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em',
              boxShadow: hoverBtn ? '0 20px 48px rgba(22,163,74,0.55)' : '0 8px 28px rgba(22,163,74,0.4)',
              transform: hoverBtn ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all .2s',
            }}
          >
            Zarejestruj się za darmo
            <span style={{ transform: hoverBtn ? 'translateX(5px)' : 'translateX(0)', transition: 'transform .15s', display: 'inline-block' }}>→</span>
          </a>
          <p style={{ fontSize: 14, color: t.textFaint, marginTop: 20 }}>
            Dołącz do 500+ marketerów którzy już oszczędzają czas
          </p>
        </div>
      </FadeSection>
    </section>
  )
}
