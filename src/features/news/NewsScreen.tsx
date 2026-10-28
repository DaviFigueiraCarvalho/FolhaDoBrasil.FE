import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions, type DimensionValue, type ViewStyle } from 'react-native'
import { Image } from 'expo-image'
import WebPortal from '../../platform/WebPortal'
import { AsyncState, Screen, Surface, Text } from '../../components'
import type { DisplayableError } from '../../components/ErrorState'
import { apiRequest } from '../../api/httpClient'
import { useApiResource } from '../../hooks/useApiResource'
import { formatDateTime } from '../../utils/format'
import { colors, radius, spacing } from '../../theme'
import FeaturedCarousel from './FeaturedCarousel'
import Masthead from './Masthead'
import TopicColumns from './TopicColumns'
import TopicSearch from './TopicSearch'
import PostRow from './PostRow'
import BackButton from './BackButton'
import { inPeriod, searchTopics, type Period } from './search'
import { useRouter } from 'expo-router'
import { registerView } from './registerView'
import { NewsBody, PostImage, coverUrl, excerpt, type NewsPost, type NewsTopic } from './NewsBody'

const HOVER_DELAY_MS = 250
const TOP_COUNT = 5
const LATEST_COUNT = 10
const PERIODS: { key: Period; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'day', label: 'Hoje' },
  { key: 'week', label: 'Semana' },
  { key: 'year', label: 'Ano' },
]
const SCROLL_IDLE_MS = 150 // sem rolar por isso = "parou de rolar"

// Colunas por largura: celular 2–3, desktop 4–5. A prévia do texto só cabe do desktop em diante.
function useGrid() {
  const { width } = useWindowDimensions()
  const columns = width >= 1280 ? 5 : width >= 900 ? 4 : width >= 600 ? 3 : 2
  return { columns, showExcerpt: width >= 900 }
}

function NewsCard({
  post,
  cardWidth,
  showExcerpt,
  onHover,
  onPress,
}: {
  post: NewsPost
  cardWidth: DimensionValue
  showExcerpt: boolean
  onHover: (hovering: boolean) => void
  onPress: () => void
}) {
  const cover = coverUrl(post)
  return (
    <View style={[styles.cell, { width: cardWidth }]}>
      <Pressable
        onPress={onPress}
        onHoverIn={() => onHover(true)}
        onHoverOut={() => onHover(false)}
        accessibilityRole="button"
        accessibilityLabel={post.title}
        style={styles.pressable}
      >
        <Surface level="raised" style={styles.card}>
          {cover ? <Image source={{ uri: cover }} style={styles.cover} contentFit="cover" /> : <View style={[styles.cover, styles.coverEmpty]} />}
          <View style={styles.cardText}>
            <Text variant="heading" color="textPrimary" numberOfLines={2}>
              {post.title}
            </Text>
            {showExcerpt && (
              <Text variant="small" color="textSecondary" numberOfLines={3}>
                {excerpt(post.body)}
              </Text>
            )}
          </View>
        </Surface>
      </Pressable>
    </View>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="title" color="textPrimary" accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  )
}

function FullPost({ post }: { post: NewsPost }) {
  // Só a capa explícita: a do card pode ser a 1ª imagem do corpo, que já aparece no texto.
  return (
    <View style={styles.fullPanel}>
      {post.imageUrl && <PostImage uri={post.imageUrl} />}
      <Text variant="title" color="textPrimary">
        {post.title}
      </Text>
      <Text variant="small" color="textMuted">
        {formatDateTime(post.publishedAtUtc)}
      </Text>
      <NewsBody body={post.body} />
    </View>
  )
}

// GET /api/v2/news — público (50 mais recentes). Grid de miniaturas; no desktop, passar o mouse mostra
// a notícia em tela cheia (só enquanto o mouse está no card) e clicar/tocar fixa em tela cheia.
export default function NewsScreen({ topicId, allTopics = false, latest = false }: { topicId?: number; allTopics?: boolean; latest?: boolean }) {
  const { data: posts, isLoading, isError, error, refetch } = useApiResource(
    (signal) => apiRequest<NewsPost[]>('/api/v2/news', { signal }),
    [],
  )
  const { data: topicList } = useApiResource((signal) => apiRequest<NewsTopic[]>('/api/v2/news/topics', { signal }), [])
  const router = useRouter()
  const { columns, showExcerpt } = useGrid()
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [pinned, setPinned] = useState<NewsPost | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  // Web: o Modal do RN não captura Esc de forma confiável; fecha a notícia fixada explicitamente.
  useEffect(() => {
    if (Platform.OS !== 'web' || !pinned) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && closePinned()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [pinned])

  // Fecha um instante depois do toque/clique: se o modal some no mouseup, o navegador entrega o `click`
  // ao elemento que estava embaixo (ex.: um card ou o botão do cabeçalho).
  function closePinned() {
    setTimeout(() => setPinned(null), 80)
  }

  // Web: enquanto rola (roda do mouse ou barra), o hover fica desligado; ao parar, volta no card que
  // estiver sob o mouse. `overId` guarda esse card mesmo durante a rolagem.
  const scrolling = useRef(false)
  const overId = useRef<number | null>(null)
  const scrollIdle = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleHover(id: number, hovering: boolean) {
    if (timer.current) clearTimeout(timer.current)
    if (hovering) {
      overId.current = id
      if (!scrolling.current) timer.current = setTimeout(() => setHoveredId(id), HOVER_DELAY_MS)
    } else {
      if (overId.current === id) overId.current = null
      setHoveredId((current) => (current === id ? null : current))
    }
  }

  useEffect(() => {
    if (Platform.OS !== 'web') return
    const onScroll = () => {
      if (!scrolling.current) {
        scrolling.current = true
        if (timer.current) clearTimeout(timer.current)
        setHoveredId(null)
      }
      if (scrollIdle.current) clearTimeout(scrollIdle.current)
      scrollIdle.current = setTimeout(() => {
        scrolling.current = false
        if (overId.current !== null) handleHover(overId.current, true)
      }, SCROLL_IDLE_MS)
    }
    // `scroll` não borbulha, então a captura pega qualquer contêiner rolável (inclusive o do Screen).
    window.addEventListener('wheel', onScroll, { passive: true })
    window.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => {
      window.removeEventListener('wheel', onScroll)
      window.removeEventListener('scroll', onScroll, { capture: true })
      if (scrollIdle.current) clearTimeout(scrollIdle.current)
    }
  }, [])

  const topics = topicList ?? []
  const all = posts ?? []
  // Mais acessados primeiro (empate: o mais novo). Só na home; quem está no carrossel não repete abaixo.
  const top =
    topicId === undefined && !allTopics && !latest
      ? [...all].sort((a, b) => b.viewCount - a.viewCount || b.publishedAtUtc.localeCompare(a.publishedAtUtc)).slice(0, TOP_COUNT)
      : []
  const inCarousel = new Set(top.map((post) => post.id))
  const rest = all.filter((post) => !inCarousel.has(post.id))
  const topicName = topics.find((topic) => topic.id === topicId)?.name
  const topicPosts = all.filter((post) => post.topicId === topicId)
  const sections = topics.map((topic) => ({ topic, posts: rest.filter((post) => post.topicId === topic.id) })).filter((section) => section.posts.length > 0)
  const allSections = topics.map((topic) => ({ topic, posts: all.filter((post) => post.topicId === topic.id) })).filter((section) => section.posts.length > 0)
  const latestRow = [...rest].sort((a, b) => b.publishedAtUtc.localeCompare(a.publishedAtUtc)).slice(0, LATEST_COUNT)
  const [query, setQuery] = useState('')
  const [period, setPeriod] = useState<Period>('all')
  const matches = searchTopics(query, topics)
  const matchedIds = new Set(matches.map((topic) => topic.id))
  const visibleSections = query.trim() ? allSections.filter((section) => matchedIds.has(section.topic.id)) : allSections
  const latestAll = [...all].sort((a, b) => b.publishedAtUtc.localeCompare(a.publishedAtUtc)).filter((post) => inPeriod(post.publishedAtUtc, period))

  function openPost(post: NewsPost) {
    setHoveredId(null)
    setPinned(post)
    registerView(post.id)
  }

  const card = (post: NewsPost, cardWidth: DimensionValue) => (
    <NewsCard key={post.id} post={post} cardWidth={cardWidth} showExcerpt={showExcerpt} onHover={(hovering) => handleHover(post.id, hovering)} onPress={() => openPost(post)} />
  )
  const gridWidth: DimensionValue = `${100 / columns}%`
  const hoveredPost = pinned ? null : (posts?.find((post) => post.id === hoveredId) ?? null)

  return (
    <Screen scroll edges={['left', 'right']}>
      <Masthead />
      {(topicId !== undefined || allTopics || latest) && <BackButton />}

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error as DisplayableError | null}
        onRetry={refetch}
        isEmpty={!isLoading && !isError && all.length === 0}
        emptyTitle="Sem notícias"
        emptyDescription="Nada publicado por enquanto."
        loadingLabel="Carregando notícias…"
      >
        {topicId !== undefined ? (
          <Section title={topicName ?? 'Tópico'}>
            {topicPosts.length === 0 ? (
              <Text variant="body" color="textSecondary">
                Nenhuma notícia neste tópico por enquanto.
              </Text>
            ) : (
              <View style={styles.grid}>{topicPosts.map((post) => card(post, gridWidth))}</View>
            )}
          </Section>
        ) : latest ? (
          <Section title="Últimas notícias">
            <View style={styles.chips}>
              {PERIODS.map(({ key, label }) => (
                <Pressable key={key} onPress={() => setPeriod(key)} accessibilityRole="button" accessibilityState={{ selected: period === key }} style={[styles.chip, period === key && styles.chipActive]}>
                  <Text variant="label" color={period === key ? 'onAccent' : 'textPrimary'}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {latestAll.length === 0 ? (
              <Text variant="body" color="textSecondary">
                Nenhuma notícia neste período.
              </Text>
            ) : (
              <View style={styles.grid}>{latestAll.map((post) => card(post, gridWidth))}</View>
            )}
          </Section>
        ) : allTopics ? (
          <>
          <TopicSearch
            query={query}
            onChange={setQuery}
            matches={matches}
            onPick={(topic) => router.push({ pathname: '/topico', params: { id: String(topic.id) } })}
          />
          <TopicColumns
            wrap
            sections={visibleSections}
            onHover={(post, hovering) => handleHover(post.id, hovering)}
            onOpen={openPost}
            onSeeAll={(topic) => router.push({ pathname: '/topico', params: { id: String(topic.id) } })}
          />
          </>
        ) : (
          <>
            {top.length > 0 && (
              <Section title="Notícias Mais Relevantes">
                <FeaturedCarousel posts={top} onOpen={openPost} />
              </Section>
            )}
            {latestRow.length > 0 && (
              <PostRow title="Últimas notícias" posts={latestRow} renderCard={card} actionLabel="Ver todas as últimas notícias" onAction={() => router.push('/ultimas')} />
            )}
            {sections.length > 0 && (
              <TopicColumns
                sections={sections}
                onHover={(post, hovering) => handleHover(post.id, hovering)}
                onOpen={openPost}
                onSeeAll={(topic) => router.push({ pathname: '/topico', params: { id: String(topic.id) } })}
                onSeeAllTopics={() => router.push('/topicos')}
              />
            )}
          </>
        )}
      </AsyncState>

      {/* Prévia por hover (web): tela cheia, mas sem capturar o mouse — assim o hover continua no card
          e a prévia some assim que o mouse sai dele. */}
      {/* Portal no <body>: o `fixed` precisa escapar dos contêineres do layout para cobrir a tela toda. */}
      {hoveredPost && (
        <WebPortal>
          <View style={[styles.hoverOverlay, WEB_FIXED]} pointerEvents="none">
            <ScrollView scrollEnabled={false} contentContainerStyle={styles.fullScroll}>
              <FullPost post={hoveredPost} />
            </ScrollView>
          </View>
        </WebPortal>
      )}

      {/* Fixada: tela cheia rolável; fecha no ×, tocando fora do painel ou com Esc/voltar. */}
      <Modal visible={pinned !== null} transparent animationType="fade" onRequestClose={closePinned} statusBarTranslucent>
        <Pressable style={styles.pinnedBackdrop} onPress={closePinned} accessibilityRole="none">
          <ScrollView contentContainerStyle={styles.fullScroll} onStartShouldSetResponder={() => true}>
            <Pressable onPress={(event) => event.stopPropagation()} accessibilityRole="none" style={styles.fullWrap}>
              {pinned && <FullPost post={pinned} />}
            </Pressable>
          </ScrollView>
          <Pressable onPress={closePinned} accessibilityRole="button" accessibilityLabel="Fechar" hitSlop={8} style={styles.close}>
            <Text variant="title" color="textPrimary">
              ×
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  )
}

// RN Web aceita position: 'fixed'; os tipos do RN não.
const WEB_FIXED = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 } as unknown as ViewStyle

const styles = StyleSheet.create({
  section: { gap: spacing.s },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s },
  chip: { minHeight: 40, paddingHorizontal: spacing.l, borderRadius: radius.full, justifyContent: 'center', backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.accent },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  cell: { padding: spacing.xs },
  pressable: { flex: 1 },
  card: { flex: 1, padding: 0, overflow: 'hidden', gap: 0 },
  cover: { width: '100%', aspectRatio: 4 / 3 },
  coverEmpty: { backgroundColor: colors.surfaceHighlight },
  cardText: { padding: spacing.s, gap: spacing.xs },
  hoverOverlay: { backgroundColor: 'rgba(12, 11, 16, 0.94)', zIndex: 1000 },
  pinnedBackdrop: { flex: 1, backgroundColor: 'rgba(12, 11, 16, 0.94)' },
  fullScroll: { alignItems: 'center', padding: spacing.l, paddingTop: spacing.xxxl },
  fullWrap: { width: '100%', maxWidth: 900 },
  fullPanel: { width: '100%', maxWidth: 900, gap: spacing.s },
  close: { position: 'absolute', top: spacing.m, right: spacing.l, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full },
})
