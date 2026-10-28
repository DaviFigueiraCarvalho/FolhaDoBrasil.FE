import { useRef, useState, type ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native'
import { Text } from '../../components'
import { colors, radius, spacing } from '../../theme'
import type { NewsPost } from './NewsBody'

const MIN_CARD = 230 // largura-alvo de um card; define quantas colunas inteiras cabem
const MIN_COLUMNS = 2
const MAX_COLUMNS = 4 // 4 inteiras + a 5ª cortada = grade 1 x 5
const PEEK = 0.4 // fração do próximo card que aparece cortada à direita
const GAP = 0 // o espaçamento entre cards já vem do padding da célula (NewsCard)
const MAX_POSTS = 5

// Fileira deslizante de um tópico (grade 1 x 5), alinhada à esquerda: no mínimo 2 cards inteiros e
// um cortado à direita; quanto maior a tela, mais colunas. "Ver todas" abre a aba do tópico.
export default function TopicRow({
  title,
  posts,
  renderCard,
  onSeeAll,
}: {
  title: string
  posts: NewsPost[]
  renderCard: (post: NewsPost, width: number) => ReactNode
  onSeeAll: () => void
}) {
  const { width: windowWidth } = useWindowDimensions()
  const [viewport, setViewport] = useState(windowWidth - spacing.l * 2)
  const scroll = useRef<ScrollView>(null)
  const offset = useRef(0)

  const columns = Math.min(MAX_COLUMNS, Math.max(MIN_COLUMNS, Math.floor(viewport / MIN_CARD)))
  const cardWidth = Math.floor((viewport - columns * GAP) / (columns + PEEK))
  const stride = cardWidth + GAP
  const shown = posts.slice(0, MAX_POSTS)

  const slide = (direction: 1 | -1) => scroll.current?.scrollTo({ x: Math.max(0, offset.current + direction * stride), animated: true })

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text variant="title" color="textPrimary" accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        {shown.length > columns && (
          <>
            <RoundButton label="Anteriores" glyph="‹" onPress={() => slide(-1)} />
            <RoundButton label="Próximas" glyph="›" onPress={() => slide(1)} />
          </>
        )}
        <Pressable onPress={onSeeAll} accessibilityRole="button" style={styles.seeAll}>
          <Text variant="label" color="onAccent">
            Ver todas as notícias
          </Text>
        </Pressable>
      </View>
      <ScrollView
        ref={scroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={(event) => setViewport(event.nativeEvent.layout.width)}
        onScroll={(event) => (offset.current = event.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
        snapToInterval={stride}
        decelerationRate="fast"
        contentContainerStyle={styles.row}
      >
        {shown.map((post) => renderCard(post, cardWidth))}
      </ScrollView>
    </View>
  )
}

function RoundButton({ label, glyph, onPress }: { label: string; glyph: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.round}>
      <Text variant="heading" color="textPrimary">
        {glyph}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  section: { gap: spacing.s },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  title: { flex: 1 },
  seeAll: { minHeight: 36, paddingHorizontal: spacing.m, borderRadius: radius.s, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
  round: { width: 36, height: 36, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  row: { alignItems: 'flex-start', paddingVertical: spacing.xs },
})
