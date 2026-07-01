'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  dark: boolean
  onToggle: () => void
}

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

export function BlogNav({ dark, onToggle }: Props) {
  const pathname = usePathname()

  const t = dark ? {
    bg: 'rgba(7,7,11,0.96)',
    border: 'rgba(255,255,255,0.08)',
    logo: '#fff',
    link: 'rgba(255,255,255,0.55)',
    linkHover: '#fff',
    loginBorder: 'rgba(255,255,255,0.15)',
    loginColor: 'rgba(255,255,255,0.65)',
    toggleBorder: 'rgba(255,255,255,0.12)',
    toggleColor: 'rgba(255,255,255,0.5)',
  } : {
    bg: 'rgba(255,255,255,0.96)',
    border: 'rgba(0,0,0,0.08)',
    logo: '#0f0f12',
    link: 'rgba(0,0,0,0.45)',
    linkHover: '#0f0f12',
    loginBorder: 'rgba(0,0,0,0.12)',
    loginColor: 'rgba(0,0,0,0.55)',
    toggleBorder: 'rgba(0,0,0,0.1)',
    toggleColor: 'rgba(0,0,0,0.45)',
  }

  const navLinks = [
    { label: 'Creator', href: '/creator' },
    { label: 'Composer', href: '/composer' },
    { label: 'Blog', href: '/blog' },
  ]

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: t.bg,
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      borderBottom: `1px solid ${t.border}`,
      padding: '0 32px',
      height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: 'system-ui, sans-serif',
      transition: 'background .2s',
    }}>
      {/* Logo */}
      <Link href="/" style={{
        textDecoration: 'none',
        fontSize: 18, fontWeight: 900,
        color: t.logo, letterSpacing: '-0.02em',
        flexShrink: 0,
      }}>
        XTOOLS<span style={{ color: '#16a34a' }}>.PL</span>
      </Link>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>

        {/* Nav links */}
        {navLinks.map(({ label, href }) => {
          const active = pathname === href || (href === '/blog' && pathname.startsWith('/blog'))
          return (
            <Link key={label} href={href} style={{
              padding: '0 14px', height: 36,
              display: 'flex', alignItems: 'center',
              textDecoration: 'none',
              fontSize: 13, fontWeight: 700,
              color: active ? '#16a34a' : t.link,
              borderRadius: 18,
              transition: 'color .15s',
            }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = t.linkHover }}
            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = t.link }}
            >
              {label}
            </Link>
          )
        })}

        <div style={{ width: 1, height: 20, background: t.border, margin: '0 6px' }} />

        {/* Zaloguj się */}
        <a href="/logowanie" style={{
          height: 36, borderRadius: 18, padding: '0 16px',
          border: `1.5px solid ${t.loginBorder}`,
          background: 'transparent',
          display: 'flex', alignItems: 'center',
          fontSize: 13, fontWeight: 700,
          color: t.loginColor, textDecoration: 'none',
          transition: 'all .15s',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.color = t.logo
          el.style.borderColor = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.color = t.loginColor
          el.style.borderColor = t.loginBorder
        }}
        >
          Zaloguj się
        </a>

        {/* Zarejestruj się */}
        <a href="/rejestracja" style={{
          height: 36, borderRadius: 18, padding: '0 18px',
          border: 'none',
          background: 'linear-gradient(135deg, #16a34a, #15803d)',
          display: 'flex', alignItems: 'center',
          fontSize: 13, fontWeight: 800, color: '#fff',
          textDecoration: 'none',
          boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
          transition: 'all .15s',
          marginLeft: 4,
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = 'translateY(-1px)'
          el.style.boxShadow = '0 8px 20px rgba(22,163,74,0.5)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = 'translateY(0)'
          el.style.boxShadow = '0 4px 14px rgba(22,163,74,0.35)'
        }}
        >
          Zarejestruj się
        </a>

        {/* Dark/light toggle */}
        <button onClick={onToggle} style={{
          width: 36, height: 36, borderRadius: '50%',
          border: `1.5px solid ${t.toggleBorder}`,
          background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: t.toggleColor, marginLeft: 4,
          transition: 'all .15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = t.logo }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = t.toggleColor }}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </nav>
  )
}
