export const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

function distance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const current = [i]
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    previous = current
  }
  return previous[b.length]
}

// Busca de tópicos tolerante a erro: ignora acento/caixa, aceita prefixo ou trecho e até 1–2 letras erradas
// (conforme o tamanho do que foi digitado). Melhor correspondência primeiro; sem texto devolve tudo.
export function searchTopics<T extends { name: string }>(query: string, items: T[]): T[] {
  const q = normalize(query)
  if (!q) return items
  const tolerance = q.length <= 2 ? 0 : q.length <= 4 ? 1 : 2
  return items
    .map((item) => {
      const name = normalize(item.name)
      if (name.startsWith(q)) return { item, score: 0 }
      if (name.includes(q)) return { item, score: 1 }
      const best = Math.min(distance(q, name), distance(q, name.slice(0, q.length)), ...name.split(/\s+/).map((word) => distance(q, word)))
      return { item, score: best <= tolerance ? 2 + best : Infinity }
    })
    .filter((entry) => entry.score !== Infinity)
    .sort((a, b) => a.score - b.score || a.item.name.localeCompare(b.item.name))
    .map((entry) => entry.item)
}

export type Period = 'all' | 'day' | 'week' | 'year'

// Filtro das "Últimas notícias": hoje (mesma data), últimos 7 dias, ano corrente.
export function inPeriod(publishedAtUtc: string, period: Period, now = new Date()): boolean {
  if (period === 'all') return true
  const date = new Date(publishedAtUtc)
  if (period === 'day') return date.toDateString() === now.toDateString()
  if (period === 'week') return now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000
  return date.getFullYear() === now.getFullYear()
}
