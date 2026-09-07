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
      <div ref="content" class="article-content" v-html="data?.article.html" />
    </article>
    <aside class="toc"><span class="toc__title"><List class="public-icon" /> NESTA PÁGINA</span><a v-for="heading in headings" :key="heading.id" :class="`toc__link--h${heading.level}`" :href="`#${heading.id}`">{{ heading.label }}</a></aside>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, ChevronRight, Copy, Download, ExternalLink, FileText, List, MessageCircle } from '@lucide/vue'
const route = useRoute()
const content = ref<HTMLElement>()
const actionsElement = ref<HTMLElement>()
const headings = ref<Array<{ id: string; label: string; level: number }>>([])
const menuOpen = ref(false)
const actionsOpen = ref(false)
const copied = ref(false)
const { data, error } = await useFetch(`/api/public/articles/${route.params.space}/${route.params.article}`)
if (error.value) throw createError({ statusCode: error.value.statusCode ?? 404, statusMessage: 'Artigo não encontrado' })
const currentSection = computed(() => data.value?.navigation.find(space => space.slug === route.params.space)?.sections.find(section => section.articles.some(item => item.slug === route.params.article))?.title ?? 'Artigo')
function openMenu() { menuOpen.value = true }

function articleText() {
  return [data.value?.article.title, data.value?.article.summary, content.value?.innerText]
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
}

onMounted(async () => {
  window.addEventListener('public-menu-open', openMenu)
  document.addEventListener('click', closeActions)
  await nextTick()
  refreshHeadings()
})
watch(() => data.value?.article.html, async () => {
  await nextTick()
  refreshHeadings()
})
onBeforeUnmount(() => {
  window.removeEventListener('public-menu-open', openMenu)
  document.removeEventListener('click', closeActions)
})
useSeoMeta({ description: () => data.value?.article.summary ?? '' })
</script>
