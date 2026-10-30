import { Platform } from 'react-native'

// Paleta da marca Folha do Brasil: azul-marinho no texto, ouro e verde nos destaques.
const light = {
  background: '#ffffff',
  backgroundAlt: '#f4f6fb',
  surface: '#e9eef8',
  surfaceRaised: '#f4f6fb',
  surfaceHighlight: '#dbe4f5',
  border: '#cfd9ec',
  overlay: 'rgba(255, 255, 255, 0.97)', // fundo da notícia aberta

  accent: '#e3b94a', // ouro (botões e destaques)
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
}

export type ColorToken = keyof typeof light

// Só o que muda no escuro; o resto (ouro, verde, onAccent, white) vale para os dois.
const dark: Partial<Record<ColorToken, string>> = {
  background: '#0b1220',
  backgroundAlt: '#111a2e',
  surface: '#17223a',
  surfaceRaised: '#131c30',
  surfaceHighlight: '#1f2d4d',
  border: '#26345a',
  overlay: 'rgba(11, 18, 32, 0.97)',
  accentDim: '#e3b94a',
  danger: '#ef6b5b',
  primary: '#3ccf7a',
  success: '#3ccf7a',
  textPrimary: '#e8edf8',
  textSecondary: '#c0cadf',
  textMuted: '#93a0bd',
  textFaint: '#6b7893',
}

// Web: cada token vira `var(--c-token)`, e o tema segue o sistema por `prefers-color-scheme` em CSS
// (sem re-render, sem flash). Nativo: fica a paleta clara.
const tokens = Object.keys(light) as ColorToken[]
const vars = (palette: Partial<Record<ColorToken, string>>) => tokens.filter((t) => palette[t]).map((t) => `--c-${t}:${palette[t]};`).join('')

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent =
    `:root{color-scheme:light dark;${vars(light)}}` +
    `@media (prefers-color-scheme:dark){:root{${vars(dark)}}}` +
    `html,body{background:var(--c-background)}`
  document.head.appendChild(style)
}

export const colors = Object.fromEntries(
  tokens.map((token) => [token, Platform.OS === 'web' ? `var(--c-${token})` : light[token]]),
) as Record<ColorToken, string>
