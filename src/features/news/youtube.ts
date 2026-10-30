/** Id do vídeo a partir de youtu.be/ID, youtube.com/watch?v=ID, /shorts/ID, /embed/ID ou /live/ID; null se não for YouTube. */
export function youTubeId(value: string | null | undefined): string | null {
  if (!value) return null
  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    return null
  }
  const host = url.hostname.replace(/^(www|m)\./, '')
  const id = host === 'youtu.be' ? url.pathname.slice(1) : host === 'youtube.com' ? (url.searchParams.get('v') ?? url.pathname.split('/').filter(Boolean)[1]) : null
  return id && /^[\w-]{11}$/.test(id) ? id : null
}
