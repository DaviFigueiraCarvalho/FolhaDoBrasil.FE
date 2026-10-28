import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native'
import { colors, typeScale } from '../theme'

export type TextVariant = keyof typeof typeScale

export interface TextProps extends RNTextProps {
  variant?: TextVariant
  color?: keyof typeof colors
}

// Componente tipográfico único do design system: toda variação vem de src/theme/typography.ts,
// nenhuma tela deve usar RN Text puro com fontFamily/fontSize inline (regra: design system sem
// CSS, tokens centralizados).
export default function Text({ variant = 'body', color = 'textPrimary', style, ...props }: TextProps) {
  const scale = typeScale[variant]
  return (
    <RNText
      style={[
        styles.base,
        {
          fontFamily: scale.fontFamily,
          fontSize: scale.fontSize,
          lineHeight: scale.lineHeight,
          letterSpacing: scale.letterSpacing,
          color: colors[color],
        },
        style,
      ]}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
})
