import { useEffect, useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native'
import { Image } from 'expo-image'
import { Text } from '../../components'
import { colors, radius, spacing } from '../../theme'
import { coverUrl, type NewsPost, type NewsTopic } from './NewsBody'

const COLUMN_WIDTH = 280 // largura rígida: celular mostra 1 coluna (+ a próxima espiando); telas maiores, mais colunas
const GAP = spacing.m
const MAX_POSTS = 5
const ROTATE_MS = 6000
const IDLE_AFTER_TOUCH_MS = 10000 // depois de mexer na fileira, o avanço automático espera

export interface TopicSection {
  topic: NewsTopic
  posts: NewsPost[]
}

// Carrossel horizontal de colunas: cada tópico é uma coluna de largura fixa com até 5 notícias empilhadas
// (1 x 5) e o botão "Ver todas as notícias". Alinhado à esquerda; a largura da tela decide quantas colunas
// aparecem (em telas pequenas, 1) e a seguinte fica cortada à direita.
export default function TopicColumns({
  sections,
  onHover,
  onOpen,
  onSeeAll,
  onSeeAllTopics,
  wrap = false,
}: {
  sections: TopicSection[]
  onHover: (post: NewsPost, hovering: boolean) => void
  onOpen: (post: NewsPost) => void
  onSeeAll: (topic: NewsTopic) => void
  /** Botão do cabeçalho que abre a página com todos os tópicos. */
  onSeeAllTopics?: () => void
  /** Página "todos os tópicos": colunas quebram linha em vez de deslizar. */
  wrap?: boolean
}) {
  const { width: windowWidth } = useWindowDimensions()
  const [viewport, setViewport] = useState(windowWidth - spacing.l * 2)
  const scroll = useRef<ScrollView>(null)
  const offset = useRef(0)
  const contentWidth = useRef(0)
  const hovering = useRef(false)
  const touchedAt = useRef(0)

  const stride = COLUMN_WIDTH + GAP
  const columns = Math.max(1, Math.floor((viewport + GAP) / stride))
  // Avança uma coluna a cada ROTATE_MS e volta ao início no fim; pausa com o mouse em cima ou logo após o usuário mexer.
  const canScroll = !wrap && sections.length > columns
  useEffect(() => {
    if (!canScroll) return
    const timer = setInterval(() => {
      if (hovering.current || Date.now() - touchedAt.current < IDLE_AFTER_TOUCH_MS) return
      const atEnd = offset.current + viewport >= contentWidth.current - 2
      scroll.current?.scrollTo({ x: atEnd ? 0 : offset.current + stride, animated: true })
    }, ROTATE_MS)
    return () => clearInterval(timer)
  }, [canScroll, viewport, stride])

  const columnsJsx = (
    <>
        {sections.map(({ topic, posts }) => (
          <View key={topic.id} style={[styles.column, { width: COLUMN_WIDTH }]}>
            <Text variant="heading" color="accent" accessibilityRole="header" numberOfLines={1}>
              {topic.name}
            </Text>
            <View style={styles.items}>
              {posts.slice(0, MAX_POSTS).map((post) => (
                <Item key={post.id} post={post} onHover={(hovering) => onHover(post, hovering)} onPress={() => onOpen(post)} />
              ))}
              </View>
              <Pressable onPress={() => onSeeAll(topic)} accessibilityRole="button" style={styles.seeAll}>
                <Text variant="label" color="onAccent">
                  Ver todas as notícias
                </Text>
              </Pressable>
            </View>
          ))}
      </>
  )

  return (
    <View style={styles.wrap} onPointerEnter={() => (hovering.current = true)} onPointerLeave={() => (hovering.current = false)}>
      <View style={styles.header}>
        <Text variant="title" color="textPrimary" accessibilityRole="header" style={styles.flex}>
          Tópicos
        </Text>
        {onSeeAllTopics && (
          <Pressable onPress={onSeeAllTopics} accessibilityRole="button" style={styles.seeAllTopics}>
            <Text variant="label" color="onAccent">
              Ver todos os tópicos
            </Text>
          </Pressable>
        )}
      </View>
      {wrap ? (
        <View style={styles.wrapGrid}>{columnsJsx}</View>
      ) : (
        <ScrollView
          ref={scroll}
          horizontal
          showsHorizontalScrollIndicator={false}
          onLayout={(event) => setViewport(event.nativeEvent.layout.width)}
          onScroll={(event) => (offset.current = event.nativeEvent.contentOffset.x)}
          onScrollBeginDrag={() => (touchedAt.current = Date.now())}
          onContentSizeChange={(width) => (contentWidth.current = width)}
          scrollEventThrottle={16}
          snapToInterval={stride}
          decelerationRate="fast"
          contentContainerStyle={styles.row}
        >
          {columnsJsx}
        </ScrollView>
      )}
    </View>
  )
}

function Item({ post, onHover, onPress }: { post: NewsPost; onHover: (hovering: boolean) => void; onPress: () => void }) {
  const cover = coverUrl(post)
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => onHover(true)}
      onHoverOut={() => onHover(false)}
      accessibilityRole="button"
      accessibilityLabel={post.title}
      style={styles.item}
    >
      {cover ? <Image source={{ uri: cover }} style={styles.thumb} contentFit="cover" /> : <View style={[styles.thumb, styles.thumbEmpty]} />}
      <Text variant="bodyStrong" color="textPrimary" numberOfLines={3} style={styles.flex}>
        {post.title}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.s },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  flex: { flex: 1 },
  row: { gap: GAP, paddingVertical: spacing.xs },
  column: { padding: spacing.m, gap: spacing.s, borderRadius: radius.m, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceRaised },
  items: { flex: 1, gap: spacing.s },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.s, padding: spacing.xs, borderRadius: radius.s },
  thumb: { width: 72, height: 72, borderRadius: radius.s },
  thumbEmpty: { backgroundColor: colors.surfaceHighlight },
  seeAllTopics: { minHeight: 36, paddingHorizontal: spacing.m, borderRadius: radius.s, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
  wrapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  seeAll: { minHeight: 40, borderRadius: radius.s, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
})
