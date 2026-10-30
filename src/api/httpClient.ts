import { ApiError, NetworkError, apiErrorFromResponse } from './apiError'

// Sem EXPO_PUBLIC_API_BASE_URL (sem barra final), as chamadas vão para a mesma origem.
// O Expo embute o valor no build: mudou a variável, refaça o build limpando o cache do Metro.
const BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/+$/, '')

export interface ApiRequestOptions {
  method?: 'GET' | 'POST'
  signal?: AbortSignal
}

// Só chamadas públicas (leituras e a contagem de acessos): o site de notícias não tem login nem token.
export async function apiRequest<T = unknown>(path: string, { method = 'GET', signal }: ApiRequestOptions = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, { method, headers: { Accept: 'application/json' }, signal })
  } catch (cause) {
    if (cause instanceof Error && cause.name === 'AbortError') throw cause
    throw new NetworkError(cause)
  }

  const text = await response.text()
  let body: unknown = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }

  if (!response.ok) throw apiErrorFromResponse(response.status, body)
  return body as T
}

export { ApiError, NetworkError }
