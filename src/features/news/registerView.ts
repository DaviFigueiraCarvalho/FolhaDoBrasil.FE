import { apiRequest } from '../../api/httpClient'

const counted = new Set<number>()

// Conta a abertura de uma notícia (ranking "Mais Relevantes"), no máximo uma vez por post e por sessão.
export function registerView(id: number): void {
  if (counted.has(id)) return
  counted.add(id)
  apiRequest(`/api/v2/news/${id}/view`, { method: 'POST' }).catch(() => counted.delete(id))
}
