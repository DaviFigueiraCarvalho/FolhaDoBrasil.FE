import { createElement, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '../../components'
import { colors, radius, spacing } from '../../theme'
import { ADS, type AdSlotName } from './adsConfig'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

// Bloco de anúncio com altura reservada (a página não pula quando o anúncio carrega). Sem `slot`
// configurado: só o espaço reservado em desenvolvimento, nada em produção.
export default function AdSlot({ name }: { name: AdSlotName }) {
  const { slot, minHeight } = ADS.slots[name]

  useEffect(() => {
    if (!slot) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle ?? []).push({})
    } catch {
      // script do AdSense bloqueado (adblock): o espaço fica vazio
    }
  }, [slot])

  if (!slot && !__DEV__) return null
  return (
    <View style={styles.wrap} accessibilityRole="none">
      <Text variant="small" color="textFaint">
        Publicidade
      </Text>
      <View style={[styles.box, { minHeight }]}>
        {slot ? (
          createElement('ins', {
            className: 'adsbygoogle',
            style: { display: 'block', width: '100%' },
            'data-ad-client': ADS.publisherId,
            'data-ad-slot': slot,
            'data-ad-format': 'auto',
            'data-full-width-responsive': 'true',
          })
        ) : (
          <Text variant="small" color="textFaint">
            Espaço reservado — {name}
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: spacing.xs, marginVertical: spacing.l },
  box: { width: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: radius.m, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, overflow: 'hidden' },
})
