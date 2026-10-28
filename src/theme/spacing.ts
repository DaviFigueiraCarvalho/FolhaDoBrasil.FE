// O CSS legado não tinha uma escala de espaçamento nomeada (valores ad hoc em px por
// componente). Esta escala é nova, criada para o design system React Native — base 4px.
export const spacing = {
  none: 0,
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const

export type SpacingToken = keyof typeof spacing
