import { useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native'
import { Image } from 'expo-image'
import { Text } from '../../components'
import { colors, radius, spacing } from '../../theme'
import { coverUrl, type NewsPost, type NewsTopic } from './NewsBody'

const MIN_COLUMN = 300 // largura-alvo de uma coluna; define quantas inteiras cabem
const MIN_COLUMNS = 2
const PEEK = 0.4 // fração da próxima coluna que aparece cortada à direita
const GAP = spacing.m
const MAX_POSTS = 5
const STACKED_BELOW = 220 // colunas mais estreitas (celular) põem a miniatura em cima do título

export interface TopicSection {
  topic: NewsTopic
  posts: NewsPost[]
}

// Carrossel horizontal de colunas: cada tópico é uma coluna com até 5 notícias empilhadas (1 x 5) e o
// botão "Ver todas as notícias". Alinhado à esquerda: no mínimo 2 colunas inteiras e uma cortada à
// direita; quanto maior a tela, mais colunas.
export default function TopicColumns({
  sections,
  onHover,
  onOpen,
  onSeeAll,
}: {
  sections: TopicSection[]
  onHover: (post: NewsPost, hovering: boolean) => void
  onOpen: (post: NewsPost) => void
  onSeeAll: (topic: NewsTopic) => void
}) {
  const { width: windowWidth } = useWindowDimensions()
  const [viewport, setViewport] = useState(windowWidth - spacing.l * 2)
  const scroll = useRef<ScrollView>(null)
  const offset = useRef(0)

  const columns = Math.max(MIN_COLUMNS, Math.floor(viewport / MIN_COLUMN))
  const columnWidth = Math.floor((viewport - columns * GAP) / (columns + PEEK))
  const stride = columnWidth + GAP
  const slide = (direction: 1 | -1) => scroll.current?.scrollTo({ x: Math.max(0, offset.current + direction * stride), animated: true })

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text variant="title" color="textPrimary" accessibilityRole="header" style={styles.flex}>
          Tópicos
        </Text>
        {sections.length > columns && (
          <>
            <RoundButton label="Anteriores" glyph="‹" onPress={() => slide(-1)} />
            <RoundButton label="Próximos" glyph="›" onPress={() => slide(1)} />
          </>
        )}
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
        {sections.map(({ topic, posts }) => (
          <View key={topic.id} style={[styles.column, { width: columnWidth }]}>
            <Text variant="heading" color="accent" accessibilityRole="header" numberOfLines={1}>
              {topic.name}
            </Text>
            <View style={styles.items}>
              {posts.slice(0, MAX_POSTS).map((post) => (
                <Item key={post.id} post={post} stacked={columnWidth < STACKED_BELOW} onHover={(hovering) => onHover(post, hovering)} onPress={() => onOpen(post)} />
              ))}
            </View>
            <Pressable onPress={() => onSeeAll(topic)} accessibilityRole="button" style={styles.seeAll}>
              <Text variant="label" color="onAccent">
                Ver todas as notícias
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

function Item({ post, stacked, onHover, onPress }: { post: NewsPost; stacked: boolean; onHover: (hovering: boolean) => void; onPress: () => void }) {
  const cover = coverUrl(post)
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => onHover(true)}
      onHoverOut={() => onHover(false)}
      accessibilityRole="button"
      accessibilityLabel={post.title}
      style={[styles.item, stacked && styles.itemStacked]}
    >
      {cover ? <Image source={{ uri: cover }} style={[styles.thumb, stacked && styles.thumbStacked]} contentFit="cover" /> : <View style={[styles.thumb, stacked && styles.thumbStacked, styles.thumbEmpty]} />}
      <Text variant="bodyStrong" color="textPrimary" numberOfLines={3} style={stacked ? undefined : styles.flex}>
        {post.title}
      </Text>
    </Pressable>
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
  wrap: { gap: spacing.s },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  flex: { flex: 1 },
  round: { width: 36, height: 36, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  row: { gap: GAP, paddingVertical: spacing.xs },
  column: { padding: spacing.m, gap: spacing.s, borderRadius: radius.m, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceRaised },
  items: { flex: 1, gap: spacing.s },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.s, padding: spacing.xs, borderRadius: radius.s },
  itemStacked: { flexDirection: 'column', alignItems: 'stretch' },
  thumbStacked: { width: '100%', height: undefined, aspectRatio: 4 / 3 },
  thumb: { width: 72, height: 72, borderRadius: radius.s },
  thumbEmpty: { backgroundColor: colors.surfaceHighlight },
  seeAll: { minHeight: 40, borderRadius: radius.s, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
})
