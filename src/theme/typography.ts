import { Platform } from 'react-native'

export const fontFamily = {
  display: 'PlayfairDisplay_900Black',
  heading: 'PlayfairDisplay_700Bold',
  body: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodyBold: 'Manrope_700Bold',
  // Fallback do sistema enquanto as fontes carregam (evita texto invisível).
  fallback: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
} as const

export interface TypeScaleEntry {
  fontFamily: string
  fontSize: number
  lineHeight: number
  letterSpacing?: number
}

export const typeScale: Record<'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'label' | 'small', TypeScaleEntry> = {
  display: { fontFamily: fontFamily.display, fontSize: 36, lineHeight: 42 },
  title: { fontFamily: fontFamily.display, fontSize: 26, lineHeight: 32 },
  heading: { fontFamily: fontFamily.heading, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fontFamily.body, fontSize: 15, lineHeight: 24 },
  bodyStrong: { fontFamily: fontFamily.bodyBold, fontSize: 15, lineHeight: 24 },
  label: { fontFamily: fontFamily.bodyMedium, fontSize: 13, lineHeight: 18, letterSpacing: 0.2 },
  small: { fontFamily: fontFamily.body, fontSize: 12, lineHeight: 16 },
}
