'use client'

import { useState } from 'react'
import { themes, type ThemeKey } from '@/styles/themes'
import { useTheme } from './ThemeProvider'

const THEME_META: Record<ThemeKey, { label: string; swatch: string; desc: string }> = {
  classic: { label: 'Classic', swatch: '#2563EB', desc: 'Traditional · Blue · Serif' },
  modern:  { label: 'Modern',  swatch: '#8B5CF6', desc: 'Dark · Gradient · Bold'     },
  minimal: { label: 'Minimal', swatch: '#18181B', desc: 'Clean · White · Minimal'    },
}

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const current = theme.key
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col-reverse items-start gap-2">
      {open && (
        <div
          className="mb-2 rounded-2xl shadow-2xl border overflow-hidden w-52"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <div
            className="px-4 py-2.5 border-b text-xs font-semibold uppercase tracking-wider"
            style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}
          >
            Theme
          </div>
          {(Object.keys(themes) as ThemeKey[]).map((key) => {
            const meta = THEME_META[key]
            const isActive = current === key
            return (
              <button
                key={key}
                onClick={() => { setTheme(key); setOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:opacity-80"
                style={{
                  backgroundColor: isActive ? 'var(--section-alt)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                }}
              >
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: meta.swatch }}
                />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    {meta.label}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {meta.desc}
                  </p>
                </div>
                {isActive && (
                  <svg
                    className="ml-auto w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--primary)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full shadow-lg border text-sm font-semibold transition-all hover:scale-105 active:scale-95"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          color: 'var(--text)',
        }}
        title="Change theme"
      >
        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: THEME_META[current].swatch }} />
        <span>Theme</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: 'var(--text-muted)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  )
}
