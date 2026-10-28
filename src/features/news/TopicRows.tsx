import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from '../../components'
import { colors, radius, spacing } from '../../theme'
import type { NewsPost, NewsTopic } from './NewsBody'
import PostRow from './PostRow'

export interface TopicSection {
  topic: NewsTopic
  posts: NewsPost[]
}

// Seção "Tópicos": cada tópico é uma linha horizontal que passa sozinha, com "Ver todas as notícias" dele.
export default function TopicRows({
  sections,
  renderCard,
  onSeeAll,
  onSeeAllTopics,
}: {
  sections: TopicSection[]
  renderCard: (post: NewsPost, width: number) => ReactNode
  onSeeAll: (topic: NewsTopic) => void
  /** Botão do cabeçalho que abre a página com todos os tópicos (só na home). */
  onSeeAllTopics?: () => void
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text variant="title" color="textPrimary" accessibilityRole="header" style={styles.flex}>
          Tópicos
        </Text>
        {onSeeAllTopics && (
          <Pressable onPress={onSeeAllTopics} accessibilityRole="button" style={styles.seeAll}>
            <Text variant="label" color="onAccent">
              Ver todos os tópicos
            </Text>
          </Pressable>
        )}
      </View>
      {sections.map(({ topic, posts }) => (
        <PostRow key={topic.id} title={topic.name} titleVariant="heading" posts={posts} renderCard={renderCard} actionLabel="Ver todas as notícias" onAction={() => onSeeAll(topic)} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.l },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  flex: { flex: 1 },
  seeAll: { minHeight: 36, paddingHorizontal: spacing.m, borderRadius: radius.s, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
})
