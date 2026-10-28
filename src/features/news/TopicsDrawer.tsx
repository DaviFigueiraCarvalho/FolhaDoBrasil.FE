import { useEffect, useState } from 'react'
import { Animated, Easing, Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Text } from '../../components'
import { colors, radius, spacing } from '../../theme'
import type { NewsTopic } from './NewsBody'

const DRAWER_WIDTH = 300
const SLIDE_MS = 280

// Cabeçalho do site: botão hambúrguer + logo + título. O hambúrguer abre um menu lateral que desliza
// com um botão para o início e um para cada tópico (cada tópico é uma aba: rota /topico?id=).
export default function Masthead({ topics, activeTopicId }: { topics: NewsTopic[]; activeTopicId?: number }) {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [progress] = useState(() => new Animated.Value(0))
  const drawerWidth = Math.min(DRAWER_WIDTH, width * 0.85)

  useEffect(() => {
    Animated.timing(progress, { toValue: open ? 1 : 0, duration: SLIDE_MS, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(({ finished }) => {
      if (finished && !open) setMounted(false)
    })
  }, [open, progress])

  const go = (href: Parameters<typeof router.push>[0]) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <View style={styles.masthead}>
      <Pressable onPress={() => { setMounted(true); setOpen(true) }} accessibilityRole="button" accessibilityLabel="Abrir menu de tópicos" hitSlop={8} style={styles.burger}>
        <View style={styles.bar} />
        <View style={styles.bar} />
        <View style={styles.bar} />
      </Pressable>
      <Pressable onPress={() => router.push('/')} accessibilityRole="link" accessibilityLabel="Folha do Brasil, início" style={styles.brand}>
        <Image source={require('../../../assets/images/logo.png')} style={styles.logo} contentFit="contain" />
        <Text variant="display" color="textPrimary" accessibilityRole="header" numberOfLines={1} style={styles.title}>
          Folha do Brasil
        </Text>
      </Pressable>

      <Modal visible={mounted} transparent animationType="none" onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <View style={styles.root}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: progress }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Fechar menu" />
          </Animated.View>
          <Animated.View style={[styles.drawer, { width: drawerWidth, transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [-drawerWidth, 0] }) }] }]}>
            <View style={styles.drawerHeader}>
              <Text variant="heading" color="accent">
                Tópicos
              </Text>
              <Pressable onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Fechar menu" hitSlop={8} style={styles.closeBtn}>
                <Text variant="title" color="textPrimary">
                  ×
                </Text>
              </Pressable>
            </View>
            <TopicButton label="Início" active={activeTopicId === undefined} onPress={() => go('/')} />
            {topics.map((topic) => (
              <TopicButton
                key={topic.id}
                label={topic.name}
                active={topic.id === activeTopicId}
                onPress={() => go({ pathname: '/topico', params: { id: String(topic.id) } })}
              />
            ))}
          </Animated.View>
        </View>
      </Modal>
    </View>
  )
}

function TopicButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }} style={[styles.topic, active && styles.topicActive]}>
      <Text variant="bodyStrong" color={active ? 'onAccent' : 'textPrimary'}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  masthead: { flexDirection: 'row', alignItems: 'center', gap: spacing.m, paddingBottom: spacing.s, borderBottomWidth: 2, borderBottomColor: colors.accent },
  burger: { width: 44, height: 44, borderRadius: radius.s, alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: colors.surface },
  bar: { width: 22, height: 2, borderRadius: 1, backgroundColor: colors.textPrimary },
  brand: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.m },
  logo: { width: 48, height: 48, borderRadius: radius.s },
  title: { flexShrink: 1 },
  root: { flex: 1 },
  backdrop: { backgroundColor: 'rgba(3, 10, 28, 0.7)' },
  drawer: { position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: colors.backgroundAlt, borderRightWidth: 1, borderRightColor: colors.border, padding: spacing.l, gap: spacing.s },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.s },
  closeBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  topic: { minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.m, borderRadius: radius.s, backgroundColor: colors.surface },
  topicActive: { backgroundColor: colors.accent },
})
