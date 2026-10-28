import { StyleSheet, View } from 'react-native'
import Text from './Text'
import Button from './Button'
import { spacing } from '../theme'

export interface DisplayableError {
  status?: number | null
  detail?: string | null
  message?: string
  traceId?: string | null
}

export interface ErrorStateProps {
  title?: string
  error?: DisplayableError | null
  onRetry?: () => void
}

export default function ErrorState({ title = 'Algo deu errado', error, onRetry }: ErrorStateProps) {
  const message = error?.detail || error?.message || 'Tente novamente em instantes.'
  const traceId = error?.traceId

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text variant="heading" color="textPrimary">
        {title}
      </Text>
      <Text variant="body" color="textSecondary">
        {message}
      </Text>
      {traceId && (
        <Text variant="small" color="textMuted">
          ID de rastreio: {traceId}
        </Text>
      )}
      {onRetry && (
        <Button variant="secondary" onPress={onRetry} style={styles.retry}>
          Tentar novamente
        </Button>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    paddingVertical: spacing.xl,
  },
  retry: {
    marginTop: spacing.s,
  },
})
