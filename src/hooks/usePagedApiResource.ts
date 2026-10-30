import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../api/httpClient'
import type { UseApiResourceResult } from './useApiResource'

const PAGE_SIZE = 50
const MAX_PAGES = 1000

interface Settled<T> {
  items: T[] | null
  error: unknown
  settledKey: string | null
}

// Carrega uma listagem paginada (page/pageSize) aos poucos: a 1ª página já libera a tela e as
// seguintes vão sendo anexadas em segundo plano até a primeira página incompleta. Mesmo contrato
// de useApiResource (isLoading só enquanto a 1ª página não chega). Falha depois da 1ª página
// mantém o que já foi carregado.
export function usePagedApiResource<T>(path: string, pageSize = PAGE_SIZE): UseApiResourceResult<T[]> {
  const [reloadToken, setReloadToken] = useState(0)
  const key = `${path}:${pageSize}:${reloadToken}`
  const [settled, setSettled] = useState<Settled<T>>({ items: null, error: null, settledKey: null })

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    const sep = path.includes('?') ? '&' : '?'
    let loaded: T[] = []

    void (async () => {
      for (let page = 1; page <= MAX_PAGES; page++) {
        const items = await apiRequest<T[]>(`${path}${sep}page=${page}&pageSize=${pageSize}`, { signal })
        if (signal.aborted) return
        loaded = [...loaded, ...items]
        setSettled({ items: loaded, error: null, settledKey: key })
        if (items.length < pageSize) return
      }
    })().catch((error: unknown) => {
      if (signal.aborted || (error instanceof Error && error.name === 'AbortError')) return
      if (loaded.length === 0) setSettled({ items: null, error, settledKey: key })
    })

    return () => controller.abort()
  }, [path, pageSize, key])

  const refetch = useCallback(() => setReloadToken((token) => token + 1), [])
  const isLoading = settled.settledKey !== key

  return {
    data: settled.items,
    error: isLoading ? null : settled.error,
    isLoading,
    isError: !isLoading && settled.error != null,
    refetch,
  }
}
