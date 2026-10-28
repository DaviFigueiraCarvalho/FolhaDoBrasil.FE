import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'
import { colors, spacing } from '../theme'

export interface ScreenProps {
  children?: ReactNode
  scroll?: boolean
  avoidKeyboard?: boolean
  edges?: Edge[]
  contentStyle?: ViewStyle
  style?: ViewStyle
}

// Casca de tela padrão: safe area + fundo da identidade VOID·MMA + teclado tratado. Toda rota em
// src/app deve renderizar dentro de um <Screen>, nunca de um <View> cru (senão o topo/base
// invadem a status bar/gesture area em telas com notch).
export default function Screen({ children, scroll = false, avoidKeyboard = true, edges, contentStyle, style }: ScreenProps) {
  const content = scroll ? (
    <ScrollView
      style={styles.flexFill}
      contentContainerStyle={[styles.content, styles.scrollContent, contentStyle]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.flexFill, contentStyle]}>{children}</View>
  )

  const body = avoidKeyboard ? (
    <KeyboardAvoidingView
      style={styles.flexFill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  )

  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={edges}>
      {body}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flexFill: {
    flex: 1,
  },
  content: {
    padding: spacing.l,
    gap: spacing.l,
  },
  scrollContent: {
    flexGrow: 1,
  },
})
