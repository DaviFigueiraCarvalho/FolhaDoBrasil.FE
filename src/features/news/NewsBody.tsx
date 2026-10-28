import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'
import { Text } from '../../components'
import { spacing } from '../../theme'
import { parseNews, type Inline } from './parseNews'

export interface NewsPost {
  id: number
  title: string
  body: string
  imageUrl: string | null
  publishedAtUtc: string
  viewCount: number
  topicId: number | null
}

export interface NewsTopic {
  id: number
  name: string
}

/** Capa da notícia: `imageUrl` ou, na falta dela, a primeira imagem do corpo. */
export function coverUrl(post: NewsPost): string | null {
  if (post.imageUrl) return post.imageUrl
  const image = parseNews(post.body).find((block) => block.type === 'image')
  return image?.type === 'image' ? image.url : null
}

/** Prévia em texto puro (sem marcação nem imagens) para os cards. */
export function excerpt(body: string): string {
  return parseNews(body)
    .flatMap((block) => (block.type === 'image' ? [] : [block.inline.map((part) => part.text).join('')]))
    .join(' ')
}

// A largura é parametrizada; a altura segue a proporção original da imagem (sem corte).
export function PostImage({ uri, width = '100%' }: { uri: string; width?: `${number}%` }) {
  const [ratio, setRatio] = useState(1)
  return (
    <Image
      source={{ uri }}
      style={[styles.image, { width, aspectRatio: ratio }]}
      contentFit="contain"
      onLoad={(e) => e.source.height && setRatio(e.source.width / e.source.height)}
    />
  )
}

const HEADING_SIZE = [30, 24, 20, 17, 15, 13]

function Inlines({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((part, index) => (
        <Text
          key={index}
          variant={part.bold ? 'bodyStrong' : 'body'}
          color="textSecondary"
          style={part.italic ? styles.italic : undefined}
        >
          {part.text}
        </Text>
      ))}
    </>
  )
}

// Corpo em mini-Markdown (ver parseNews.ts): títulos 1–6, negrito, itálico e imagens em qualquer lugar.
export function NewsBody({ body }: { body: string }) {
  return (
    <View style={styles.body}>
      {parseNews(body).map((block, index) => {
        if (block.type === 'image') return <PostImage key={index} uri={block.url} />
        if (block.type === 'heading') {
          const size = HEADING_SIZE[block.level - 1] ?? 15
          return (
            <Text key={index} variant="heading" color="textPrimary" accessibilityRole="header" style={{ fontSize: size, lineHeight: size + 6 }}>
              {block.inline.map((part) => part.text).join('')}
            </Text>
          )
        }
        return (
          <Text key={index} variant="body" color="textSecondary">
            <Inlines parts={block.inline} />
          </Text>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  body: { gap: spacing.xs },
  italic: { fontStyle: 'italic' },
  // maxHeight: imagens altas/quadradas não podem passar da tela; contentFit "contain" mantém a proporção.
  image: { borderRadius: 8, alignSelf: 'center', maxHeight: 480 },
})
