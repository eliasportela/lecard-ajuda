import { $nodeSchema, $remark } from '@milkdown/kit/utils'
import remarkDirective from 'remark-directive'
import { getYouTubeEmbedUrl, getYouTubeVideoId } from '../../shared/utils/youtube'

export const youtubeDirective = $remark('youtubeDirective', () => remarkDirective)

export const youtubeSchema = $nodeSchema('youtube', () => ({
  group: 'block',
  atom: true,
  isolating: true,
  selectable: true,
  attrs: { id: { default: '' } },
  parseDOM: [{
    tag: 'div[data-youtube]',
    getAttrs: dom => ({ id: dom.dataset.youtube ?? '' })
  }],
  toDOM: node => [
    'div',
    { class: 'youtube-block', 'data-youtube': node.attrs.id },
    ['iframe', {
      src: getYouTubeEmbedUrl(node.attrs.id),
      title: 'Vídeo do YouTube',
      loading: 'lazy',
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      allowfullscreen: 'true',
      referrerpolicy: 'strict-origin-when-cross-origin'
    }]
  ],
  parseMarkdown: {
    match: node => node.type === 'leafDirective'
      && node.name === 'youtube'
      && typeof node.attributes === 'object'
      && node.attributes !== null
      && getYouTubeVideoId(String((node.attributes as Record<string, unknown>).id ?? '')) !== null,
    runner: (state, node, type) => {
      const id = getYouTubeVideoId(String((node.attributes as Record<string, unknown>).id))!
      state.addNode(type, { id })
    }
  },
  toMarkdown: {
    match: node => node.type.name === 'youtube',
    runner: (state, node) => {
      state.addNode('leafDirective', [], undefined, {
        name: 'youtube',
        attributes: { id: node.attrs.id }
      })
    }
  }
}))
