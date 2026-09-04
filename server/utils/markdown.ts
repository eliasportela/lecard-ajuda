import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

export async function renderMarkdown(source: string) {
  const html = await marked.parse(source, { gfm: true })
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'alt', 'title', 'loading'] },
    allowedSchemes: ['http', 'https', 'mailto']
  })
}
