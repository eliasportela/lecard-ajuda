const youtubeIdPattern = /^[A-Za-z0-9_-]{11}$/

export function getYouTubeVideoId(value: string) {
  const candidate = value.trim()
  if (youtubeIdPattern.test(candidate)) return candidate

  try {
    const url = new URL(candidate)
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '')
    let id = ''

    if (hostname === 'youtu.be') {
      id = url.pathname.split('/').filter(Boolean)[0] ?? ''
    } else if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(hostname)) {
      if (url.pathname === '/watch') id = url.searchParams.get('v') ?? ''
      else if (/^\/(shorts|embed|live)\//.test(url.pathname)) id = url.pathname.split('/')[2] ?? ''
    }

    return youtubeIdPattern.test(id) ? id : null
  } catch {
    return null
  }
}

export function getYouTubeEmbedUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}`
}
