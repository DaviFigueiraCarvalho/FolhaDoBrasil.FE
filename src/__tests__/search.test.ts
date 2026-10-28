import { inPeriod, searchTopics } from '../features/news/search'

const topics = [{ name: 'Política' }, { name: 'Esportes' }, { name: 'Economia' }, { name: 'Tecnologia' }]

describe('searchTopics', () => {
  it('ignora acento e caixa e aceita prefixo', () => {
    expect(searchTopics('POLIT', topics).map((t) => t.name)).toEqual(['Política'])
  })
  it('tolera erro de digitação', () => {
    expect(searchTopics('esprtes', topics)[0]?.name).toBe('Esportes')
    expect(searchTopics('tecnolgia', topics)[0]?.name).toBe('Tecnologia')
    expect(searchTopics('ecomonia', topics)[0]?.name).toBe('Economia')
  })
  it('não inventa correspondência e sem texto devolve tudo', () => {
    expect(searchTopics('xyzxyz', topics)).toEqual([])
    expect(searchTopics('  ', topics)).toHaveLength(4)
  })
})

describe('inPeriod', () => {
  const now = new Date('2026-10-28T15:00:00')
  it('filtra por dia, semana e ano', () => {
    expect(inPeriod('2026-10-28T08:00:00', 'day', now)).toBe(true)
    expect(inPeriod('2026-10-27T23:00:00', 'day', now)).toBe(false)
    expect(inPeriod('2026-10-23T12:00:00', 'week', now)).toBe(true)
    expect(inPeriod('2026-10-20T12:00:00', 'week', now)).toBe(false)
    expect(inPeriod('2026-01-02T12:00:00', 'year', now)).toBe(true)
    expect(inPeriod('2025-12-31T12:00:00', 'year', now)).toBe(false)
  })
})
