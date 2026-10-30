export interface Quote {
  symbol: string
  label: string
  price: number
  changePct: number
}

// Fontes públicas, sem chave e com CORS aberto: AwesomeAPI (câmbio/cripto) e brapi (ações da B3).
// ponytail: chamadas direto do navegador; se o limite gratuito da brapi apertar, ponha um proxy na API.
const FX = [
  { pair: 'USDBRL', label: 'Dólar' },
  { pair: 'EURBRL', label: 'Euro' },
  { pair: 'BTCBRL', label: 'Bitcoin' },
]
// Tickers liberados no plano gratuito da brapi (um por chamada; fora desses ela exige token).
const STOCKS = ['PETR4', 'VALE3', 'ITUB4', 'MGLU3']

interface FxEntry {
  bid: string
  pctChange: string
}

async function fetchFx(signal?: AbortSignal): Promise<Quote[]> {
  const pairs = FX.map(({ pair }) => `${pair.slice(0, 3)}-${pair.slice(3)}`).join(',')
  const response = await fetch(`https://economia.awesomeapi.com.br/last/${pairs}`, { signal })
  if (!response.ok) throw new Error(`câmbio ${response.status}`)
  const data = (await response.json()) as Record<string, FxEntry>
  return FX.flatMap(({ pair, label }) => {
    const entry = data[pair]
    return entry ? [{ symbol: pair.slice(0, 3), label, price: Number(entry.bid), changePct: Number(entry.pctChange) }] : []
  })
}

async function fetchStock(ticker: string, signal?: AbortSignal): Promise<Quote | null> {
  const response = await fetch(`https://brapi.dev/api/quote/${ticker}`, { signal })
  if (!response.ok) return null
  const body = (await response.json()) as { results?: { regularMarketPrice?: number; regularMarketChangePercent?: number }[] }
  const result = body.results?.[0]
  if (typeof result?.regularMarketPrice !== 'number') return null
  return { symbol: ticker, label: ticker, price: result.regularMarketPrice, changePct: result.regularMarketChangePercent ?? 0 }
}

// Cada fonte falha sozinha: o que não chegou simplesmente não aparece. Ações em série (brapi: 1 conexão por vez).
export async function fetchQuotes(signal?: AbortSignal): Promise<Quote[]> {
  const quotes: Quote[] = []
  try {
    quotes.push(...(await fetchFx(signal)))
  } catch (error) {
    if (signal?.aborted) throw error
  }
  for (const ticker of STOCKS) {
    try {
      const quote = await fetchStock(ticker, signal)
      if (quote) quotes.push(quote)
    } catch (error) {
      if (signal?.aborted) throw error
    }
  }
  return quotes
}

export const formatPrice = (value: number) =>
  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const formatChange = (value: number) =>
  `${value >= 0 ? '▲' : '▼'} ${Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
