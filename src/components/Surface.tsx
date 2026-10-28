import type { ReactNode } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import { colors, elevation as elevationTokens, radius, spacing } from '../theme'

export type SurfaceLevel = 'flat' | 'raised' | 'highlight'
export type SurfaceElevation = keyof typeof elevationTokens

export interface SurfaceProps {
  children?: ReactNode
  level?: SurfaceLevel
  elevation?: SurfaceElevation
  padding?: keyof typeof spacing
  style?: ViewStyle
}

const backgroundByLevel: Record<SurfaceLevel, string> = {
  flat: colors.surface,
  raised: colors.surfaceRaised,
  highlight: colors.surfaceHighlight,
}

// Card/painel padrão (equivalente aos `.card`/`.panel` do CSS legado). Toda superfície elevada
// da UI deve usar este componente em vez de um View com estilo inline repetido.
export default function Surface({ children, level = 'flat', elevation: elevationToken = 'none', padding = 'l', style }: SurfaceProps) {
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: backgroundByLevel[level], padding: spacing[padding] },
        elevationTokens[elevationToken],
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
})
