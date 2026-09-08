<template>
  <div class="docs-grid">
    <PublicSidebar :spaces="data?.navigation ?? []" :current-space="String(route.params.space)" :current-article="String(route.params.article)" :open="menuOpen" @close="menuOpen = false" />
    <article class="article">
      <div class="article-topline">
        <nav class="breadcrumbs" aria-label="Navegação estrutural"><NuxtLink to="/">Início</NuxtLink><ChevronRight class="public-icon" /><span>{{ currentSection }}</span></nav>
        <div ref="actionsElement" class="article-actions">
          <div class="article-actions__trigger">
            <button type="button" @click="copyArticle"><Copy /> {{ copied ? 'Copiado' : 'Copiar' }}</button>
            <button type="button" aria-label="Mostrar opções do artigo" :aria-expanded="actionsOpen" aria-haspopup="menu" @click="actionsOpen = !actionsOpen"><ChevronDown :class="{ 'is-open': actionsOpen }" /></button>
          </div>
          <div v-if="actionsOpen" class="article-actions__menu" role="menu">
            <button type="button" role="menuitem" @click="copyArticle"><Copy /><span><strong>Copiar</strong><small>Copiar todo o conteúdo do artigo</small></span></button>
            <button type="button" role="menuitem" @click="viewPlainText"><FileText /><span><strong>Ver Texto Simples</strong><small>Abrir o artigo sem formatação</small></span></button>
            <button type="button" role="menuitem" @click="exportTxt"><Download /><span><strong>Exportar como TXT</strong><small>Baixar o artigo em texto simples</small></span></button>
            <button type="button" role="menuitem" @click="openInChatGPT"><MessageCircle /><span><strong>Abrir no ChatGPT <ExternalLink /></strong><small>Perguntar ao ChatGPT sobre o artigo</small></span></button>
          </div>
        </div>
      </div>
      <h1>{{ data?.article.title }}</h1>
      <p v-if="data?.article.summary" class="article-summary">{{ data.article.summary }}</p>
      <div ref="content" class="article-content" v-html="data?.article.html" @click="handleContentClick" @keydown="handleContentKeydown" />
    </article>
    <aside class="toc"><span class="toc__title"><List class="public-icon" /> NESTA PÁGINA</span><a v-for="heading in headings" :key="heading.id" :class="[`toc__link--h${heading.level}`, { 'is-active': activeHeading === heading.id }]" :href="`#${heading.id}`" :aria-current="activeHeading === heading.id ? 'location' : undefined">{{ heading.label }}</a></aside>
  </div>
  <Teleport to="body">
    <Transition name="image-lightbox">
      <div v-if="lightboxImage" class="image-lightbox" role="presentation" @click.self="closeLightbox">
        <section class="image-lightbox__dialog" role="dialog" aria-modal="true" :aria-label="lightboxImage.alt ? `Imagem ampliada: ${lightboxImage.alt}` : 'Imagem ampliada'">
          <button ref="lightboxClose" class="image-lightbox__close" type="button" aria-label="Fechar imagem ampliada" @click="closeLightbox"><X /></button>
          <img :src="lightboxImage.src" :alt="lightboxImage.alt">
          <p v-if="lightboxImage.alt">{{ lightboxImage.alt }}</p>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ChevronDown, ChevronRight, Copy, Download, ExternalLink, FileText, List, MessageCircle, X } from '@lucide/vue'
const route = useRoute()
const content = ref<HTMLElement>()
const actionsElement = ref<HTMLElement>()
const lightboxClose = ref<HTMLButtonElement>()
const headings = ref<Array<{ id: string; label: string; level: number }>>([])
const activeHeading = ref('')
const lightboxImage = ref<{ src: string; alt: string } | null>(null)
let lightboxTrigger: HTMLImageElement | null = null
let scrollFrame: number | null = null
const menuOpen = ref(false)
const actionsOpen = ref(false)
const copied = ref(false)
const { data, error } = await useFetch(`/api/public/articles/${route.params.space}/${route.params.article}`)
if (error.value) throw createError({ statusCode: error.value.statusCode ?? 404, statusMessage: 'Artigo não encontrado' })
const currentSection = computed(() => data.value?.navigation.find(space => space.slug === route.params.space)?.sections.find(section => section.articles.some(item => item.slug === route.params.article))?.title ?? 'Artigo')
function openMenu() { menuOpen.value = true }

function readableUrl(value: string) {
  if (!value) return ''
  try {
    const url = new URL(value, window.location.href)
    const youtubeId = url.pathname.match(/^\/embed\/([A-Za-z0-9_-]{11})$/)?.[1]
    if (youtubeId && ['youtube.com', 'www.youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname)) {
      return `https://www.youtube.com/watch?v=${youtubeId}`
    }
    return url.toString()
  } catch {
    return value
  }
}

function articleContentText() {
  if (!content.value) return ''

  const clone = content.value.cloneNode(true) as HTMLElement
  clone.querySelectorAll('img').forEach(image => {
    const url = readableUrl(image.getAttribute('src') || '')
    image.replaceWith(document.createTextNode(url ? `\nImagem: ${url}\n` : ''))
  })
  clone.querySelectorAll('iframe').forEach(frame => {
    const url = readableUrl(frame.getAttribute('src') || '')
    frame.replaceWith(document.createTextNode(url ? `\nVídeo: ${url}\n` : ''))
  })

  clone.setAttribute('aria-hidden', 'true')
  Object.assign(clone.style, { position: 'fixed', left: '-100000px', top: '0', width: `${content.value.clientWidth}px`, pointerEvents: 'none' })
  document.body.appendChild(clone)
  try {
    return clone.innerText
  } finally {
    clone.remove()
  }
}

function articleText() {
  return [data.value?.article.title, data.value?.article.summary, articleContentText()]
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function copyArticle() {
  await navigator.clipboard.writeText(articleText())
  actionsOpen.value = false
  copied.value = true
  window.setTimeout(() => { copied.value = false }, 1800)
}

function viewPlainText() {
  const url = URL.createObjectURL(new Blob([articleText()], { type: 'text/plain;charset=utf-8' }))
  window.open(url, '_blank', 'noopener,noreferrer')
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  actionsOpen.value = false
}

function openInChatGPT() {
  const articleUrl = window.location.href.split('#')[0]
  const prompt = `Leia este artigo e me ajude a entender o conteúdo: ${articleUrl}`
  window.open(`https://chatgpt.com/?q=${encodeURIComponent(prompt)}`, '_blank', 'noopener,noreferrer')
  actionsOpen.value = false
}

function exportTxt() {
  const url = URL.createObjectURL(new Blob([articleText()], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${String(route.params.article)}.txt`
  link.click()
  URL.revokeObjectURL(url)
  actionsOpen.value = false
}

function closeActions(event: MouseEvent) {
  if (!actionsElement.value?.contains(event.target as Node)) actionsOpen.value = false
}

function imageFromTarget(target: EventTarget | null) {
  return target instanceof HTMLImageElement && content.value?.contains(target) ? target : null
}

async function openLightbox(image: HTMLImageElement) {
  lightboxTrigger = image
  lightboxImage.value = { src: image.currentSrc || image.src, alt: image.alt.trim() }
  document.body.classList.add('has-image-lightbox')
  await nextTick()
  lightboxClose.value?.focus()
}

function closeLightbox() {
  lightboxImage.value = null
  document.body.classList.remove('has-image-lightbox')
  lightboxTrigger?.focus()
  lightboxTrigger = null
}

function handleContentClick(event: MouseEvent) {
  const image = imageFromTarget(event.target)
  if (!image) return
  event.preventDefault()
  openLightbox(image)
}

function handleContentKeydown(event: KeyboardEvent) {
  if (!['Enter', ' '].includes(event.key)) return
  const image = imageFromTarget(event.target)
  if (!image) return
  event.preventDefault()
  openLightbox(image)
}

function handleLightboxKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && lightboxImage.value) closeLightbox()
  if (event.key === 'Tab' && lightboxImage.value) {
    event.preventDefault()
    lightboxClose.value?.focus()
  }
}

function enhanceArticleImages() {
  content.value?.querySelectorAll('img').forEach(image => {
    image.tabIndex = 0
    image.setAttribute('role', 'button')
    image.setAttribute('aria-label', image.alt.trim() ? `Ampliar imagem: ${image.alt.trim()}` : 'Ampliar imagem')
  })
}

function refreshHeadings() {
  const nodes = [...(content.value?.querySelectorAll('h1, h2, h3, h4, h5, h6') ?? [])] as HTMLHeadingElement[]
  const usedIds = new Set<string>()

  headings.value = nodes.map((node, index) => {
    const label = node.textContent?.trim() || `Seção ${index + 1}`
    const baseId = node.id || label.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `secao-${index + 1}`
    let id = baseId
    let suffix = 2
    while (usedIds.has(id)) id = `${baseId}-${suffix++}`
    usedIds.add(id)
    node.id = id
    return { id, label, level: Number(node.tagName.slice(1)) }
  })
  updateActiveHeading()
}

function updateActiveHeading() {
  const nodes = [...(content.value?.querySelectorAll('h1, h2, h3, h4, h5, h6') ?? [])] as HTMLHeadingElement[]
  if (!nodes.length) {
    activeHeading.value = ''
    return
  }

  const activationLine = 140
  const current = nodes.reduce<HTMLHeadingElement>((active, node) => node.getBoundingClientRect().top <= activationLine ? node : active, nodes[0]!)
  activeHeading.value = current.id
}

function handleArticleScroll() {
  if (scrollFrame !== null) return
  scrollFrame = window.requestAnimationFrame(() => {
    updateActiveHeading()
    scrollFrame = null
  })
}

onMounted(async () => {
  window.addEventListener('public-menu-open', openMenu)
  document.addEventListener('click', closeActions)
  window.addEventListener('keydown', handleLightboxKeydown)
  window.addEventListener('scroll', handleArticleScroll, { passive: true })
  window.addEventListener('resize', handleArticleScroll)
  await nextTick()
  refreshHeadings()
  enhanceArticleImages()
})
watch(() => data.value?.article.html, async () => {
  await nextTick()
  refreshHeadings()
  enhanceArticleImages()
})
onBeforeUnmount(() => {
  window.removeEventListener('public-menu-open', openMenu)
  window.removeEventListener('keydown', handleLightboxKeydown)
  window.removeEventListener('scroll', handleArticleScroll)
  window.removeEventListener('resize', handleArticleScroll)
  document.removeEventListener('click', closeActions)
  if (scrollFrame !== null) window.cancelAnimationFrame(scrollFrame)
  document.body.classList.remove('has-image-lightbox')
})
useSeoMeta({ description: () => data.value?.article.summary ?? '' })
</script>
