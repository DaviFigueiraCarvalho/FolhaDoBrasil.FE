import { useLocalSearchParams } from 'expo-router'
import NewsScreen from '../features/news/NewsScreen'

export default function TopicRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <NewsScreen topicId={Number(id)} />
}
