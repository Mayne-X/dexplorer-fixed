// Modern color system for blockchain explorer — crypto-friendly palette
export const colors = {
  // Light mode colors
  light: {
    primary: '#B45309', // Amber-700 — 4.6:1 on white (WCAG AA)
    primaryHover: '#92400E', // Amber-800
    accent: '#7C3AED', // Violet-600 — tech/crypto
    accentHover: '#6D28D9', // Violet-700
    background: '#f8fafc', // Slate-50
    backgroundSecondary: '#f1f5f9', // Slate-100
    backgroundTertiary: '#e2e8f0', // Slate-200
    surface: '#ffffff',
    surfaceHover: '#f8fafc', // Slate-50
    text: {
      primary: '#0f172a', // Slate-900
      secondary: '#475569', // Slate-600
      tertiary: '#94a3b8', // Slate-400
      inverse: '#ffffff',
    },
    border: {
      primary: '#e2e8f0', // Slate-200
      secondary: '#cbd5e1', // Slate-300
      focus: '#F59E0B', // Amber-500
    },
    status: {
      success: '#10b981', // Emerald-500
      warning: '#f59e0b', // Amber-500
      error: '#ef4444', // Red-500
      info: '#8B5CF6', // Violet-500
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    },
  },
  // Dark mode colors
  dark: {
    primary: '#F59E0B', // Amber-500 — gold trust
    primaryHover: '#FBBF24', // Amber-400
    accent: '#8B5CF6', // Violet-500 — tech purple
    accentHover: '#A78BFA', // Violet-400
    background: '#0F172A', // Slate-900
    backgroundSecondary: '#1e293b', // Slate-800
    backgroundTertiary: '#334155', // Slate-700
    surface: '#1e293b', // Slate-800
    surfaceHover: '#334155', // Slate-700
    text: {
      primary: '#F8FAFC', // Slate-50
      secondary: '#CBD5E1', // Slate-300
      tertiary: '#94a3b8', // Slate-400
      inverse: '#0F172A', // Slate-900
    },
    border: {
      primary: '#334155', // Slate-700
      secondary: '#475569', // Slate-600
      focus: '#F59E0B', // Amber-500
    },
    status: {
      success: '#34d399', // Emerald-400
      warning: '#fbbf24', // Amber-400
      error: '#f87171', // Red-400
      info: '#A78BFA', // Violet-400
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
      glow: '0 0 20px 0 rgb(245 158 11 / 0.15)',
    },
  },
}

export type ColorScheme = 'light' | 'dark'
export type ThemeColors = typeof colors.light
