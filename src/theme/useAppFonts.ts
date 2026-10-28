import { useFonts } from 'expo-font'
import { PlayfairDisplay_700Bold, PlayfairDisplay_900Black } from '@expo-google-fonts/playfair-display'
import { Manrope_400Regular, Manrope_500Medium, Manrope_700Bold } from '@expo-google-fonts/manrope'

// Nomes batem com src/theme/typography.ts (fontFamily.*).
export function useAppFonts() {
  return useFonts({ PlayfairDisplay_700Bold, PlayfairDisplay_900Black, Manrope_400Regular, Manrope_500Medium, Manrope_700Bold })
}
