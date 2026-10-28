// Portado de VoidMMA,FE/src/styles/tokens.css (--radius-s/m/l/full).
export const radius = {
  s: 10,
  m: 16,
  l: 22,
  full: 999,
} as const

export type RadiusToken = keyof typeof radius
