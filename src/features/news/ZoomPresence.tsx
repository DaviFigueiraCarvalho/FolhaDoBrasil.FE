import { useEffect, useState, type ReactNode } from 'react'
import { Animated, Easing, type StyleProp, type ViewStyle } from 'react-native'

const DURATION_MS = 180
const FROM_SCALE = 0.1

// Mostra `item` com zoom in + fade a partir do ponto `origin` (px da janela; sem ele, do centro) e, quando vira null, faz zoom out antes de sumir (o filho é desmontado só no fim).
export default function ZoomPresence<T>({ item, origin, style, children }: { item: T | null; origin?: { x: number; y: number } | null; style?: StyleProp<ViewStyle>; children: (item: T) => ReactNode }) {
  const [shown, setShown] = useState<T | null>(item)
  const [progress] = useState(() => new Animated.Value(0))
  // Ajuste de estado durante o render: guarda o último item para ele continuar visível durante o zoom out.
  if (item !== null && item !== shown) setShown(item)

  const open = item !== null
  useEffect(() => {
    const animation = Animated.timing(progress, { toValue: open ? 1 : 0, duration: DURATION_MS, easing: Easing.out(Easing.cubic), useNativeDriver: false })
    animation.start(({ finished }) => finished && !open && setShown(null))
    return () => animation.stop()
  }, [open, progress])

  if (shown === null) return null
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [FROM_SCALE, 1] })
  return <Animated.View style={[style, { opacity: progress, transform: [{ scale }] }, origin && ({ transformOrigin: `${origin.x}px ${origin.y}px` } as ViewStyle)]}>{children(shown)}</Animated.View>
}
