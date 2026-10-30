import { useEffect, useState } from 'react'
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native'
import { Text } from '../../components'
import { colors, radius, spacing } from '../../theme'
import { fetchQuotes, formatChange, formatPrice, type Quote } from './quotes'

const REFRESH_MS = 60_000
const PX_PER_SECOND = 40

function Items({ quotes }: { quotes: Quote[] }) {
  return (
    <View style={styles.items}>
      {quotes.map((quote) => (
        <View key={quote.symbol} style={styles.item}>
          <Text variant="label" color="textSecondary">
            {quote.label}
          </Text>
          <Text variant="label" color="textPrimary">
            {formatPrice(quote.price)}
          </Text>
          <Text variant="label" color={quote.changePct >= 0 ? 'success' : 'danger'}>
            {formatChange(quote.changePct)}
          </Text>
        </View>
      ))}
    </View>
  )
}

// Faixa no topo com dólar, euro, bitcoin e algumas ações da B3, em rolagem contínua. Atualiza a cada
// minuto; se nenhuma fonte responder a faixa some (nunca mostra dado vazio ou antigo sem aviso).
export default function MarketTicker() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [contentWidth, setContentWidth] = useState(0)
  const [offset] = useState(() => new Animated.Value(0))

  useEffect(() => {
    const controller = new AbortController()
    const load = () =>
      fetchQuotes(controller.signal).then(
        (next) => {
          if (!controller.signal.aborted && next.length > 0) setQuotes(next)
        },
        () => undefined
      )
    void load()
    const timer = setInterval(() => void load(), REFRESH_MS)
    return () => {
      controller.abort()
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (contentWidth === 0) return
    offset.setValue(0)
    const loop = Animated.loop(
      Animated.timing(offset, {
        toValue: -contentWidth,
        duration: (contentWidth / PX_PER_SECOND) * 1000,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      })
    )
    loop.start()
    return () => loop.stop()
  }, [contentWidth, offset])

  if (quotes.length === 0) return null

  const summary = quotes.map((quote) => `${quote.label} ${formatPrice(quote.price)} ${formatChange(quote.changePct)}`).join(', ')

  return (
    <View style={styles.bar} accessibilityRole="text" accessibilityLabel={`Cotações: ${summary}`}>
      <Animated.View style={[styles.track, { transform: [{ translateX: offset }] }]} importantForAccessibility="no-hide-descendants">
        <View onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}>
          <Items quotes={quotes} />
        </View>
        <Items quotes={quotes} />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderRadius: radius.s,
    paddingVertical: spacing.xs,
    marginBottom: spacing.s,
  },
  track: { flexDirection: 'row', alignSelf: 'flex-start' },
  items: { flexDirection: 'row' },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.m },
})
