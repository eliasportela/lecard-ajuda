<template>
  <div class="home-page">
    <div class="home-mobile-nav">
      <PublicSidebar :spaces="data?.navigation ?? []" :open="menuOpen" @close="menuOpen = false" />
    </div>
    <article class="article article--home">
      <div class="hero">
        <div class="hero__content">
          <div class="hero__message">
            <span class="eyebrow">Bem-vindo à</span>
            <h1>Central de <em>Ajuda</em></h1>
          </div>
          <form class="hero-search" @submit.prevent="submitSearch">
            <Search class="public-icon" />
            <input v-model="query" type="search" placeholder="Descreva sua dúvida..." aria-label="Pesquisar artigos">
            <button type="submit">Buscar</button>
          </form>
        </div>
      </div>
      <section v-if="categories.length" class="home-categories" aria-labelledby="home-categories-title">
        <div class="home-section-title">
          <span>Categorias</span>
          <h2 id="home-categories-title">Encontre sua dúvida por categoria</h2>
          <p>Escolha um tema para acessar guias e respostas sobre cada área da plataforma.</p>
        </div>
        <div class="home-category-grid">
          <NuxtLink v-for="category in categories" :key="category.id" class="home-category" :to="`/${category.spaceSlug}/categoria/${category.slug}`" :title="category.title">
            <span class="home-category__icon"><CategoryIcon :name="category.icon" /></span>
            <strong>{{ category.title }}</strong>
            <small>{{ category.articles.length }} {{ category.articles.length === 1 ? 'artigo' : 'artigos' }}</small>
          </NuxtLink>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@lucide/vue'
const { data } = await useFetch('/api/public/navigation')
const query = ref('')
const menuOpen = ref(false)
const categories = computed(() => data.value?.navigation.flatMap(space => space.sections.map(category => ({ ...category, spaceSlug: space.slug }))) ?? [])
function submitSearch() { if (query.value.trim()) navigateTo({ path: '/busca', query: { q: query.value.trim() } }) }
function openMenu() { menuOpen.value = true }
onMounted(() => window.addEventListener('public-menu-open', openMenu))
onBeforeUnmount(() => window.removeEventListener('public-menu-open', openMenu))
useSeoMeta({ description: 'Base de conhecimento LeCard' })
</script>
