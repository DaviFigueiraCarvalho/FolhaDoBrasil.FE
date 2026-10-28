import { Pressable, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Text } from '../../components'
import { colors, radius, spacing } from '../../theme'

export default function Masthead() {
  const router = useRouter()
  return (
    <Pressable onPress={() => router.push('/')} accessibilityRole="link" accessibilityLabel="Folha do Brasil, início" style={styles.masthead}>
      <Image source={require('../../../assets/images/logo.png')} style={styles.logo} contentFit="contain" />
      <Text variant="display" color="textPrimary" accessibilityRole="header" numberOfLines={1} style={styles.title}>
        Folha do Brasil
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  masthead: { flexDirection: 'row', alignItems: 'center', gap: spacing.m, paddingBottom: spacing.s, borderBottomWidth: 2, borderBottomColor: colors.accent },
  logo: { width: 56, height: 56, borderRadius: radius.s },
  title: { flexShrink: 1 },
})
