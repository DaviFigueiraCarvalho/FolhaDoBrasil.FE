import { useState } from 'react'
import { Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native'
import { Text } from '../../components'
import { colors, radius, spacing } from '../../theme'
import AdSlot from '../ads/AdSlot'
import { NewsBody, PostImage, type NewsPost } from './NewsBody'
import { formatPublished, timeSince } from './dates'
import Poll from './Poll'
import ShareButtons from './ShareButtons'
import YouTubeEmbed from './YouTubeEmbed'
import { youTubeId } from './youtube'

const SIZES = [14, 16, 18, 20, 22, 26]
const DEFAULT_SIZE = 2 // índice em SIZES (18)
const STORAGE_KEY = 'fdb.readerSize'
const WIDE_BREAKPOINT = 768
const WIDE_COLUMN = '75%' // mesma proporção do site de referência: 12,5% de margem de cada lado

function loadSize() {
  try {
    const saved = Platform.OS === 'web' ? Number(localStorage.getItem(STORAGE_KEY)) : NaN
    return saved >= 0 && saved < SIZES.length ? saved : DEFAULT_SIZE
  } catch {
    return DEFAULT_SIZE
  }
}

function Chip({ label, onPress, disabled, accessibilityLabel }: { label: string; onPress?: () => void; disabled?: boolean; accessibilityLabel?: string }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label} style={[styles.chip, disabled && styles.disabled]}>
      <Text variant="label" color="textPrimary">
        {label}
      </Text>
    </Pressable>
  )
}

// Leitor: título e assinatura à esquerda (autor, data e "atualizado há…"), botões de compartilhar, vídeo, texto
// justificado com tamanho ajustável (lembrado no aparelho), enquete e o anúncio depois do texto.
export default function Reader({ post, onBack }: { post: NewsPost; onBack: () => void }) {
  const [size, setSize] = useState(loadSize)
  const { width } = useWindowDimensions()
  const [now] = useState(() => Date.now()) // "atualizado há…" é calculado ao abrir a matéria
  const videoId = youTubeId(post.videoUrl)
  const resize = (delta: number) => {
    const next = Math.min(SIZES.length - 1, Math.max(0, size + delta))
    setSize(next)
    try {
      if (Platform.OS === 'web') localStorage.setItem(STORAGE_KEY, String(next))
    } catch {
      // sem armazenamento (janela privada): vale só nesta leitura
    }
  }

  const nav = (
    <View style={styles.row}>
      <Chip label="← Voltar" onPress={onBack} />
    </View>
  )

  return (
    <View style={[styles.column, { width: width >= WIDE_BREAKPOINT ? WIDE_COLUMN : '100%' }]}>
      {nav}
      <Text variant="display" color="textPrimary" accessibilityRole="header" style={width >= WIDE_BREAKPOINT ? styles.titleWide : styles.titleNarrow}>
        {post.title}
      </Text>
      {post.author && (
        <Text variant="bodyStrong" color="textMuted">
          Por <Text variant="bodyStrong" color="accentDim">{post.author}</Text>
        </Text>
      )}
      <Text variant="small" color="textMuted">
        {formatPublished(post.publishedAtUtc)} · Atualizado {timeSince(post.updatedAtUtc, now)}
      </Text>
      <ShareButtons id={post.id} title={post.title} />
      <View style={styles.rowCenter}>
        <Chip label="A−" accessibilityLabel="Diminuir texto" onPress={() => resize(-1)} disabled={size === 0} />
        <Chip label="A+" accessibilityLabel="Aumentar texto" onPress={() => resize(1)} disabled={size === SIZES.length - 1} />
      </View>
      {post.imageUrl && <PostImage uri={post.imageUrl} />}
      {videoId && <YouTubeEmbed videoId={videoId} />}
      <NewsBody body={post.body} fontSize={SIZES[size]} />
      {post.poll && <Poll key={post.id} postId={post.id} poll={post.poll} />}
      <AdSlot name="article" />
      {nav}
    </View>
  )
}

const styles = StyleSheet.create({
  column: { alignSelf: 'center', gap: spacing.m },
  titleWide: { fontSize: 40, lineHeight: 46 },
  titleNarrow: { fontSize: 30, lineHeight: 36 },
  row: { flexDirection: 'row', justifyContent: 'flex-start' },
  rowCenter: { flexDirection: 'row', justifyContent: 'center', gap: spacing.s },
  chip: { minHeight: 40, minWidth: 48, paddingHorizontal: spacing.l, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  disabled: { opacity: 0.4 },
})
