'use client'
import { useState, useEffect } from 'react'
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

export function BlogListing() {
  const { dark, toggle, mounted } = useBlogTheme()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<BlogCategory | null>(null)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [view, setView] = useState<ViewMode>('grid')
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('blog-view')
    if (saved === 'list' || saved === 'grid') setView(saved)
  }, [])

  const switchView = (v: ViewMode) => {
    setView(v)
    localStorage.setItem('blog-view', v)
  }

  const t = dark ? {
    bg: '#07070b', text: '#fff', textSub: 'rgba(255,255,255,0.55)',
    textMuted: 'rgba(255,255,255,0.35)', border: 'rgba(255,255,255,0.08)',
    cardBg: 'rgba(255,255,255,0.04)', cardBgHover: 'rgba(255,255,255,0.07)',
    cardBorderHover: 'rgba(255,255,255,0.18)', inputBg: 'rgba(255,255,255,0.05)',
    inputBorder: 'rgba(255,255,255,0.12)', inputColor: '#fff',
    filterBorder: 'rgba(255,255,255,0.12)', filterColor: 'rgba(255,255,255,0.5)',
    nlBg: 'rgba(22,163,74,0.1)', nlBorder: 'rgba(22,163,74,0.2)',
    toggleBg: 'rgba(255,255,255,0.06)', toggleActive: 'rgba(255,255,255,0.14)',
  } : {
    bg: '#f4f5f7', text: '#0f0f12', textSub: 'rgba(0,0,0,0.55)',
    textMuted: 'rgba(0,0,0,0.38)', border: 'rgba(0,0,0,0.07)',
    cardBg: '#ffffff', cardBgHover: '#f8f9fc',
    cardBorderHover: 'rgba(0,0,0,0.14)', inputBg: '#fff',
    inputBorder: 'rgba(0,0,0,0.12)', inputColor: '#0f0f12',
    filterBorder: 'rgba(0,0,0,0.1)', filterColor: 'rgba(0,0,0,0.45)',
    nlBg: 'rgba(22,163,74,0.07)', nlBorder: 'rgba(22,163,74,0.18)',
    toggleBg: 'rgba(0,0,0,0.04)', toggleActive: 'rgba(0,0,0,0.1)',
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

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 32px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h1 style={{ fontSize: 'clamp(38px, 4.8vw, 67px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 18, lineHeight: 1.1, color: t.text }}>
            Blog <span style={{ color: '#16a34a' }}>XTOOLS.PL</span>
          </h1>
          <p style={{ fontSize: 22, color: t.textSub, maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Praktyczna wiedza o tworzeniu reklam z AI, kampaniach i marketingu cyfrowym
          </p>
          <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
            <input type="text" placeholder="Szukaj artykułów..." value={search} onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '14px 20px 14px 46px',
                borderRadius: 12, border: `1.5px solid ${t.inputBorder}`,
                background: t.inputBg, color: t.inputColor,
                fontSize: 18, outline: 'none', boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
            <svg style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: t.textMuted }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
        </div>

        {/* Category filter + view toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setActiveCategory(null)} style={{
              padding: '8px 18px', borderRadius: 20, border: `1.5px solid ${!activeCategory ? '#16a34a' : t.filterBorder}`,
              background: !activeCategory ? 'rgba(22,163,74,0.12)' : 'transparent',
              color: !activeCategory ? '#16a34a' : t.filterColor,
              fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Wszystkie ({BLOG_POSTS.length})
            </button>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} style={{
                padding: '8px 18px', borderRadius: 20,
                border: `1.5px solid ${activeCategory === cat ? CAT_COLORS[cat] : t.filterBorder}`,
                background: activeCategory === cat ? CAT_COLORS[cat] + '18' : 'transparent',
                color: activeCategory === cat ? CAT_COLORS[cat] : t.filterColor,
                fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {cat}
              </button>
            ))}
          </div>

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

        {/* Posts: Grid view */}
        {view === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, marginBottom: 80 }}>
            {filtered.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <article style={{
                  borderRadius: 16, border: `1px solid ${t.border}`,
                  background: t.cardBg, overflow: 'hidden',
                  height: '100%', boxSizing: 'border-box',
                  display: 'flex', flexDirection: 'column',
                  transition: 'all .2s', boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.border = `1px solid ${t.cardBorderHover}`
                  el.style.transform = 'translateY(-3px)'
                  el.style.boxShadow = dark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.border = `1px solid ${t.border}`
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)'
                }}
                >
                  <div style={{
                    height: 180,
                    background: ('cover' in post && post.cover)
                      ? `url(${(post as { cover: string }).cover}) center/cover` : CAT_GRADIENTS[post.category],
                    position: 'relative', flexShrink: 0,
                  }}>
                    <span style={{
                      position: 'absolute', bottom: 12, left: 16,
                      padding: '3px 10px', borderRadius: 20,
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                      background: 'rgba(0,0,0,0.4)', color: '#fff', backdropFilter: 'blur(8px)',
                    }}>
                      {post.category}
                    </span>
                    <span style={{ position: 'absolute', bottom: 12, right: 16, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                      {post.readTime} min czytania
                    </span>
                  </div>
                  <div style={{ padding: '20px 22px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: t.text, margin: '0 0 10px', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
                      {post.title}
                    </h2>
                    <p style={{ fontSize: 16, color: t.textSub, lineHeight: 1.6, margin: '0 0 16px', flex: 1 }}>
                      {post.excerpt}
                    </p>
                    <div style={{ fontSize: 13, color: t.textMuted, fontWeight: 500 }}>
                      {new Date(post.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* Posts: List view */}
        {view === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 80 }}>
            {filtered.map(post => {
              const expanded = expandedSlug === post.slug
              return (
                <div key={post.slug} style={{
                  borderRadius: 14, border: `1px solid ${t.border}`,
                  background: t.cardBg, overflow: 'hidden',
                  boxShadow: dark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all .15s',
                }}>
                  {/* Row header */}
                  <div
                    onClick={() => setExpandedSlug(expanded ? null : post.slug)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '16px 22px', cursor: 'pointer',
                    }}
                  >
                    {/* Category dot */}
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                      background: CAT_COLORS[post.category],
                    }} />
                    {/* Title + meta */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 17, fontWeight: 700, color: t.text, lineHeight: 1.4 }}>
                        {post.title}
                      </div>
                    </div>
                    {/* Right side info */}
                    <span style={{ fontSize: 13, color: t.textMuted, flexShrink: 0, whiteSpace: 'nowrap' }}>
                      {post.readTime} min
                    </span>
                    <span style={{ fontSize: 12, color: t.textMuted, flexShrink: 0, whiteSpace: 'nowrap' }}>
                      {new Date(post.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                    </span>
                    {/* Chevron */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2"
                      style={{ flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                  {/* Expanded content */}
                  {expanded && (
                    <div style={{ padding: '0 22px 18px 48px', borderTop: `1px solid ${t.border}` }}>
                      <p style={{ fontSize: 15, color: t.textSub, lineHeight: 1.65, marginTop: 16, marginBottom: 16 }}>
                        {post.excerpt}
                      </p>
                      <Link href={`/blog/${post.slug}`} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 14, fontWeight: 700, color: '#16a34a', textDecoration: 'none',
                      }}>
                        Czytaj dalej
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
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
          <h3 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 14, color: t.text }}>
            Newsletter XTOOLS.PL
          </h3>
          <p style={{ fontSize: 19, color: t.textSub, marginBottom: 32, maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Co tydzień: nowe narzędzia AI, case studies kampanii i porady dla marketerów. Zero spamu.
          </p>
          {subscribed ? (
            <div style={{ fontSize: 19, color: '#16a34a', fontWeight: 700 }}>Zapisano! Sprawdź skrzynkę email.</div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); if (email) setSubscribed(true) }}
              style={{ display: 'flex', gap: 12, maxWidth: 420, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input type="email" required placeholder="twoj@email.com" value={email} onChange={e => setEmail(e.target.value)}
                style={{
                  flex: 1, minWidth: 220, padding: '13px 18px',
                  borderRadius: 10, border: `1.5px solid ${t.inputBorder}`,
                  background: t.inputBg, color: t.inputColor,
                  fontSize: 18, outline: 'none', fontFamily: 'inherit',
                }}
              />
              <button type="submit" style={{
                padding: '13px 24px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#fff', fontSize: 18, fontWeight: 800, cursor: 'pointer',
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
