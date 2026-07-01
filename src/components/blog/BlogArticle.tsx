'use client'
import '@/app/blog/blog.css'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { BLOG_POSTS, type BlogCategory } from '@/lib/blogPosts'
import { BlogNav } from './BlogNav'
import { BlogScrollFix } from './BlogScrollFix'
import { useBlogTheme } from './useBlogTheme'

const CAT_COLORS: Record<BlogCategory, string> = {
  'AI i kreacje': '#16a34a',
  'Kampanie reklamowe': '#2563eb',
  'Social Media': '#7c3aed',
  'Agencje i freelancerzy': '#ea580c',
  'E-commerce': '#0891b2',
}

const CAT_GRADIENTS: Record<BlogCategory, string> = {
  'AI i kreacje': 'linear-gradient(135deg, #16a34a 0%, #0d9488 100%)',
  'Kampanie reklamowe': 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
  'Social Media': 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
  'Agencje i freelancerzy': 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
  'E-commerce': 'linear-gradient(135deg, #0891b2 0%, #0284c7 100%)',
}

type Post = typeof BLOG_POSTS[number]

interface Props {
  post: Post
  related: Post[]
  prev: Post | null
  next: Post | null
}

export function BlogArticle({ post, related, prev, next }: Props) {
  const { dark, toggle, mounted } = useBlogTheme()
  const [progress, setProgress] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrollTop = window.scrollY
      const docHeight = el.scrollHeight - el.clientHeight
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const t = dark ? {
    bg: '#07070b', text: '#fff', textSub: 'rgba(255,255,255,0.6)',
    textMuted: 'rgba(255,255,255,0.38)', border: 'rgba(255,255,255,0.08)',
    cardBg: 'rgba(255,255,255,0.04)', cardBgHover: 'rgba(255,255,255,0.07)',
    cardBorderHover: 'rgba(255,255,255,0.16)', metaDivider: 'rgba(255,255,255,0.08)',
    ctaBg: 'rgba(22,163,74,0.1)', ctaBorder: 'rgba(22,163,74,0.18)',
    navArrowBg: 'rgba(255,255,255,0.06)', navArrowBorder: 'rgba(255,255,255,0.1)',
  } : {
    bg: '#f4f5f7', text: '#0f0f12', textSub: 'rgba(0,0,0,0.58)',
    textMuted: 'rgba(0,0,0,0.38)', border: 'rgba(0,0,0,0.07)',
    cardBg: '#fff', cardBgHover: '#f8f9fc',
    cardBorderHover: 'rgba(0,0,0,0.14)', metaDivider: 'rgba(0,0,0,0.08)',
    ctaBg: 'rgba(22,163,74,0.07)', ctaBorder: 'rgba(22,163,74,0.18)',
    navArrowBg: '#fff', navArrowBorder: 'rgba(0,0,0,0.08)',
  }

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'XTOOLS.PL' },
    publisher: { '@type': 'Organization', name: 'XTOOLS.PL', logo: { '@type': 'ImageObject', url: 'https://xtools.pl/logo.png' } },
    mainEntityOfPage: `https://xtools.pl/blog/${post.slug}`,
  }

  if (!mounted) return null

  const coverImg = (post as Post & { cover?: string }).cover

  return (
    <div className={dark ? 'blog-dark' : 'blog-light'} style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: 'system-ui, sans-serif', transition: 'background .2s, color .2s' }}>
      <BlogScrollFix />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }} />

      {/* Reading progress bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, zIndex: 300,
        height: 3,
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #16a34a, #4ade80)',
        transition: 'width .1s linear',
        pointerEvents: 'none',
      }} />

      <BlogNav dark={dark} onToggle={toggle} />

      {/* Cover photo */}
      <div style={{
        width: '100%', height: 500,
        background: CAT_GRADIENTS[post.category],
        position: 'relative', overflow: 'hidden',
      }}>
        {coverImg && (
          <img
            src={coverImg}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        {/* Dark overlay — stronger gradient at bottom for text */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.7) 100%)',
        }} />

        {/* Cover text */}
        <div style={{
          position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 900, padding: '0 32px', boxSizing: 'border-box',
        }}>
          <span style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: 20,
            fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
            background: 'rgba(255,255,255,0.2)', color: '#fff',
            backdropFilter: 'blur(8px)', marginBottom: 14,
          }}>
            {post.category}
          </span>
          <h1 style={{
            fontSize: 'clamp(24px, 3.8vw, 44px)', fontWeight: 900,
            letterSpacing: '-0.02em', lineHeight: 1.2,
            color: '#fff', margin: 0,
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          }}>
            {post.title}
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 14, color: t.textMuted, marginBottom: 28, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/blog" style={{ color: t.textMuted, textDecoration: 'none' }}>Blog</Link>
          <span>/</span>
          <span style={{ color: CAT_COLORS[post.category] }}>{post.category}</span>
        </div>

        {/* Excerpt */}
        <p style={{ fontSize: 24, color: t.textSub, lineHeight: 1.65, marginBottom: 36 }}>
          {post.excerpt}
        </p>

        {/* Meta row */}
        <div style={{
          display: 'flex', gap: 20, alignItems: 'center',
          paddingBottom: 28, borderBottom: `1px solid ${t.metaDivider}`,
          marginBottom: 48, fontSize: 17, color: t.textMuted, flexWrap: 'wrap',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {new Date(post.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span>·</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#16a34a' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {post.readTime} min czytania
          </span>
          <span>·</span>
          <span>XTOOLS.PL</span>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="blog-content"
          style={{ fontSize: 21, lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA box */}
        <div style={{
          marginTop: 64, padding: '40px 44px', borderRadius: 20,
          background: t.ctaBg, border: `1px solid ${t.ctaBorder}`,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 14, color: '#16a34a', fontWeight: 700, marginBottom: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Przetestuj XTOOLS.PL
          </p>
          <h3 style={{ fontSize: 29, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 16, color: t.text }}>
            Twórz banery reklamowe z AI w minuty
          </h3>
          <p style={{ fontSize: 19, color: t.textSub, marginBottom: 30, lineHeight: 1.6 }}>
            Dołącz do marketerów, którzy oszczędzają godziny na produkcji kreacji.
          </p>
          <Link href="/rejestracja" style={{
            display: 'inline-block', padding: '15px 36px', borderRadius: 50,
            textDecoration: 'none',
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            color: '#fff', fontSize: 20, fontWeight: 800,
            boxShadow: '0 6px 20px rgba(22,163,74,0.35)',
          }}>
            Zarejestruj się za darmo →
          </Link>
        </div>

        {/* Prev / Next navigation */}
        {(prev || next) && (
          <div style={{
            marginTop: 48, display: 'grid',
            gridTemplateColumns: prev && next ? '1fr 1fr' : '1fr',
            gap: 16,
          }}>
            {prev && (
              <Link href={`/blog/${prev.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '20px 24px', borderRadius: 16,
                  border: `1px solid ${t.navArrowBorder}`,
                  background: t.navArrowBg, transition: 'all .15s',
                  boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.05)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = t.cardBorderHover
                  el.style.transform = 'translateX(-4px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = t.navArrowBorder
                  el.style.transform = 'translateX(0)'
                }}
                >
                  <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                    Poprzedni artykuł
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: t.text, lineHeight: 1.4 }}>{prev.title}</div>
                </div>
              </Link>
            )}
            {next && (
              <Link href={`/blog/${next.slug}`} style={{ textDecoration: 'none', gridColumn: !prev ? '1' : undefined }}>
                <div style={{
                  padding: '20px 24px', borderRadius: 16,
                  border: `1px solid ${t.navArrowBorder}`,
                  background: t.navArrowBg, transition: 'all .15s',
                  textAlign: 'right',
                  boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.05)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = t.cardBorderHover
                  el.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = t.navArrowBorder
                  el.style.transform = 'translateX(0)'
                }}
                >
                  <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                    Następny artykuł
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: t.text, lineHeight: 1.4 }}>{next.title}</div>
                </div>
              </Link>
            )}
          </div>
        )}

        {/* Related — 3 large tiles */}
        {related.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 26, letterSpacing: '-0.01em', color: t.text }}>
              Powiązane artykuły
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(related.length, 3)}, 1fr)`,
              gap: 20,
            }}>
              {related.slice(0, 3).map(r => {
                const rCover = (r as Post & { cover?: string }).cover
                return (
                  <Link key={r.slug} href={`/blog/${r.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      borderRadius: 16, overflow: 'hidden',
                      border: `1px solid ${t.border}`,
                      background: t.cardBg, transition: 'all .2s',
                      boxShadow: dark ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = t.cardBorderHover
                      el.style.transform = 'translateY(-4px)'
                      el.style.boxShadow = dark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = t.border
                      el.style.transform = 'translateY(0)'
                      el.style.boxShadow = dark ? 'none' : '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                    >
                      {/* Tile cover */}
                      <div style={{
                        height: 180, width: '100%',
                        background: rCover ? `url(${rCover}) center/cover no-repeat` : CAT_GRADIENTS[r.category],
                        position: 'relative',
                      }}>
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: rCover ? 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.3) 100%)' : 'none',
                        }} />
                      </div>
                      {/* Tile body */}
                      <div style={{ padding: '18px 20px 22px' }}>
                        <span style={{
                          display: 'inline-block', fontSize: 13, fontWeight: 700,
                          color: CAT_COLORS[r.category], marginBottom: 8,
                          letterSpacing: '0.03em', textTransform: 'uppercase',
                        }}>
                          {r.category}
                        </span>
                        <div style={{
                          fontSize: 17, fontWeight: 700, color: t.text,
                          lineHeight: 1.4, marginBottom: 10,
                          display: '-webkit-box', WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {r.title}
                        </div>
                        <div style={{ fontSize: 14, color: t.textMuted }}>
                          {r.readTime} min czytania
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
