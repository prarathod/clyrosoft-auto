'use client'

import { createContext, useContext, useState } from 'react'
import { getTheme, themeToVars, themes, type ThemeKey, type Theme } from '@/styles/themes'

interface ThemeCtx {
  theme: Theme
  setTheme: (key: ThemeKey) => void
}

const ThemeContext = createContext<ThemeCtx | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}

interface Props {
  initialTheme: string
  children: React.ReactNode
}

export default function ThemeProvider({ initialTheme, children }: Props) {
  const [themeKey, setThemeKey] = useState<ThemeKey>(
    (initialTheme in themes ? initialTheme : 'classic') as ThemeKey
  )
  const theme = getTheme(themeKey)

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeKey }}>
      <div style={themeToVars(theme)}>{children}</div>
    </ThemeContext.Provider>
  )
}
