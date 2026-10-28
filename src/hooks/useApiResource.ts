import { useCallback, useEffect, useRef, useState } from 'react'

interface SettledResult<T> {
  data: T | null
  error: unknown
  settledKey: string | null
}

export interface UseApiResourceResult<T> {
  data: T | null
  error: unknown
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

// Busca um recurso de leitura da API com loading/error/refetch consistentes. `fetcher` recebe um
// AbortSignal e deve retornar uma Promise com os dados já desserializados (ver src/api/httpClient.ts).
// `deps` funciona como o array de dependências de um efeito: mudar os deps refaz a busca.
//
// Nota de porte: a versão legada marcava "loading" com um setState síncrono logo no início do
// efeito. O eslint-plugin-react-hooks@7 (regras react-hooks/use-memo e
// react-hooks/set-state-in-effect, parte do "Rules of React" do React Compiler — não
// suprimíveis por eslint-disable comum) proíbe (a) array de dependências não-literal em
// useMemo/useCallback e (b) setState incondicional logo no corpo de um efeito. Por isso
// `isLoading` aqui é derivado durante o render (comparando a `key` atual com a última key que
// terminou de buscar), e o efeito só chama setState dentro do callback da Promise (quando o
// fetch realmente resolve) — o padrão que a própria regra recomenda.
export function useApiResource<T>(
  fetcher: (signal?: AbortSignal) => Promise<T>,
  deps: unknown[] = []
): UseApiResourceResult<T> {
  const [reloadToken, setReloadToken] = useState(0)
  const key = `${JSON.stringify(deps)}:${reloadToken}`

  const [settled, setSettled] = useState<SettledResult<T>>({ data: null, error: null, settledKey: null })
  const fetcherRef = useRef(fetcher)
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    const controller = new AbortController()
    fetcherRef.current(controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return
        setSettled({ data, error: null, settledKey: key })
      },
      (error) => {
        if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) return
        setSettled({ data: null, error, settledKey: key })
      }
    )
    return () => controller.abort()
    // `deps` é repassado pelo chamador (mesmo contrato do array de deps de um efeito), tamanho
    // variável por natureza; `key` é só a serialização de `deps` + reloadToken, dependência
    // redundante do ponto de vista de reatividade.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken])

  const refetch = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const isLoading = settled.settledKey !== key

  return {
    data: settled.data,
    error: isLoading ? null : settled.error,
    isLoading,
    isError: !isLoading && settled.error != null,
    refetch,
  }
}
