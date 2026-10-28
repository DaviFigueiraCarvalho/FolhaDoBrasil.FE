import { Platform } from 'react-native'
import type { ViewStyle } from 'react-native'

// RN não tem box-shadow: iOS usa shadow*, Android usa elevation. Presets equivalentes às
// sombras usadas no legado (ex.: Button.css box-shadow do variant primary).
function shadow(elevation: number, opacity: number, radius: number, colorRgb = '0,0,0'): ViewStyle {
  return Platform.select<ViewStyle>({
    android: { elevation },
    ios: {
      shadowColor: `rgb(${colorRgb})`,
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: Math.round(elevation / 2) },
    },
    default: {
      shadowColor: `rgb(${colorRgb})`,
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: Math.round(elevation / 2) },
    },
  }) as ViewStyle
}

export const elevation = {
  none: {} as ViewStyle,
  low: shadow(2, 0.2, 4),
  medium: shadow(6, 0.25, 10),
  high: shadow(12, 0.3, 20),
  // Glow âmbar do CTA primário (Button.css: box-shadow 0 6px 20px rgba(242,169,59,.25)).
  accentGlow: shadow(6, 0.25, 20, '242,169,59'),
} as const

export type ElevationToken = keyof typeof elevation
