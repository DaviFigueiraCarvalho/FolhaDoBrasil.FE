import { useState } from 'react'
import { Platform, Pressable, StyleSheet, View } from 'react-native'
import { Text } from '../../components'
import { apiRequest } from '../../api/httpClient'
import { colors, radius, spacing } from '../../theme'
import type { NewsPoll } from './NewsBody'

const key = (postId: number) => `fdb.poll.${postId}`

// Lembra no aparelho em qual opção a pessoa votou (uma enquete, um voto).
function loadVote(postId: number): number | null {
  try {
    return Platform.OS === 'web' ? Number(localStorage.getItem(key(postId))) || null : null
  } catch {
    return null
  }
}

function Option({ text, onPress }: { text: string; onPress: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <Pressable onPress={onPress} onHoverIn={() => setHover(true)} onHoverOut={() => setHover(false)} accessibilityRole="button" style={[styles.option, hover && styles.optionHover]}>
      <Text variant="bodyStrong" color={hover ? 'onAccent' : 'textPrimary'}>
        {text}
      </Text>
    </Pressable>
  )
}

// Enquete da matéria: votar mostra os resultados (barras e porcentagem) e destaca o voto.
export default function Poll({ postId, poll }: { postId: number; poll: NewsPoll }) {
  const [voted, setVoted] = useState(() => loadVote(postId))
  const [extra, setExtra] = useState(0) // meu voto, somado ao que veio da API
  const votes = (id: number, base: number) => base + (id === voted ? extra : 0)
  const total = poll.options.reduce((sum, option) => sum + votes(option.id, option.votes), 0)

  function vote(optionId: number) {
    setVoted(optionId)
    setExtra(1)
    try {
      if (Platform.OS === 'web') localStorage.setItem(key(postId), String(optionId))
    } catch {
      // sem armazenamento: o voto vale só nesta leitura
    }
    apiRequest(`/api/v2/news/polls/options/${optionId}/vote`, { method: 'POST' }).catch(() => undefined)
  }

  return (
    <View style={styles.card}>
      <Text variant="heading" color="textPrimary" accessibilityRole="header">
        {poll.question}
      </Text>
      {poll.options.map((option) => {
        if (voted === null) return <Option key={option.id} text={option.text} onPress={() => vote(option.id)} />
        const count = votes(option.id, option.votes)
        const percent = total ? Math.round((count / total) * 100) : 0
        return (
          <View key={option.id} style={styles.result}>
            <View style={[styles.bar, option.id === voted && styles.barMine, { width: `${percent}%` }]} />
            <Text variant="bodyStrong" color="textPrimary" style={styles.resultText}>
              {option.text}
            </Text>
            <Text variant="bodyStrong" color="textPrimary" style={styles.resultText}>
              {percent}%
            </Text>
          </View>
        )
      })}
      {voted !== null && (
        <Text variant="small" color="textMuted">
          {total} {total === 1 ? 'voto' : 'votos'}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { gap: spacing.s, padding: spacing.l, borderRadius: radius.l, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceRaised },
  option: { minHeight: 48, paddingHorizontal: spacing.l, borderRadius: radius.m, justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  optionHover: { backgroundColor: colors.accent, borderColor: colors.accent },
  result: { minHeight: 48, borderRadius: radius.m, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.l, backgroundColor: colors.surface },
  bar: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: colors.surfaceHighlight },
  barMine: { backgroundColor: colors.accent },
  resultText: { zIndex: 1 },
})
