'use client'

type Tab = 'viewer' | 'editor' | 'about'

interface TabBarProps {
  active: Tab
  onChange: (t: Tab) => void
}

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'viewer', label: 'Viewer',     icon: '🔍' },
  { key: 'editor', label: 'Editor',     icon: '✏️' },
  { key: 'about',  label: 'How it works', icon: 'ℹ️' },
]

export default function TabBar({ active, onChange }: TabBarProps) {
  return (
    <div
      className="flex gap-1 px-6"
      style={{ background: 'var(--surface-1)', borderBottom: '0.5px solid var(--border)' }}
    >
      {TABS.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors"
          style={{
            color: active === t.key ? 'var(--accent-text)' : 'var(--text-secondary)',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: active === t.key ? '2px solid #2563eb' : '2px solid transparent',
            marginBottom: '-1px',
            background: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <span style={{ fontSize: 14 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  )
}
