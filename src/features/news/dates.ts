const pad = (value: number) => String(value).padStart(2, '0')

/** "29/10/2026 16h43" (horário local). */
export function formatPublished(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}h${pad(date.getMinutes())}`
}

const UNITS: [label: string, plural: string, seconds: number][] = [
  ['ano', 'anos', 31_536_000],
  ['mês', 'meses', 2_592_000],
  ['dia', 'dias', 86_400],
  ['hora', 'horas', 3_600],
  ['minuto', 'minutos', 60],
]

/** "há 4 minutos", "há 1 hora", "há 3 dias"… (menos de 1 minuto: "há instantes"). */
export function timeSince(iso: string, now: number = Date.now()): string {
  const seconds = Math.floor((now - new Date(iso).getTime()) / 1000)
  if (Number.isNaN(seconds) || seconds < 60) return 'há instantes'
  const [singular, plural, size] = UNITS.find(([, , unit]) => seconds >= unit) ?? UNITS[UNITS.length - 1]!
  const count = Math.floor(seconds / size)
  return `há ${count} ${count === 1 ? singular : plural}`
}
