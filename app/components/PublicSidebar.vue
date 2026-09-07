<template>
  <aside class="sidebar" :class="{ 'is-open': open }">
    <div class="sidebar__mobile-head">
      <span>Navegação</span>
      <button class="icon-btn" type="button" aria-label="Fechar menu" @click="$emit('close')"><X class="public-icon" /></button>
    </div>
    <nav aria-label="Artigos da base de conhecimento">
      <NuxtLink class="nav-home" to="/" @click="$emit('close')"><House class="public-icon" /> Início</NuxtLink>
      <section v-for="space in spaces" :key="space.id" class="nav-space">
        <button class="nav-space__trigger" :class="{ 'is-active': currentSpace === space.slug }" type="button" :aria-expanded="expandedSpace === space.id" @click="toggleSpace(space.id)">
          <span>{{ space.name }}</span><ChevronRight class="nav-chevron public-icon" />
        </button>
        <div v-if="expandedSpace === space.id" class="nav-categories">
          <div v-for="category in space.sections" :key="category.id" class="nav-category">
            <NuxtLink v-if="category.articles.length === 1" class="nav-category__trigger" :class="{ 'is-active': isActiveArticle(space.slug, category.articles[0]!.slug) }" :to="`/${space.slug}/${category.articles[0]!.slug}`" @click="$emit('close')">
              <span class="nav-category__icon"><CategoryIcon :name="category.icon" /></span><span>{{ category.title }}</span><ChevronRight class="nav-chevron public-icon" />
            </NuxtLink>
            <button v-else class="nav-category__trigger" type="button" :aria-expanded="expandedCategory === category.id" :disabled="!category.articles.length" @click="toggleCategory(category.id)">
              <span class="nav-category__icon"><CategoryIcon :name="category.icon" /></span><span>{{ category.title }}</span><ChevronRight v-if="category.articles.length" class="nav-chevron public-icon" />
            </button>
            <div v-if="category.articles.length > 1 && expandedCategory === category.id" class="nav-articles">
              <div class="nav-heading nav-heading--articles">Artigos</div>
              <NuxtLink v-for="article in category.articles" :key="article.id" class="nav-article" :to="`/${space.slug}/${article.slug}`" @click="$emit('close')">{{ article.title }}</NuxtLink>
            </div>
          </div>
          <p v-if="!space.sections.length" class="nav-empty">Nenhuma categoria publicada.</p>
        </div>
      </section>
    </nav>
    <div class="sidebar__help">
      <span class="sidebar__help-icon">?</span>
      <div><strong>Não encontrou?</strong><small>Use a busca para localizar uma resposta.</small></div>
    </div>
  </aside>
  <button v-if="open" class="sidebar-backdrop" type="button" aria-label="Fechar menu" @click="$emit('close')" />
</template>

<script setup lang="ts">
import { ChevronRight, House, X } from '@lucide/vue'

interface NavigationArticle { id: number; title: string; slug: string; summary?: string | null; publishedAt?: string | Date | null }
interface NavigationCategory { id: number; title: string; icon: string; articles: NavigationArticle[] }
interface NavigationSpace { id: number; name: string; slug: string; sections: NavigationCategory[] }

const props = defineProps<{ spaces: NavigationSpace[]; currentSpace?: string; currentArticle?: string; open?: boolean }>()
defineEmits<{ close: [] }>()

const activePath = computed(() => {
  for (const space of props.spaces) {
    for (const category of space.sections) {
      if (space.slug === props.currentSpace && category.articles.some(article => article.slug === props.currentArticle)) return { spaceId: space.id, categoryId: category.id }
    }
  }
})
const expandedSpace = ref<number>()
const expandedCategory = ref<number>()

watch([() => props.spaces, activePath], () => {
  expandedSpace.value = activePath.value?.spaceId ?? props.spaces.find(space => space.slug === props.currentSpace)?.id ?? props.spaces[0]?.id
  expandedCategory.value = activePath.value?.categoryId
}, { immediate: true })

function toggleSpace(id: number) {
  expandedSpace.value = expandedSpace.value === id ? undefined : id
  expandedCategory.value = undefined
}
function toggleCategory(id: number) { expandedCategory.value = expandedCategory.value === id ? undefined : id }
function isActiveArticle(space: string, article: string) { return space === props.currentSpace && article === props.currentArticle }
</script>
