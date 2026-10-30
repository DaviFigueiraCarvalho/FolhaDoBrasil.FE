// Player do YouTube (domínio sem cookies) em proporção 16:9.
export default function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title="Vídeo da matéria"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
      />
    </div>
  )
}
