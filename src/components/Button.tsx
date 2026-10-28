import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, type GestureResponderEvent, type PressableProps, type ViewStyle } from 'react-native'
import Text from './Text'
import { colors, elevation, radius, spacing } from '../theme'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  variant?: ButtonVariant
  busy?: boolean
  disabled?: boolean
  children?: React.ReactNode
  style?: ViewStyle
}

// Equivalente ao Button.css legado (ui-button--primary/secondary/ghost/danger). Pressable dá
// estado `pressed` nativamente; hover/focus são extras que só disparam na web (RNW), ignorados
// no touch — não precisam de Platform.OS espalhado pela tela porque ficam encapsulados aqui.
export default function Button({ variant = 'primary', busy = false, disabled = false, children, style, onPress, ...props }: ButtonProps) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const isDisabled = disabled || busy

  function handlePress(event: GestureResponderEvent) {
    if (isDisabled) return
    onPress?.(event)
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy }}
      disabled={isDisabled}
      onPress={handlePress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        variant === 'primary' && elevation.accentGlow,
        pressed && styles.pressed,
        (hovered || focused) && !isDisabled && styles.emphasized,
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {busy ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? colors.textPrimary : colors.onAccent} />
      ) : (
        <Text variant="label" color={textColorByVariant[variant]} style={styles.label}>
          {children}
        </Text>
      )}
    </Pressable>
  )
}

const textColorByVariant: Record<ButtonVariant, 'onAccent' | 'textPrimary' | 'textSecondary' | 'white'> = {
  primary: 'onAccent',
  secondary: 'textPrimary',
  ghost: 'textSecondary',
  danger: 'white',
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44, // alvo de toque mínimo (regra 19 do prompt mestre)
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: {
    textTransform: 'none',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  emphasized: {
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.6,
  },
})

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.surface, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.danger },
}
