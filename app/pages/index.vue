<template>
  <div class="docs-grid">
    <PublicSidebar :spaces="data?.navigation ?? []" :current-space="data?.space.slug" :open="menuOpen" @close="menuOpen = false" />
    <article class="article article--home">
      <div class="hero">
        <span class="eyebrow"><span>✦</span> Base de conhecimento LeCard</span>
        <div class="hero__content">
          <h1>Olá! Como podemos <em>ajudar</em>?</h1>
          <p>Dicas e respostas do nosso time para ajudar você a aproveitar tudo da plataforma.</p>
          <form class="hero-search" @submit.prevent="submitSearch">
            <Search class="public-icon" /><input v-model="query" type="search" placeholder="O que você está procurando?" aria-label="Pesquisar artigos"><button type="submit">Buscar</button>
          </form>
        </div>
      </div>
      <section class="home-section">
        <div class="section-heading"><div><span>ÚLTIMOS ARTIGOS</span><h2>Encontre respostas e soluções</h2></div></div>
        <div v-if="homeArticles.length" class="article-grid">
          <NuxtLink v-for="item in homeArticles" :key="item.id" class="article-card" :to="`/${item.spaceSlug}/${item.slug}`">
            <div class="article-card__icon"><FileText /></div>
            <div>
              <span class="article-card__category">{{ item.category }}</span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.summary || 'Abra o artigo para saber mais.' }}</p>
            </div>
            <ChevronRight class="public-icon" />
          </NuxtLink>
        </div>
        <div v-else class="empty-public"><span>✦</span><h3>A base está pronta para começar</h3><p>Cadastre e publique o primeiro artigo pela área administrativa.</p></div>
        <div v-if="homeArticles.length" class="home-discovery-hint">
          <CircleHelp class="public-icon" />
          <p><strong>Quer explorar mais conteúdos?</strong> Navegue pelas categorias no menu lateral ou use a busca para encontrar o que precisa.</p>
        </div>
      </section>
      <section v-if="categories.length" class="category-carousel-section" aria-labelledby="category-carousel-title">
        <div class="section-heading category-carousel-heading">
          <div><span>EXPLORE POR TEMA</span><h2 id="category-carousel-title">Todas as categorias</h2></div>
          <div class="category-carousel-actions">
            <button type="button" aria-label="Categorias anteriores" :disabled="carouselStart" @click="moveCarousel(-1)"><ChevronLeft /></button>
            <button type="button" aria-label="Próximas categorias" :disabled="categories.length <= 1 || carouselEnd" @click="moveCarousel(1)"><ChevronRight /></button>
          </div>
        </div>
        <div ref="carousel" class="category-carousel" tabindex="0" @scroll.passive="updateCarouselState">
          <NuxtLink v-for="category in categories" :key="category.id" class="category-slide" :to="`/${category.spaceSlug}/categoria/${category.slug}`">
            <div class="category-slide__icon"><CategoryIcon :name="category.icon" /></div>
            <div>
              <h3>{{ category.title }}</h3>
              <p>{{ category.articles.length }} {{ category.articles.length === 1 ? 'artigo' : 'artigos' }}</p>
            </div>
            <ChevronRight class="public-icon" />
          </NuxtLink>
        </div>
        <div v-if="categories.length > 1" class="category-carousel-dots" aria-hidden="true">
          <span v-for="(_, index) in categories" :key="index" :class="{ 'is-active': index === activeCategory }" />
        </div>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight, CircleHelp, FileText, Search } from '@lucide/vue'
const { data } = await useFetch('/api/public/navigation')
const query = ref('')
const menuOpen = ref(false)
const carousel = ref<HTMLElement>()
const carouselStart = ref(true)
const carouselEnd = ref(false)
const activeCategory = ref(0)
const categories = computed(() => data.value?.navigation.flatMap(space => space.sections.map(category => ({ ...category, spaceSlug: space.slug }))) ?? [])
const homeArticles = computed(() => data.value?.navigation.flatMap(space => space.sections.flatMap(category => category.articles.map(article => ({
  ...article,
  spaceSlug: space.slug,
  category: category.title
}))))
  .sort((a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime())
  .slice(0, 6) ?? [])
function submitSearch() { if (query.value.trim()) navigateTo({ path: '/busca', query: { q: query.value.trim() } }) }
function updateCarouselState() {
  const element = carousel.value
  if (!element) return
  const maxScroll = element.scrollWidth - element.clientWidth
  carouselStart.value = element.scrollLeft <= 2
  carouselEnd.value = element.scrollLeft >= maxScroll - 2
  const firstCard = element.querySelector<HTMLElement>('.category-slide')
  if (firstCard) activeCategory.value = Math.min(categories.value.length - 1, Math.round(element.scrollLeft / (firstCard.offsetWidth + 14)))
}
function moveCarousel(direction: number) {
  const element = carousel.value
  const firstCard = element?.querySelector<HTMLElement>('.category-slide')
  if (!element || !firstCard) return
  element.scrollBy({ left: direction * (firstCard.offsetWidth + 14), behavior: 'smooth' })
}
function openMenu() { menuOpen.value = true }
function handleResize() { updateCarouselState() }
onMounted(() => { window.addEventListener('public-menu-open', openMenu); window.addEventListener('resize', handleResize); nextTick(updateCarouselState) })
onBeforeUnmount(() => { window.removeEventListener('public-menu-open', openMenu); window.removeEventListener('resize', handleResize) })
useSeoMeta({ description: 'Base de conhecimento LeCard' })
</script>
