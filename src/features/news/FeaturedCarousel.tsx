import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native'
import { Image } from 'expo-image'
import { Text } from '../../components'
import { colors, radius, spacing } from '../../theme'
import { coverUrl, excerpt, type NewsPost } from './NewsBody'

const ROTATE_MS = 6000

// Carrossel de destaques (isFeatured): uma notícia por vez, troca sozinho e pausa com o mouse em cima.
export default function FeaturedCarousel({ posts, onOpen }: { posts: NewsPost[]; onOpen: (post: NewsPost) => void }) {
  const { width } = useWindowDimensions()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = posts.length
  const current = posts[Math.min(index, count - 1)]
  const wide = width >= 900

  const go = (step: number) => setIndex((i) => (i + step + count) % count)

  useEffect(() => {
    if (count < 2 || paused) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS)
    return () => clearInterval(timer)
  }, [count, paused])

  if (!current) return null
  const cover = coverUrl(current)

  return (
    <View style={styles.wrap} onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <Pressable onPress={() => onOpen(current)} accessibilityRole="button" accessibilityLabel={`Destaque: ${current.title}`}>
        <View style={[styles.hero, { aspectRatio: wide ? 16 / 6 : 4 / 3 }]}>
          {cover && <Image source={{ uri: cover }} style={StyleSheet.absoluteFill} contentFit="cover" />}
          <View style={styles.caption}>
            <Text variant="label" color="accent">
              DESTAQUE
            </Text>
            <Text variant={wide ? 'display' : 'title'} color="white" numberOfLines={3}>
              {current.title}
            </Text>
            {wide && (
              <Text variant="body" color="textSecondary" numberOfLines={2}>
                {excerpt(current.body)}
              </Text>
            )}
          </View>
        </View>
      </Pressable>

      {count > 1 && (
        <>
          <Arrow label="Anterior" glyph="‹" side="left" onPress={() => go(-1)} />
          <Arrow label="Próxima" glyph="›" side="right" onPress={() => go(1)} />
          <View style={styles.dots}>
            {posts.map((post, i) => (
              <Pressable key={post.id} onPress={() => setIndex(i)} accessibilityRole="button" accessibilityLabel={`Destaque ${i + 1} de ${count}`} hitSlop={8}>
                <View style={[styles.dot, i === index && styles.dotActive]} />
              </Pressable>
            ))}
          </View>
        </>
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
  wrap: { width: '100%', maxWidth: 1200, alignSelf: 'center' },
  hero: { width: '100%', maxHeight: 460, borderRadius: radius.m, overflow: 'hidden', backgroundColor: colors.surfaceHighlight, justifyContent: 'flex-end' },
  caption: { padding: spacing.l, paddingBottom: spacing.xl + spacing.l, gap: spacing.xs, backgroundColor: 'rgba(8, 24, 64, 0.72)' },
  arrow: { position: 'absolute', top: '50%', marginTop: -22, width: 44, height: 44, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8, 24, 64, 0.6)' },
  left: { left: spacing.s },
  right: { right: spacing.s },
  dots: { position: 'absolute', bottom: spacing.m, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: spacing.s },
  dot: { width: 10, height: 10, borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.45)' },
  dotActive: { backgroundColor: colors.accent },
})
