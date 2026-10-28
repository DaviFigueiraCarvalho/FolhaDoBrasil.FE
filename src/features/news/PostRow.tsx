import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native'
import { Text } from '../../components'
import { colors, radius, spacing } from '../../theme'
import type { NewsPost } from './NewsBody'

const CARD_WIDTH = 220
const ROTATE_MS = 6000
const IDLE_AFTER_TOUCH_MS = 10000

// Linha horizontal de cards que passa sozinha (pausa com o mouse em cima ou logo após o usuário mexer),
// com título, uma linha de destaque e um botão à direita. Usada em "Últimas notícias" e em cada tópico.
export default function PostRow({
  title,
  titleVariant = 'title',
  posts,
  renderCard,
  actionLabel,
  onAction,
}: {
  title: string
  titleVariant?: 'title' | 'heading'
  posts: NewsPost[]
  renderCard: (post: NewsPost, width: number) => ReactNode
  actionLabel: string
  onAction: () => void
}) {
  const { width: windowWidth } = useWindowDimensions()
  const [viewport, setViewport] = useState(windowWidth - spacing.l * 2)
  const scroll = useRef<ScrollView>(null)
  const offset = useRef(0)
  const contentWidth = useRef(0)
  const hovering = useRef(false)
  const touchedAt = useRef(0)

  const canScroll = posts.length * CARD_WIDTH > viewport
  useEffect(() => {
    if (!canScroll) return
    const timer = setInterval(() => {
      if (hovering.current || Date.now() - touchedAt.current < IDLE_AFTER_TOUCH_MS) return
      const atEnd = offset.current + viewport >= contentWidth.current - 2
      scroll.current?.scrollTo({ x: atEnd ? 0 : offset.current + CARD_WIDTH, animated: true })
    }, ROTATE_MS)
    return () => clearInterval(timer)
  }, [canScroll, viewport])

  return (
    <View style={styles.wrap} onPointerEnter={() => (hovering.current = true)} onPointerLeave={() => (hovering.current = false)}>
      <View style={styles.header}>
        <Text variant={titleVariant} color={titleVariant === 'title' ? 'textPrimary' : 'accent'} accessibilityRole="header" style={styles.flex}>
          {title}
        </Text>
        <Pressable onPress={onAction} accessibilityRole="button" style={styles.seeAll}>
          <Text variant="label" color="onAccent">
            {actionLabel}
          </Text>
        </Pressable>
      </View>
      <View style={styles.line} />
      <ScrollView
        ref={scroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={(event) => setViewport(event.nativeEvent.layout.width)}
        onScroll={(event) => (offset.current = event.nativeEvent.contentOffset.x)}
        onScrollBeginDrag={() => (touchedAt.current = Date.now())}
        onContentSizeChange={(width) => (contentWidth.current = width)}
        scrollEventThrottle={16}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
      >
        {posts.map((post) => renderCard(post, CARD_WIDTH))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.s },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  flex: { flex: 1 },
  line: { height: 2, backgroundColor: colors.accent, borderRadius: 1 },
  seeAll: { minHeight: 36, paddingHorizontal: spacing.m, borderRadius: radius.s, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
})
