import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { colors, useAppFonts } from '../theme'

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts()

  // Evita flash de fonte do sistema; erro de fonte não trava o app (cai para a fonte do SO).
  if (!fontsLoaded && !fontError) return <View style={{ flex: 1, backgroundColor: colors.background }} />

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, title: 'Folha do Brasil' }} />
    </SafeAreaProvider>
  )
}
