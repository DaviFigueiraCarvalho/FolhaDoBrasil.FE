import { ActivityIndicator, StyleSheet, View } from 'react-native'
import Text from './Text'
import { colors, spacing } from '../theme'

export interface LoadingStateProps {
  label?: string
  fullScreen?: boolean
}

export default function LoadingState({ label = 'Carregando…', fullScreen = false }: LoadingStateProps) {
  return (
    <View
      style={[styles.container, fullScreen && styles.fullScreen]}
      accessibilityRole="progressbar"
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator color={colors.primary} />
      <Text variant="label" color="textSecondary">
        {label}
      </Text>
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
  fullScreen: {
    flex: 1,
  },
})
