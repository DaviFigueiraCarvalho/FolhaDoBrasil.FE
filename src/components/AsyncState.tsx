import type { ReactNode } from 'react'
import LoadingState from './LoadingState'
import ErrorState, { type DisplayableError } from './ErrorState'
import EmptyState from './EmptyState'

export interface AsyncStateProps {
  isLoading?: boolean
  isError?: boolean
  error?: DisplayableError | null
  onRetry?: () => void
  isEmpty?: boolean
  emptyTitle?: ReactNode
  emptyDescription?: ReactNode
  loadingLabel?: string
  children?: ReactNode
}

// Porte 1:1 do AsyncState.tsx legado (mesma árvore de decisão loading/error(403)/empty/content) —
// só a implementação de cada estado mudou de DOM para React Native.
export default function AsyncState({
  isLoading,
  isError,
  error,
  onRetry,
  isEmpty = false,
  emptyTitle,
  emptyDescription,
  loadingLabel,
  children,
}: AsyncStateProps) {
  if (isLoading) return <LoadingState label={loadingLabel} />
  if (isError) {
    const forbidden = error?.status === 403
    return (
      <ErrorState
        title={forbidden ? 'Acesso negado' : 'Não foi possível carregar'}
        error={error}
        onRetry={forbidden ? undefined : onRetry}
      />
    )
  }
  if (isEmpty) return <EmptyState title={emptyTitle} description={emptyDescription} />
  return <>{children}</>
}
