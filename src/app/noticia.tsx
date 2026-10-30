import { useLocalSearchParams } from 'expo-router'
import NewsScreen from '../features/news/NewsScreen'

// Link compartilhável de uma matéria: a home com a matéria já aberta no leitor.
export default function PostRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <NewsScreen postId={Number(id)} />
}
