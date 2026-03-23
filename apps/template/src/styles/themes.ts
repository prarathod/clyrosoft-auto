export type ThemeKey = 'classic' | 'modern' | 'minimal' | 'vitality' | 'elegant' | 'warm' | 'prestige' | 'pulse'
export type HeroLayout = 'centered' | 'split' | 'minimal' | 'vitality' | 'elegant' | 'warm' | 'prestige' | 'pulse'

export interface Theme {
  key: ThemeKey
  label: string
  heroLayout: HeroLayout
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
    heroBg: string
    heroText: string
    heroSubtext: string
    heroAccent: string
  }
}

export const themes: Record<ThemeKey, Theme> = {
  // ── 1: Classic ──────────────────────────────────────────────────────────────
  classic: {
    key: 'classic', label: 'Classic', heroLayout: 'centered',
    vars: {
      primary: '#2563EB', bg: '#FFFFFF', text: '#111827', textMuted: '#6B7280',
      cardBg: '#FFFFFF', cardBorder: '#E5E7EB', sectionAlt: '#F9FAFB',
      footerBg: '#111827', footerText: '#9CA3AF',
      fontHeading: "'Playfair Display', Georgia, 'Times New Roman', serif",
      fontBody: "'Inter', system-ui, -apple-system, sans-serif",
      radius: '0.75rem',
      heroBg: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)',
      heroText: '#FFFFFF', heroSubtext: 'rgba(255,255,255,0.80)', heroAccent: 'rgba(255,255,255,0.18)',
    },
  },

  // ── 2: Modern ───────────────────────────────────────────────────────────────
  modern: {
    key: 'modern', label: 'Modern', heroLayout: 'split',
    vars: {
      primary: '#8B5CF6', bg: '#0A0A0A', text: '#F9FAFB', textMuted: '#9CA3AF',
      cardBg: '#161616', cardBorder: '#2A2A2A', sectionAlt: '#111111',
      footerBg: '#000000', footerText: '#6B7280',
      fontHeading: "'Inter', system-ui, sans-serif",
      fontBody: "'Inter', system-ui, sans-serif",
      radius: '1rem',
      heroBg: 'linear-gradient(135deg, #1E1B4B 0%, #4C1D95 50%, #7C3AED 100%)',
      heroText: '#FFFFFF', heroSubtext: 'rgba(255,255,255,0.70)', heroAccent: 'rgba(139,92,246,0.25)',
    },
  },

  // ── 3: Minimal ──────────────────────────────────────────────────────────────
  minimal: {
    key: 'minimal', label: 'Minimal', heroLayout: 'minimal',
    vars: {
      primary: '#18181B', bg: '#FAFAFA', text: '#09090B', textMuted: '#71717A',
      cardBg: '#FFFFFF', cardBorder: '#E4E4E7', sectionAlt: '#F4F4F5',
      footerBg: '#09090B', footerText: '#71717A',
      fontHeading: "'Inter', system-ui, sans-serif",
      fontBody: "'Inter', system-ui, sans-serif",
      radius: '0.25rem',
      heroBg: '#FAFAFA',
      heroText: '#09090B', heroSubtext: '#71717A', heroAccent: '#E4E4E7',
    },
  },

  // ── 4: Vitality ─────────────────────────────────────────────────────────────
  vitality: {
    key: 'vitality', label: 'Vitality', heroLayout: 'vitality',
    vars: {
      primary: '#059669', bg: '#FFFFFF', text: '#111827', textMuted: '#6B7280',
      cardBg: '#FFFFFF', cardBorder: '#D1FAE5', sectionAlt: '#F0FDF4',
      footerBg: '#064E3B', footerText: '#6EE7B7',
      fontHeading: "'Inter', system-ui, sans-serif",
      fontBody: "'Inter', system-ui, sans-serif",
      radius: '0.875rem',
      heroBg: '#FFFFFF',
      heroText: '#111827', heroSubtext: '#6B7280', heroAccent: '#D1FAE5',
    },
  },

  // ── 5: Elegant ──────────────────────────────────────────────────────────────
  elegant: {
    key: 'elegant', label: 'Elegant', heroLayout: 'elegant',
    vars: {
      primary: '#B45309', bg: '#FFFBF5', text: '#1C1917', textMuted: '#78716C',
      cardBg: '#FFFFFF', cardBorder: '#E7E5E4', sectionAlt: '#FEF3C7',
      footerBg: '#1C1917', footerText: '#A8A29E',
      fontHeading: "'Playfair Display', Georgia, serif",
      fontBody: "'Inter', system-ui, sans-serif",
      radius: '0.5rem',
      heroBg: 'linear-gradient(160deg, #0F172A 0%, #1E293B 50%, #0F2044 100%)',
      heroText: '#FEF3C7', heroSubtext: 'rgba(254,243,199,0.70)', heroAccent: 'rgba(180,83,9,0.40)',
    },
  },

  // ── 6: Warm ─────────────────────────────────────────────────────────────────
  warm: {
    key: 'warm', label: 'Warm', heroLayout: 'warm',
    vars: {
      primary: '#E11D48', bg: '#FFFFFF', text: '#1F2937', textMuted: '#6B7280',
      cardBg: '#FFFFFF', cardBorder: '#FCE7F3', sectionAlt: '#FFF1F2',
      footerBg: '#881337', footerText: '#FECDD3',
      fontHeading: "'Inter', system-ui, sans-serif",
      fontBody: "'Inter', system-ui, sans-serif",
      radius: '9999px',
      heroBg: 'linear-gradient(135deg, #FF6B6B 0%, #E11D48 40%, #9F1239 100%)',
      heroText: '#FFFFFF', heroSubtext: 'rgba(255,255,255,0.85)', heroAccent: 'rgba(255,255,255,0.20)',
    },
  },

  // ── 7: Prestige ─────────────────────────────────────────────────────────────
  // Dark charcoal + silver/platinum — ultra-luxury, high-end specialist clinics
  prestige: {
    key: 'prestige', label: 'Prestige', heroLayout: 'prestige',
    vars: {
      primary: '#A8A29E',         // warm platinum/silver
      bg: '#0C0C0C',
      text: '#F5F5F4',
      textMuted: '#78716C',
      cardBg: '#161412',
      cardBorder: '#292524',
      sectionAlt: '#111110',
      footerBg: '#050505',
      footerText: '#57534E',
      fontHeading: "'Playfair Display', Georgia, serif",
      fontBody: "'Inter', system-ui, sans-serif",
      radius: '0',                // sharp corners for premium feel
      heroBg: 'linear-gradient(160deg, #080808 0%, #131211 50%, #0A0A09 100%)',
      heroText: '#F5F5F4',
      heroSubtext: 'rgba(245,245,244,0.55)',
      heroAccent: 'rgba(168,162,158,0.08)',
    },
  },

  // ── 8: Pulse ────────────────────────────────────────────────────────────────
  // Clean white + vivid sky-blue — modern medical-tech, hospitals, diagnostics
  pulse: {
    key: 'pulse', label: 'Pulse', heroLayout: 'pulse',
    vars: {
      primary: '#0EA5E9',         // sky blue
      bg: '#FFFFFF',
      text: '#0F172A',
      textMuted: '#64748B',
      cardBg: '#FFFFFF',
      cardBorder: '#E0F2FE',
      sectionAlt: '#F0F9FF',
      footerBg: '#0C1A2E',
      footerText: '#475569',
      fontHeading: "'Inter', system-ui, sans-serif",
      fontBody: "'Inter', system-ui, sans-serif",
      radius: '0.625rem',
      heroBg: 'linear-gradient(140deg, #0EA5E9 0%, #0284C7 55%, #075985 100%)',
      heroText: '#FFFFFF',
      heroSubtext: 'rgba(255,255,255,0.78)',
      heroAccent: 'rgba(255,255,255,0.15)',
    },
  },
}

export function getTheme(key?: string): Theme {
  if (key && key in themes) return themes[key as ThemeKey]
  return themes.classic
}

export function themeToVars(theme: Theme): React.CSSProperties {
  return {
    '--primary':      theme.vars.primary,
    '--bg':           theme.vars.bg,
    '--text':         theme.vars.text,
    '--text-muted':   theme.vars.textMuted,
    '--card-bg':      theme.vars.cardBg,
    '--card-border':  theme.vars.cardBorder,
    '--section-alt':  theme.vars.sectionAlt,
    '--footer-bg':    theme.vars.footerBg,
    '--footer-text':  theme.vars.footerText,
    '--font-heading': theme.vars.fontHeading,
    '--font-body':    theme.vars.fontBody,
    '--radius':       theme.vars.radius,
    '--hero-bg':      theme.vars.heroBg,
    '--hero-text':    theme.vars.heroText,
    '--hero-subtext': theme.vars.heroSubtext,
    '--hero-accent':  theme.vars.heroAccent,
    backgroundColor:  theme.vars.bg,
    color:            theme.vars.text,
    fontFamily:       theme.vars.fontBody,
  } as React.CSSProperties
}
