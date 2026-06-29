'use client'

import { useEffect, useState } from 'react'

export default function Header() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('metapeek-theme')
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
      setDark(true)
    }
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('metapeek-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('metapeek-theme', 'light')
    }
  }

  return (
    <header
      className="flex items-center gap-3 px-6 py-4"
      style={{ background: 'var(--surface-1)', borderBottom: '0.5px solid var(--border)' }}
    >
      {/* Logo */}
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="9" fill="#2563eb" />
        <circle cx="18" cy="16" r="6.5" stroke="white" strokeWidth="2" />
        <circle cx="18" cy="16" r="2.5" fill="white" />
        <line x1="22.5" y1="20.5" x2="27" y2="25" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M9 28 Q18 23 27 28" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.55" />
      </svg>

      <div className="flex-1">
        <div className="font-semibold text-base tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          MetaPeek
        </div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          See what your files are hiding
        </div>
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={toggleTheme}
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border-strong)',
          borderRadius: 8,
          padding: '6px 10px',
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
          transition: 'background 0.2s',
        }}
      >
        {dark ? '☀️' : '🌙'}
      </button>
    </header>
  )
}
