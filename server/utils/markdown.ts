import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import { getYouTubeEmbedUrl, getYouTubeVideoId } from '../../shared/utils/youtube'

function renderYouTubeBlocks(source: string) {
  const render = (id: string) => `<div class="youtube-embed"><iframe src="${getYouTubeEmbedUrl(id)}" title="Vídeo do YouTube" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`

  return source
    .replace(/::youtube\{#([A-Za-z0-9_-]{11})\}/g, (_match, id: string) => render(id))
    .replace(/::youtube\{id="([A-Za-z0-9_-]{11})"\}/g, (_match, id: string) => render(id))
    .replace(/::youtube\[(https?:\/\/[^\]\s]+)\]/g, (match, url: string) => {
      const id = getYouTubeVideoId(url)
      return id ? render(id) : match
    })
}

export async function renderMarkdown(source: string) {
  const html = await marked.parse(renderYouTubeBlocks(source), { gfm: true })
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'iframe']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      div: ['class'],
      img: ['src', 'alt', 'title', 'loading'],
      iframe: ['src', 'title', 'loading', 'allow', 'allowfullscreen', 'referrerpolicy']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedIframeHostnames: ['www.youtube-nocookie.com']
  })
}
