import { Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Text } from '../../components'
import { colors, radius, spacing } from '../../theme'

// Volta para a tela anterior; se a página foi aberta direto (sem histórico), vai para o início.
export default function BackButton() {
  const router = useRouter()
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      style={styles.button}
    >
      <Text variant="label" color="textPrimary">
        ‹ Voltar
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: { alignSelf: 'flex-start', minHeight: 40, paddingHorizontal: spacing.m, borderRadius: radius.s, justifyContent: 'center', backgroundColor: colors.surface },
})
