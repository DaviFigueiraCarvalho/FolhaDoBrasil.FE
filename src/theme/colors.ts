// Paleta da marca Folha do Brasil: azul profundo do fundo, verde da folha, ouro do losango.
export const colors = {
  background: '#0b2a6b',
  backgroundAlt: '#0a2358',
  surface: '#103580',
  surfaceRaised: '#143d94',
  surfaceHighlight: '#1b4aa8',
  border: '#2a5bc0',

  accent: '#e3b94a', // ouro
  accentDim: '#a8872b',
  danger: '#e0574a',
  dangerGlow: 'rgba(224, 87, 74, 0.35)',
  primary: '#1f9d4d', // verde
  primaryGlow: 'rgba(31, 157, 77, 0.45)',
  success: '#2fbf6b',
  successGlow: 'rgba(47, 191, 107, 0.35)',

  textPrimary: '#f6f3e8',
  textSecondary: '#d6dcee',
  textMuted: '#a5b3d6',
  textFaint: '#7b8cb8',

  onAccent: '#1a1405',
  white: '#ffffff',
} as const

export type ColorToken = keyof typeof colors
