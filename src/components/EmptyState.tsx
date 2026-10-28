import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import Text from './Text'
import { spacing } from '../theme'

export interface EmptyStateProps {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {title && (
        <Text variant="heading" color="textPrimary">
          {title}
        </Text>
      )}
      {description && (
        <Text variant="body" color="textSecondary">
          {description}
        </Text>
      )}
      {action && <View style={styles.action}>{action}</View>}
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
  action: {
    marginTop: spacing.s,
  },
})
