// Paleta da marca Folha do Brasil sobre fundo branco: azul-marinho no texto, ouro e verde nos destaques.
export const colors = {
  background: '#ffffff',
  backgroundAlt: '#f4f6fb',
  surface: '#e9eef8',
  surfaceRaised: '#f4f6fb',
  surfaceHighlight: '#dbe4f5',
  border: '#cfd9ec',

  accent: '#e3b94a', // ouro (botões e destaques sobre fundo escuro)
  accentDim: '#8a6d12', // ouro escuro, legível como texto sobre claro
  danger: '#c0392b',
  dangerGlow: 'rgba(192, 57, 43, 0.35)',
  primary: '#1f9d4d', // verde
  primaryGlow: 'rgba(31, 157, 77, 0.45)',
  success: '#1f9d4d',
  successGlow: 'rgba(31, 157, 77, 0.35)',

  textPrimary: '#0b2a6b',
  textSecondary: '#2b3f6e',
  textMuted: '#5b6a8c',
  textFaint: '#8793ae',

  onAccent: '#1a1405',
  white: '#ffffff',
} as const

export type ColorToken = keyof typeof colors
