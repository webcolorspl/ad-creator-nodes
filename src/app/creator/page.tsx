'use client'

export default function CreatorPage() {
  return (
    <iframe
      src="https://ad-generator-webcolors.vercel.app/ad-generator"
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        border: 'none',
      }}
      allow="fullscreen"
    />
  )
}
