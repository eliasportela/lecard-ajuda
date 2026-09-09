<template>
  <div class="docs-grid">
    <PublicSidebar
      :spaces="data?.navigation ?? []"
      :current-space="String(route.params.space)"
      :open="menuOpen"
      @close="menuOpen = false"
    />
    <article v-if="category" class="article category-page">
      <nav class="breadcrumbs" aria-label="Navegação estrutural">
        <NuxtLink to="/">Início</NuxtLink><ChevronRight class="public-icon" /><span>{{ category.title }}</span>
      </nav>
      <header class="category-page__header">
        <div class="category-page__icon"><CategoryIcon :name="category.icon" /></div>
        <div>
          <span class="eyebrow">CATEGORIA</span>
          <h1>{{ category.title }}</h1>
          <p>{{ category.articles.length }} {{ category.articles.length === 1 ? 'artigo disponível' : 'artigos disponíveis' }}</p>
        </div>
      </header>
      <section class="category-page__articles" aria-label="Artigos da categoria">
        <NuxtLink v-for="item in category.articles" :key="item.id" class="category-article" :to="`/${route.params.space}/${item.slug}`">
          <div>
            <h2>{{ item.title }}</h2>
            <p>{{ item.summary || 'Abra o artigo para saber mais.' }}</p>
          </div>
          <ChevronRight class="public-icon" />
        </NuxtLink>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'

const route = useRoute()
const menuOpen = ref(false)
const { data, error } = await useFetch('/api/public/navigation')
if (error.value) throw createError({ statusCode: error.value.statusCode ?? 500, statusMessage: 'Não foi possível carregar a categoria' })

const space = computed(() => data.value?.navigation.find(item => item.slug === route.params.space))
const category = computed(() => space.value?.sections.find(item => item.slug === route.params.category))
if (!category.value) throw createError({ statusCode: 404, statusMessage: 'Categoria não encontrada' })

function openMenu() { menuOpen.value = true }
onMounted(() => window.addEventListener('public-menu-open', openMenu))
onBeforeUnmount(() => window.removeEventListener('public-menu-open', openMenu))

useSeoMeta({
  title: () => `${category.value?.title} | Central de Ajuda LeCard`,
  description: () => `Veja todos os artigos da categoria ${category.value?.title}.`
})
</script>
