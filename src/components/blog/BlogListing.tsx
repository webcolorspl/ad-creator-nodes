'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { BLOG_POSTS, type BlogCategory } from '@/lib/blogPosts'
import { BlogNav } from './BlogNav'
import { BlogScrollFix } from './BlogScrollFix'
import { useBlogTheme } from './useBlogTheme'

const CATEGORIES: BlogCategory[] = [
  'AI i kreacje', 'Kampanie reklamowe', 'Social Media', 'Agencje i freelancerzy', 'E-commerce',
]

const CAT_COLORS: Record<BlogCategory, string> = {
  'AI i kreacje': '#16a34a',
  'Kampanie reklamowe': '#2563eb',
  'Social Media': '#7c3aed',
  'Agencje i freelancerzy': '#ea580c',
  'E-commerce': '#0891b2',
}

const CAT_GRADIENTS: Record<BlogCategory, string> = {
  'AI i kreacje': 'linear-gradient(135deg, #16a34a, #0d9488)',
  'Kampanie reklamowe': 'linear-gradient(135deg, #2563eb, #7c3aed)',
  'Social Media': 'linear-gradient(135deg, #7c3aed, #ec4899)',
  'Agencje i freelancerzy': 'linear-gradient(135deg, #ea580c, #f59e0b)',
  'E-commerce': 'linear-gradient(135deg, #0891b2, #0284c7)',
}

const GridIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/>
    <rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>
  </svg>
)

const ListIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <circle cx="4" cy="6" r="1" fill={color}/><circle cx="4" cy="12" r="1" fill={color}/><circle cx="4" cy="18" r="1" fill={color}/>
  </svg>
)

type ViewMode = 'grid' | 'list'
type FontSize = 0 | 1 | 2
const FONT_SCALES = [1, 1.15, 1.3] as const
const FONT_LABELS = ['A', 'A+', 'A++'] as const

export function BlogListing() {
  const { dark, toggle, mounted } = useBlogTheme()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<BlogCategory | null>(null)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [view, setView] = useState<ViewMode>('grid')
  const [fontSize, setFontSize] = useState<FontSize>(0)
  const stickyRef = useRef<HTMLDivElement>(null)
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('blog-view')
    if (saved === 'list' || saved === 'grid') setView(saved)
    const savedFont = localStorage.getItem('blog-font-size')
    if (savedFont === '0' || savedFont === '1' || savedFont === '2') setFontSize(Number(savedFont) as FontSize)
  }, [])

  // Sticky observer
  useEffect(() => {
    const el = stickyRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-61px 0px 0px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [mounted])

  const switchView = (v: ViewMode) => {
    setView(v)
    localStorage.setItem('blog-view', v)
  }

  const cycleFontSize = () => {
    const next = ((fontSize + 1) % 3) as FontSize
    setFontSize(next)
    localStorage.setItem('blog-font-size', String(next))
  }

  const fs = FONT_SCALES[fontSize]

  const t = dark ? {
    bg: '#07070b', text: '#fff', textSub: 'rgba(255,255,255,0.55)',
    textMuted: 'rgba(255,255,255,0.35)', border: 'rgba(255,255,255,0.08)',
    cardBg: 'rgba(255,255,255,0.04)', cardBgHover: 'rgba(255,255,255,0.07)',
    cardBorderHover: 'rgba(255,255,255,0.18)', inputBg: 'rgba(255,255,255,0.05)',
    inputBorder: 'rgba(255,255,255,0.12)', inputColor: '#fff',
    filterBorder: 'rgba(255,255,255,0.12)', filterColor: 'rgba(255,255,255,0.5)',
    nlBg: 'rgba(22,163,74,0.1)', nlBorder: 'rgba(22,163,74,0.2)',
    toggleBg: 'rgba(255,255,255,0.06)', toggleActive: 'rgba(255,255,255,0.14)',
    stickyBg: 'rgba(7,7,11,0.95)', stickyBorder: 'rgba(255,255,255,0.06)',
  } : {
    bg: '#f4f5f7', text: '#0f0f12', textSub: 'rgba(0,0,0,0.55)',
    textMuted: 'rgba(0,0,0,0.38)', border: 'rgba(0,0,0,0.07)',
    cardBg: '#ffffff', cardBgHover: '#f8f9fc',
    cardBorderHover: 'rgba(0,0,0,0.14)', inputBg: '#fff',
    inputBorder: 'rgba(0,0,0,0.12)', inputColor: '#0f0f12',
    filterBorder: 'rgba(0,0,0,0.1)', filterColor: 'rgba(0,0,0,0.45)',
    nlBg: 'rgba(22,163,74,0.07)', nlBorder: 'rgba(22,163,74,0.18)',
    toggleBg: 'rgba(0,0,0,0.04)', toggleActive: 'rgba(0,0,0,0.1)',
    stickyBg: 'rgba(244,245,247,0.95)', stickyBorder: 'rgba(0,0,0,0.06)',
  }

  const filtered = BLOG_POSTS.filter(p => {
    const matchCat = !activeCategory || p.category === activeCategory
    const q = search.toLowerCase()
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: 'system-ui, sans-serif', transition: 'background .2s, color .2s' }}>
      <BlogScrollFix />
      <BlogNav dark={dark} onToggle={toggle} />

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '56px 32px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h1 style={{ fontSize: 'clamp(42px, 5.2vw, 74px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 20, lineHeight: 1.1, color: t.text }}>
            Blog <span style={{ color: '#16a34a' }}>XTOOLS.PL</span>
          </h1>
          <p style={{ fontSize: 24, color: t.textSub, maxWidth: 620, margin: '0 auto 44px', lineHeight: 1.6 }}>
            Praktyczna wiedza o tworzeniu reklam z AI, kampaniach i marketingu cyfrowym
          </p>
        </div>

        {/* Sentinel for sticky detection */}
        <div ref={stickyRef} style={{ height: 1, marginBottom: -1 }} />

        {/* Search + Category filter + view toggle — sticky bar */}
        <div style={{
          position: 'sticky', top: 60, zIndex: 100,
          background: isSticky ? t.stickyBg : 'transparent',
          backdropFilter: isSticky ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: isSticky ? 'blur(16px)' : 'none',
          borderBottom: isSticky ? `1px solid ${t.stickyBorder}` : '1px solid transparent',
          padding: isSticky ? '12px 0' : '0 0 32px 0',
          marginLeft: -32, marginRight: -32, paddingLeft: 32, paddingRight: 32,
          transition: 'background .2s, padding .2s, border .2s',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 520, margin: '0 auto', marginBottom: isSticky ? 10 : 24 }}>
            <input type="text" placeholder="Szukaj artykułów..." value={search} onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '13px 22px 13px 50px',
                borderRadius: 13, border: `1.5px solid ${t.inputBorder}`,
                background: t.inputBg, color: t.inputColor,
                fontSize: 18, outline: 'none', boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
            <svg style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: t.textMuted }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>

          {/* Filters + toggles */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => setActiveCategory(null)} style={{
                padding: '8px 18px', borderRadius: 22, border: `1.5px solid ${!activeCategory ? '#16a34a' : t.filterBorder}`,
                background: !activeCategory ? 'rgba(22,163,74,0.12)' : 'transparent',
                color: !activeCategory ? '#16a34a' : t.filterColor,
                fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Wszystkie ({BLOG_POSTS.length})
              </button>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} style={{
                  padding: '8px 18px', borderRadius: 22,
                  border: `1.5px solid ${activeCategory === cat ? CAT_COLORS[cat] : t.filterBorder}`,
                  background: activeCategory === cat ? CAT_COLORS[cat] + '18' : 'transparent',
                  color: activeCategory === cat ? CAT_COLORS[cat] : t.filterColor,
                  fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Font size toggle */}
              <button onClick={cycleFontSize} style={{
                height: 30, padding: '0 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: t.toggleBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: t.textMuted,
                fontFamily: 'inherit',
              }}>
                {FONT_LABELS[fontSize]}
              </button>

              {/* View toggle */}
              <div style={{ display: 'flex', gap: 4, background: t.toggleBg, borderRadius: 10, padding: 3 }}>
                <button onClick={() => switchView('grid')} style={{
                  width: 34, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: view === 'grid' ? t.toggleActive : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <GridIcon color={view === 'grid' ? t.text : (dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)')} />
                </button>
                <button onClick={() => switchView('list')} style={{
                  width: 34, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: view === 'list' ? t.toggleActive : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ListIcon color={view === 'list' ? t.text : (dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)')} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts: Grid view — full-bleed image cards */}
        {view === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, marginBottom: 80, marginTop: 8 }}>
            {filtered.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <article style={{
                  borderRadius: 18, overflow: 'hidden',
                  height: 340, position: 'relative',
                  cursor: 'pointer',
                  boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
                }}>
                  {/* Background image */}
                  <div
                    className="blog-card-img"
                    style={{
                      position: 'absolute', inset: 0,
                      backgroundImage: post.cover ? `url(${post.cover})` : CAT_GRADIENTS[post.category],
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      transition: 'transform .4s ease, filter .4s ease',
                    }}
                  />
                  {/* Gradient overlay for text readability */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.05) 100%)',
                    transition: 'background .3s',
                  }} />
                  {/* Content on top */}
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 2,
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    padding: '24px 26px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: 20,
                        fontSize: Math.round(12 * fs), fontWeight: 700, letterSpacing: '0.04em',
                        background: 'rgba(255,255,255,0.18)', color: '#fff', backdropFilter: 'blur(8px)',
                      }}>
                        {post.category}
                      </span>
                      <span style={{ fontSize: Math.round(12 * fs), fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                        {post.readTime} min czytania
                      </span>
                    </div>
                    <h2 style={{
                      fontSize: Math.round(24 * fs), fontWeight: 800, color: '#fff',
                      margin: '0 0 8px', lineHeight: 1.25, letterSpacing: '-0.01em',
                      textShadow: '0 1px 8px rgba(0,0,0,0.3)',
                    }}>
                      {post.title}
                    </h2>
                    <p style={{
                      fontSize: Math.round(15 * fs), color: 'rgba(255,255,255,0.75)',
                      lineHeight: 1.5, margin: 0,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {post.excerpt}
                    </p>
                    <div style={{ fontSize: Math.round(13 * fs), color: 'rgba(255,255,255,0.5)', marginTop: 10, fontWeight: 500 }}>
                      {new Date(post.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* Posts: List view — thumbnail left, text right */}
        {view === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 80, marginTop: 8 }}>
            {filtered.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <article style={{
                  borderRadius: 16, border: `1px solid ${t.border}`,
                  background: t.cardBg, overflow: 'hidden',
                  display: 'flex', height: 200,
                  boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'all .2s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = t.cardBorderHover
                  el.style.transform = 'translateY(-2px)'
                  el.style.boxShadow = dark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 6px 20px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = t.border
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)'
                }}
                >
                  {/* Thumbnail left */}
                  <div style={{
                    width: 280, flexShrink: 0, height: '100%',
                    backgroundImage: post.cover ? `url(${post.cover})` : CAT_GRADIENTS[post.category],
                    backgroundSize: 'cover', backgroundPosition: 'center',
                  }} />
                  {/* Text right */}
                  <div style={{
                    flex: 1, padding: '20px 24px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    minWidth: 0,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{
                        fontSize: Math.round(12 * fs), fontWeight: 700,
                        color: CAT_COLORS[post.category], textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}>
                        {post.category}
                      </span>
                      <span style={{ fontSize: Math.round(12 * fs), color: t.textMuted }}>
                        {post.readTime} min czytania
                      </span>
                    </div>
                    <h2 style={{
                      fontSize: Math.round(21 * fs), fontWeight: 800, color: t.text,
                      margin: '0 0 8px', lineHeight: 1.3, letterSpacing: '-0.01em',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {post.title}
                    </h2>
                    <p style={{
                      fontSize: Math.round(15 * fs), color: t.textSub,
                      lineHeight: 1.55, margin: '0 0 10px',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {post.excerpt}
                    </p>
                    <div style={{ fontSize: Math.round(13 * fs), color: t.textMuted, fontWeight: 500 }}>
                      {new Date(post.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: t.textMuted }}>
            <p style={{ fontSize: 19 }}>Brak artykułów dla podanego wyszukiwania</p>
          </div>
        )}

        {/* Newsletter */}
        <div style={{
          borderRadius: 24, padding: '56px 48px',
          background: t.nlBg, border: `1px solid ${t.nlBorder}`, textAlign: 'center',
        }}>
          <h3 style={{ fontSize: 37, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 16, color: t.text }}>
            Newsletter XTOOLS.PL
          </h3>
          <p style={{ fontSize: 21, color: t.textSub, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.6 }}>
            Co tydzień: nowe narzędzia AI, case studies kampanii i porady dla marketerów. Zero spamu.
          </p>
          {subscribed ? (
            <div style={{ fontSize: 21, color: '#16a34a', fontWeight: 700 }}>Zapisano! Sprawdź skrzynkę email.</div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); if (email) setSubscribed(true) }}
              style={{ display: 'flex', gap: 12, maxWidth: 460, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input type="email" required placeholder="twoj@email.com" value={email} onChange={e => setEmail(e.target.value)}
                style={{
                  flex: 1, minWidth: 240, padding: '14px 20px',
                  borderRadius: 11, border: `1.5px solid ${t.inputBorder}`,
                  background: t.inputBg, color: t.inputColor,
                  fontSize: 20, outline: 'none', fontFamily: 'inherit',
                }}
              />
              <button type="submit" style={{
                padding: '14px 26px', borderRadius: 11, border: 'none',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#fff', fontSize: 20, fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
              }}>
                Zapisz się
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
