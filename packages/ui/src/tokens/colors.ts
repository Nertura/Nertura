/** Nertura color tokens — mirrors CSS variables in styles/tokens.css */

export const colors = {
  bg: 'var(--nertura-bg)',
  surface: 'var(--nertura-surface)',
  surfaceSoft: 'var(--nertura-surface-soft)',
  border: 'var(--nertura-border)',
  borderStrong: 'var(--nertura-border-strong)',
  text: 'var(--nertura-text)',
  textMuted: 'var(--nertura-text-muted)',
  primary: 'var(--nertura-primary)',
  primaryHover: 'var(--nertura-primary-hover)',
  primarySoft: 'var(--nertura-primary-soft)',
  warning: 'var(--nertura-warning)',
  danger: 'var(--nertura-danger)',
  success: 'var(--nertura-success)',
} as const;
