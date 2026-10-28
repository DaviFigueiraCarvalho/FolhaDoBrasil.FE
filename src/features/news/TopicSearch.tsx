import { Pressable, StyleSheet, TextInput, View } from 'react-native'
import { Text } from '../../components'
import { colors, radius, spacing } from '../../theme'
import type { NewsTopic } from './NewsBody'

const MAX_SUGGESTIONS = 5

// Busca de tópicos com sugestões enquanto digita (a correspondência tolerante a erro vem de searchTopics).
export default function TopicSearch({
  query,
  onChange,
  matches,
  onPick,
}: {
  query: string
  onChange: (query: string) => void
  matches: NewsTopic[]
  onPick: (topic: NewsTopic) => void
}) {
  const typing = query.trim().length > 0
  return (
    <View style={styles.wrap}>
      <TextInput
        value={query}
        onChangeText={onChange}
        placeholder="Buscar tópico…"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Buscar tópico"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={() => matches[0] && onPick(matches[0])}
        style={styles.input}
      />
      {typing && (
        <View style={styles.list}>
          {matches.length === 0 ? (
            <Text variant="body" color="textSecondary" style={styles.empty}>
              Nenhum tópico parecido com “{query.trim()}”.
            </Text>
          ) : (
            matches.slice(0, MAX_SUGGESTIONS).map((topic, index) => (
              <Pressable key={topic.id} onPress={() => onPick(topic)} accessibilityRole="button" style={styles.suggestion}>
                <Text variant="bodyStrong" color={index === 0 ? 'accent' : 'textPrimary'}>
                  {index === 0 ? `Você quis dizer: ${topic.name}` : topic.name}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  input: { minHeight: 48, paddingHorizontal: spacing.m, borderRadius: radius.s, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.textPrimary, fontSize: 16 },
  list: { borderRadius: radius.s, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.backgroundAlt, overflow: 'hidden' },
  suggestion: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.m },
  empty: { padding: spacing.m },
})
