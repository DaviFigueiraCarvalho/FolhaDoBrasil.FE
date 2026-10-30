import { formatPublished, timeSince } from '../features/news/dates'
import { youTubeId } from '../features/news/youtube'

describe('timeSince', () => {
  const now = Date.parse('2026-10-29T20:00:00Z')
  const ago = (seconds: number) => new Date(now - seconds * 1000).toISOString()

  it('usa a unidade certa e o plural', () => {
    expect(timeSince(ago(10), now)).toBe('há instantes')
    expect(timeSince(ago(4 * 60), now)).toBe('há 4 minutos')
    expect(timeSince(ago(3600), now)).toBe('há 1 hora')
    expect(timeSince(ago(3 * 86_400), now)).toBe('há 3 dias')
    expect(timeSince(ago(60 * 86_400), now)).toBe('há 2 meses')
  })
})

describe('formatPublished', () => {
  it('formata dd/mm/aaaa HHhMM e tolera data inválida', () => {
    expect(formatPublished(new Date(2026, 9, 29, 16, 43).toISOString())).toBe('29/10/2026 16h43')
    expect(formatPublished('x')).toBe('')
  })
})

describe('youTubeId', () => {
  it('extrai o id dos formatos comuns e rejeita o resto', () => {
    expect(youTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(youTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3')).toBe('dQw4w9WgXcQ')
    expect(youTubeId('https://youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(youTubeId('https://exemplo.com/watch?v=dQw4w9WgXcQ')).toBeNull()
    expect(youTubeId('lixo')).toBeNull()
  })
})
