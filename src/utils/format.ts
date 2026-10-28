export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '—'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })
}
