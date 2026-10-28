import { useEffect, useState } from 'react'
import { Animated, Easing, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native'
import { Image } from 'expo-image'
import { Text } from '../../components'
import { colors, radius, spacing } from '../../theme'
import { coverUrl, type NewsPost } from './NewsBody'

const ROTATE_MS = 6000
const SLIDE_MS = 500
const PHONE_WIDTH = 420 // piso: em tela pequena/média a capa tem tamanho de celular
const MAX_SLIDE_HEIGHT = 540
const GAP = spacing.m
const ARROWS_BELOW_SIDE_SPACE = 60 // sem espaço lateral para ver as vizinhas, usa setas

const mod = (n: number, m: number) => ((n % m) + m) % m

// Carrossel de destaques: a matéria atual tem tamanho fixo de celular; as vizinhas aparecem
// escurecidas nas laterais conforme a largura disponível (quanto mais tela, mais delas) e deslizam
// em loop. `step` é um contador sem limite (key do slide); `pos` anima até ele.
export default function FeaturedCarousel({ posts, onOpen }: { posts: NewsPost[]; onOpen: (post: NewsPost) => void }) {
  const { width: windowWidth } = useWindowDimensions()
  const [containerWidth, setContainerWidth] = useState(windowWidth)
  const [step, setStep] = useState(0)
  const [paused, setPaused] = useState(false)
  const [pos] = useState(() => new Animated.Value(0))
  const count = posts.length

  // Em tela grande a capa cresce até ocupar metade da largura: cada vizinha aparece com ~50% de si.
  const slideWidth = Math.min(containerWidth, Math.max(PHONE_WIDTH, Math.round((containerWidth - 2 * GAP) / 2)))
  const slideHeight = Math.min(Math.round((slideWidth * 5) / 4), MAX_SLIDE_HEIGHT)
  const stride = slideWidth + GAP
  const sideSpace = (containerWidth - slideWidth) / 2
  const reach = count < 2 ? 0 : Math.min(Math.ceil(sideSpace / stride) + 1, count >= 3 ? Math.floor(count / 2) : 1)

  useEffect(() => {
    Animated.timing(pos, { toValue: step, duration: SLIDE_MS, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }).start()
  }, [step, pos])

  useEffect(() => {
    if (count < 2 || paused) return
    const timer = setInterval(() => setStep((s) => s + 1), ROTATE_MS)
    return () => clearInterval(timer)
  }, [count, paused])

  const active = mod(step, count)
  const slides = []
  for (let k = step - reach; k <= step + reach; k++) {
    const post = posts[mod(k, count)]
    const cover = coverUrl(post)
    const left = (containerWidth - slideWidth) / 2
    slides.push(
      <Animated.View
        key={k}
        style={[
          styles.slide,
          {
            width: slideWidth,
            height: slideHeight,
            left,
            transform: [{ translateX: pos.interpolate({ inputRange: [0, 1], outputRange: [k * stride, (k - 1) * stride] }) }],
          },
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => (k === step ? onOpen(post) : setStep(k))}
          accessibilityRole="button"
          accessibilityLabel={k === step ? `Destaque: ${post.title}` : `Ver destaque: ${post.title}`}
        >
          {cover && <Image source={{ uri: cover }} style={StyleSheet.absoluteFill} contentFit="cover" />}
          <View style={styles.caption}>
            <Text variant="label" color="accent">
              DESTAQUE
            </Text>
            <Text variant="title" color="white" numberOfLines={3}>
              {post.title}
            </Text>
          </View>
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              styles.dim,
              { opacity: pos.interpolate({ inputRange: [k - 1, k, k + 1], outputRange: [0.65, 0, 0.65], extrapolate: 'clamp' }) },
            ]}
          />
        </Pressable>
      </Animated.View>,
    )
  }

  // Menor deslocamento circular até o destaque `target` (bolinhas).
  const goTo = (target: number) => {
    let delta = mod(target - active, count)
    if (delta > count / 2) delta -= count
    setStep((s) => s + delta)
  }
  const showArrows = count > 1 && sideSpace < ARROWS_BELOW_SIDE_SPACE

  return (
    <View
      style={styles.wrap}
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <View style={[styles.viewport, { height: slideHeight }]}>
        {slides}
        {showArrows && (
          <>
            <Arrow label="Anterior" glyph="‹" side="left" onPress={() => setStep((s) => s - 1)} />
            <Arrow label="Próxima" glyph="›" side="right" onPress={() => setStep((s) => s + 1)} />
          </>
        )}
      </View>
      {count > 1 && (
        <View style={styles.dots}>
          {posts.map((post, i) => (
            <Pressable key={post.id} onPress={() => goTo(i)} accessibilityRole="button" accessibilityLabel={`Destaque ${i + 1} de ${count}`} hitSlop={8}>
              <View style={[styles.dot, i === active && styles.dotActive]} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  )
}

function Arrow({ label, glyph, side, onPress }: { label: string; glyph: string; side: 'left' | 'right'; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={[styles.arrow, side === 'left' ? styles.left : styles.right]}>
      <Text variant="title" color="white">
        {glyph}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 1600, alignSelf: 'center', gap: spacing.s },
  viewport: { width: '100%', overflow: 'hidden' },
  slide: { position: 'absolute', top: 0, borderRadius: radius.m, overflow: 'hidden', backgroundColor: colors.surfaceHighlight, justifyContent: 'flex-end' },
  caption: { padding: spacing.l, gap: spacing.xs, backgroundColor: 'rgba(8, 24, 64, 0.72)' },
  dim: { backgroundColor: '#061436' },
  arrow: { position: 'absolute', top: '50%', marginTop: -22, width: 44, height: 44, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8, 24, 64, 0.6)' },
  left: { left: spacing.s },
  right: { right: spacing.s },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.s },
  dot: { width: 10, height: 10, borderRadius: radius.full, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.accent },
})
