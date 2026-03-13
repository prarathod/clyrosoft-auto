export type ThemeKey = 'classic' | 'modern' | 'minimal'
export type HeroLayout = 'centered' | 'split' | 'minimal'

export interface Theme {
  key: ThemeKey
  label: string
  heroLayout: HeroLayout
  // CSS variable values — applied to the root wrapper
  vars: {
    primary: string
    bg: string
    text: string
    textMuted: string
    cardBg: string
    cardBorder: string
    sectionAlt: string
    footerBg: string
    footerText: string
    fontHeading: string
    fontBody: string
    radius: string
    heroBg: string       // supports solid color OR gradient
    heroText: string
    heroSubtext: string
    heroAccent: string   // badge / highlight color on hero
  }
}

export const themes: Record<ThemeKey, Theme> = {
  classic: {
    key: 'classic',
    label: 'Classic',
    heroLayout: 'centered',
    vars: {
      primary: '#2563EB',
      bg: '#FFFFFF',
      text: '#111827',
      textMuted: '#6B7280',
      cardBg: '#FFFFFF',
      cardBorder: '#E5E7EB',
      sectionAlt: '#F9FAFB',
      footerBg: '#111827',
      footerText: '#9CA3AF',
      fontHeading: "'Playfair Display', Georgia, 'Times New Roman', serif",
      fontBody: "'Inter', system-ui, -apple-system, sans-serif",
      radius: '0.75rem',
      heroBg: '#2563EB',
      heroText: '#FFFFFF',
      heroSubtext: 'rgba(255,255,255,0.80)',
      heroAccent: 'rgba(255,255,255,0.18)',
    },
  },

  modern: {
    key: 'modern',
    label: 'Modern',
    heroLayout: 'split',
    vars: {
      primary: '#8B5CF6',
      bg: '#0A0A0A',
      text: '#F9FAFB',
      textMuted: '#9CA3AF',
      cardBg: '#161616',
      cardBorder: '#2A2A2A',
      sectionAlt: '#111111',
      footerBg: '#000000',
      footerText: '#6B7280',
      fontHeading: "'Inter', system-ui, sans-serif",
      fontBody: "'Inter', system-ui, sans-serif",
      radius: '1rem',
      heroBg: 'linear-gradient(135deg, #1E1B4B 0%, #4C1D95 50%, #7C3AED 100%)',
      heroText: '#FFFFFF',
      heroSubtext: 'rgba(255,255,255,0.70)',
      heroAccent: 'rgba(139,92,246,0.25)',
    },
  },

  minimal: {
    key: 'minimal',
    label: 'Minimal',
    heroLayout: 'minimal',
    vars: {
      primary: '#18181B',
      bg: '#FAFAFA',
      text: '#09090B',
      textMuted: '#71717A',
      cardBg: '#FFFFFF',
      cardBorder: '#E4E4E7',
      sectionAlt: '#F4F4F5',
      footerBg: '#09090B',
      footerText: '#71717A',
      fontHeading: "'Inter', system-ui, sans-serif",
      fontBody: "'Inter', system-ui, sans-serif",
      radius: '0.25rem',
      heroBg: '#FAFAFA',
      heroText: '#09090B',
      heroSubtext: '#71717A',
      heroAccent: '#E4E4E7',
    },
  },
}

export function getTheme(key?: string): Theme {
  if (key && key in themes) return themes[key as ThemeKey]
  return themes.classic
}

/** Converts a Theme into a flat CSS variable object for use in style={{ }} */
export function themeToVars(theme: Theme): React.CSSProperties {
  return {
    '--primary': theme.vars.primary,
    '--bg': theme.vars.bg,
    '--text': theme.vars.text,
    '--text-muted': theme.vars.textMuted,
    '--card-bg': theme.vars.cardBg,
    '--card-border': theme.vars.cardBorder,
    '--section-alt': theme.vars.sectionAlt,
    '--footer-bg': theme.vars.footerBg,
    '--footer-text': theme.vars.footerText,
    '--font-heading': theme.vars.fontHeading,
    '--font-body': theme.vars.fontBody,
    '--radius': theme.vars.radius,
    '--hero-bg': theme.vars.heroBg,
    '--hero-text': theme.vars.heroText,
    '--hero-subtext': theme.vars.heroSubtext,
    '--hero-accent': theme.vars.heroAccent,
    backgroundColor: theme.vars.bg,
    color: theme.vars.text,
    fontFamily: theme.vars.fontBody,
  } as React.CSSProperties
}
