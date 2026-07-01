'use client'
import { useState, useEffect } from 'react'

export function useBlogTheme() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('blog-theme')
    if (saved === 'dark') setDark(true)
    setMounted(true)
  }, [])

  const toggle = () => {
    setDark(d => {
      const next = !d
      localStorage.setItem('blog-theme', next ? 'dark' : 'light')
      return next
    })
  }

  return { dark, toggle, mounted }
}
