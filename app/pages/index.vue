<template>
  <div class="docs-grid">
    <PublicSidebar :spaces="data?.navigation ?? []" :current-space="data?.space.slug" :open="menuOpen" @close="menuOpen = false" />
    <article class="article article--home">
      <div class="hero">
        <span class="eyebrow"><span>✦</span> Base de conhecimento LeCard</span>
        <h1>Olá! Como podemos <em>ajudar</em>?</h1>
        <p>Dicas e respostas do nosso time para ajudar você a aproveitar tudo da plataforma.</p>
        <form class="hero-search" @submit.prevent="submitSearch">
          <Search class="public-icon" /><input v-model="query" type="search" placeholder="O que você está procurando?" aria-label="Pesquisar artigos"><button type="submit">Buscar</button>
        </form>
      </div>
      <section class="home-section">
        <div class="section-heading"><div><span>ÚLTIMOS ARTIGOS</span><h2>Encontre respostas e soluções</h2></div></div>
        <div v-if="homeArticles.length" class="article-grid">
          <NuxtLink v-for="item in homeArticles" :key="item.id" class="article-card" :to="`/${item.spaceSlug}/${item.slug}`">
            <div class="article-card__icon"><CategoryIcon :name="item.categoryIcon" /></div>
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
    </article>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, CircleHelp, Search } from '@lucide/vue'
const { data } = await useFetch('/api/public/navigation')
const query = ref('')
const menuOpen = ref(false)
const homeArticles = computed(() => data.value?.navigation.flatMap(space => space.sections.flatMap(category => category.articles.map(article => ({
  ...article,
  spaceSlug: space.slug,
  category: category.title,
  categoryIcon: category.icon
}))))
  .sort((a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime())
  .slice(0, 6) ?? [])
function submitSearch() { if (query.value.trim()) navigateTo({ path: '/busca', query: { q: query.value.trim() } }) }
function openMenu() { menuOpen.value = true }
onMounted(() => window.addEventListener('public-menu-open', openMenu))
onBeforeUnmount(() => window.removeEventListener('public-menu-open', openMenu))
useSeoMeta({ description: 'Base de conhecimento LeCard' })
</script>
