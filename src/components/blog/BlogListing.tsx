'use client'
import { useState } from 'react'
import Link from 'next/link'
import { BLOG_POSTS, type BlogCategory } from '@/lib/blogPosts'

const CATEGORIES: BlogCategory[] = [
  'AI i kreacje',
  'Kampanie reklamowe',
  'Social Media',
  'Agencje i freelancerzy',
  'E-commerce',
]

const CAT_COLORS: Record<BlogCategory, string> = {
  'AI i kreacje': '#16a34a',
  'Kampanie reklamowe': '#2563eb',
  'Social Media': '#7c3aed',
  'Agencje i freelancerzy': '#ea580c',
  'E-commerce': '#0891b2',
}

function CategoryBadge({ category }: { category: BlogCategory }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.04em',
      background: CAT_COLORS[category] + '1a',
      color: CAT_COLORS[category],
      border: `1px solid ${CAT_COLORS[category]}33`,
    }}>
      {category}
    </span>
  )
}

export function BlogListing() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<BlogCategory | null>(null)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const filtered = BLOG_POSTS.filter(p => {
    const matchCat = !activeCategory || p.category === activeCategory
    const q = search.toLowerCase()
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  return (
    <div style={{ minHeight: '100vh', background: '#07070b', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
          XTOOLS<span style={{ color: '#16a34a' }}>.PL</span>
        </Link>
        <Link href="/blog" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Blog</Link>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 32px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.1 }}>
            Blog <span style={{ color: '#16a34a' }}>XTOOLS.PL</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', maxWidth: 560, margin: '0 auto 40px' }}>
            Praktyczna wiedza o tworzeniu reklam z AI, kampaniach i marketingu cyfrowym
          </p>
          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
            <input
              type="text"
              placeholder="Szukaj artykułów..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '14px 20px 14px 44px',
                borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.05)', color: '#fff',
                fontSize: 15, outline: 'none', boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
            <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 48, justifyContent: 'center' }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              padding: '8px 18px', borderRadius: 20, border: '1.5px solid',
              borderColor: !activeCategory ? '#16a34a' : 'rgba(255,255,255,0.12)',
              background: !activeCategory ? 'rgba(22,163,74,0.15)' : 'transparent',
              color: !activeCategory ? '#4ade80' : 'rgba(255,255,255,0.5)',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Wszystkie ({BLOG_POSTS.length})
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              style={{
                padding: '8px 18px', borderRadius: 20, border: '1.5px solid',
                borderColor: activeCategory === cat ? CAT_COLORS[cat] : 'rgba(255,255,255,0.12)',
                background: activeCategory === cat ? CAT_COLORS[cat] + '22' : 'transparent',
                color: activeCategory === cat ? CAT_COLORS[cat] : 'rgba(255,255,255,0.5)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {cat} ({BLOG_POSTS.filter(p => p.category === cat).length})
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 24,
          marginBottom: 80,
        }}>
          {filtered.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              <article style={{
                padding: '28px 28px 24px',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                transition: 'all .2s',
                cursor: 'pointer',
                height: '100%',
                boxSizing: 'border-box',
                display: 'flex', flexDirection: 'column',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.border = '1px solid rgba(255,255,255,0.18)'
                el.style.background = 'rgba(255,255,255,0.07)'
                el.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.border = '1px solid rgba(255,255,255,0.08)'
                el.style.background = 'rgba(255,255,255,0.04)'
                el.style.transform = 'translateY(0)'
              }}
              >
                <div style={{ marginBottom: 14 }}>
                  <CategoryBadge category={post.category} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 10px', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
                  {post.title}
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '0 0 20px', flex: 1 }}>
                  {post.excerpt}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                    {new Date(post.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                    {post.readTime} min czytania
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 16 }}>Brak artykułów dla podanego wyszukiwania</p>
          </div>
        )}

        {/* Newsletter */}
        <div style={{
          borderRadius: 24, padding: '56px 48px',
          background: 'linear-gradient(135deg, rgba(22,163,74,0.12), rgba(16,185,129,0.06))',
          border: '1px solid rgba(22,163,74,0.2)',
          textAlign: 'center',
        }}>
          <h3 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>
            Newsletter XTOOLS.PL
          </h3>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
            Co tydzień: nowe narzędzia AI, case studies kampanii i porady dla marketerów. Zero spamu.
          </p>
          {subscribed ? (
            <div style={{ fontSize: 16, color: '#4ade80', fontWeight: 700 }}>
              ✓ Zapisano! Sprawdź skrzynkę email.
            </div>
          ) : (
            <form
              onSubmit={e => { e.preventDefault(); if (email) setSubscribed(true) }}
              style={{ display: 'flex', gap: 12, maxWidth: 420, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}
            >
              <input
                type="email" required placeholder="twoj@email.com"
                value={email} onChange={e => setEmail(e.target.value)}
                style={{
                  flex: 1, minWidth: 220, padding: '13px 18px',
                  borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.06)', color: '#fff',
                  fontSize: 15, outline: 'none', fontFamily: 'inherit',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '13px 24px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: '#fff', fontSize: 15, fontWeight: 800,
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
                }}
              >
                Zapisz się →
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
