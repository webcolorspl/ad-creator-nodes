'use client'
import '@/app/blog/blog.css'
import Link from 'next/link'
import { BLOG_POSTS, type BlogCategory } from '@/lib/blogPosts'

const CAT_COLORS: Record<BlogCategory, string> = {
  'AI i kreacje': '#16a34a',
  'Kampanie reklamowe': '#2563eb',
  'Social Media': '#7c3aed',
  'Agencje i freelancerzy': '#ea580c',
  'E-commerce': '#0891b2',
}

type Post = typeof BLOG_POSTS[number]

interface Props {
  post: Post
  related: Post[]
}

export function BlogArticle({ post, related }: Props) {
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'XTOOLS.PL' },
    publisher: {
      '@type': 'Organization',
      name: 'XTOOLS.PL',
      logo: { '@type': 'ImageObject', url: 'https://xtools.pl/logo.png' },
    },
    mainEntityOfPage: `https://xtools.pl/blog/${post.slug}`,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07070b', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
          XTOOLS<span style={{ color: '#16a34a' }}>.PL</span>
        </Link>
        <Link href="/blog" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
          ← Blog
        </Link>
      </div>

      <div style={{ maxWidth: 740, margin: '0 auto', padding: '64px 32px' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 32, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/blog" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Blog</Link>
          <span>/</span>
          <span style={{ color: CAT_COLORS[post.category] }}>{post.category}</span>
        </div>

        {/* Category + meta */}
        <div style={{ marginBottom: 20 }}>
          <span style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: 20,
            fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
            background: CAT_COLORS[post.category] + '1a',
            color: CAT_COLORS[post.category],
            border: `1px solid ${CAT_COLORS[post.category]}33`,
          }}>
            {post.category}
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 20 }}>
          {post.title}
        </h1>

        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 32 }}>
          {post.excerpt}
        </p>

        <div style={{ display: 'flex', gap: 24, paddingBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 48, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
          <span>{new Date(post.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span>·</span>
          <span>{post.readTime} min czytania</span>
          <span>·</span>
          <span>XTOOLS.PL</span>
        </div>

        {/* Content */}
        <div
          className="blog-content"
          style={{ lineHeight: 1.75, fontSize: 16, color: 'rgba(255,255,255,0.82)' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA box */}
        <div style={{
          marginTop: 56, padding: '36px 40px', borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(22,163,74,0.12), rgba(16,185,129,0.06))',
          border: '1px solid rgba(22,163,74,0.2)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 14, color: '#4ade80', fontWeight: 700, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Przetestuj XTOOLS.PL</p>
          <h3 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>
            Twórz banery reklamowe z AI w minuty
          </h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>
            Dołącz do marketerów, którzy oszczędzają godziny na produkcji kreacji.
          </p>
          <Link href="/rejestracja" style={{
            display: 'inline-block', padding: '14px 32px',
            borderRadius: 50, textDecoration: 'none',
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            color: '#fff', fontSize: 15, fontWeight: 800,
            boxShadow: '0 6px 20px rgba(22,163,74,0.35)',
          }}>
            Zarejestruj się za darmo →
          </Link>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, letterSpacing: '-0.01em' }}>
              Powiązane artykuły
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {related.map(r => (
                <Link key={r.slug} href={`/blog/${r.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '20px 24px', borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.04)',
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.border = '1px solid rgba(255,255,255,0.16)'
                    el.style.background = 'rgba(255,255,255,0.07)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.border = '1px solid rgba(255,255,255,0.08)'
                    el.style.background = 'rgba(255,255,255,0.04)'
                  }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{r.title}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{r.readTime} min czytania</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
