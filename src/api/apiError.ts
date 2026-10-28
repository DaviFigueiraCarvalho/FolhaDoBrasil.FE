interface ProblemDetails {
  type?: string | null
  title?: string | null
  status?: number | null
  detail?: string | null
  instance?: string | null
}

export type FieldErrors = Record<string, string[] | string>

const SAFE_MESSAGES: Record<number, string> = {
  400: 'Requisição inválida. Verifique os dados enviados.',
  401: 'Você precisa entrar novamente para continuar.',
  403: 'Você não tem permissão para executar esta ação.',
  404: 'Não encontramos o que você procurava.',
  409: 'Isso foi alterado por outra ação. Atualize a página e tente novamente.',
  410: 'Esse recurso não está mais disponível.',
  412: 'Os dados mudaram desde o último carregamento. Atualize e tente novamente.',
  422: 'Alguns dados não passaram na validação.',
  429: 'Muitas tentativas em pouco tempo. Aguarde e tente novamente.',
  500: 'Algo deu errado no servidor. Tente novamente em instantes.',
  502: 'Servidor indisponível no momento. Tente novamente em instantes.',
  503: 'Serviço temporariamente indisponível.',
  504: 'O servidor demorou demais para responder.',
}

export function safeMessageForStatus(status?: number | null): string {
  if (status && SAFE_MESSAGES[status]) return SAFE_MESSAGES[status]
  if (status && status >= 500) return SAFE_MESSAGES[500]
  return 'Não foi possível completar a ação. Tente novamente.'
}

export interface ApiErrorOptions {
  status?: number | null
  code?: string | null
  title?: string | null
  detail?: string | null
  fieldErrors?: FieldErrors | null
  traceId?: string | null
  cause?: unknown
}

export class ApiError extends Error {
  status: number | null
  code: string | null
  title: string | null
  detail: string | null
  fieldErrors: FieldErrors | null
  traceId: string | null

  constructor({
    status = null,
    code = null,
    title = null,
    detail = null,
    fieldErrors = null,
    traceId = null,
    cause,
  }: ApiErrorOptions = {}) {
    super(detail || title || 'Erro de comunicação com o servidor.')
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.title = title
    this.detail = detail
    this.fieldErrors = fieldErrors
    this.traceId = traceId
    if (cause) this.cause = cause
  }
}

export class NetworkError extends ApiError {
  constructor(cause?: unknown) {
    super({
      status: null,
      code: 'network_error',
      title: 'Falha de conexão',
      detail: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
      cause,
    })
    this.name = 'NetworkError'
  }
}

export class SessionExpiredError extends ApiError {
  constructor() {
    super({
      status: 401,
      code: 'session_expired',
      title: 'Sessão expirada',
      detail: 'Sua sessão expirou. Faça login novamente.',
    })
    this.name = 'SessionExpiredError'
  }
}

// Um corpo de resposta que não é JSON (`parseResponseBody` em httpClient.ts devolve o texto cru
// nesse caso) só vira `detail` se parecer uma mensagem de erro de verdade — texto curto e sem
// marcação. Sem isso, uma resposta inesperada de HTML (ex.: a própria página de fallback do dev
// server, quando a API não está configurada/rodando) aparece inteira na tela: já foi observado um
// card de erro de ~26.000px de altura por causa disso, empurrando todo o conteúdo abaixo — inclusive
// botões — para muito longe da área visível.
const MAX_RAW_DETAIL_LENGTH = 300

function sanitizeRawBodyAsDetail(body: unknown): string | null {
  if (typeof body !== 'string') return null
  const trimmed = body.trim()
  if (!trimmed || trimmed.length > MAX_RAW_DETAIL_LENGTH) return null
  if (/^<(!doctype|html|\?xml)/i.test(trimmed)) return null
  return trimmed
}

// Constrói um ApiError normalizado a partir de um corpo de resposta que pode ou não seguir
// application/problem+json (ProblemDetails: type, title, status, detail, instance + extensões).
export function apiErrorFromResponse(status: number, body: unknown): ApiError {
  const problem: ProblemDetails & { code?: string; errors?: unknown; fieldErrors?: unknown; traceId?: string } =
    body && typeof body === 'object' && !Array.isArray(body) ? (body as ProblemDetails) : {}
  const detail = problem.detail || sanitizeRawBodyAsDetail(body)
  const fieldErrors: FieldErrors | null =
    (typeof problem.errors === 'object' && problem.errors ? (problem.errors as FieldErrors) : null) ||
    (typeof problem.fieldErrors === 'object' && problem.fieldErrors ? (problem.fieldErrors as FieldErrors) : null)

  return new ApiError({
    status,
    code: problem.code || problem.type || `http_${status}`,
    title: problem.title || safeMessageForStatus(status),
    detail: detail || safeMessageForStatus(status),
    fieldErrors,
    traceId: problem.traceId || problem.instance || null,
  })
}
