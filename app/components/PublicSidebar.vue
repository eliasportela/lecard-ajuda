<template>
  <aside class="sidebar" :class="{ 'is-open': open }">
    <div class="sidebar__mobile-head">
      <span>Navegação</span>
      <button class="icon-btn" type="button" aria-label="Fechar menu" @click="$emit('close')"><X class="public-icon" /></button>
    </div>
    <nav class="sidebar__navigation" aria-label="Artigos da base de conhecimento">
      <NuxtLink class="nav-home" to="/" @click="$emit('close')"><House class="public-icon" /> Início</NuxtLink>
      <section class="nav-categories nav-categories--root">
        <div v-for="category in categories" :key="category.id" class="nav-category">
          <NuxtLink v-if="category.articles.length === 1" class="nav-category__trigger" :class="{ 'is-active': isActiveArticle(category.spaceSlug, category.articles[0]!.slug) }" :to="`/${category.spaceSlug}/${category.articles[0]!.slug}`" @click="$emit('close')">
            <span class="nav-category__icon"><CategoryIcon :name="category.icon" /></span><span>{{ category.title }}</span><ChevronRight class="nav-chevron public-icon" />
          </NuxtLink>
          <button v-else class="nav-category__trigger" type="button" :aria-expanded="expandedCategories.has(category.id)" :disabled="!category.articles.length" @click="toggleCategory(category.id)">
            <span class="nav-category__icon"><CategoryIcon :name="category.icon" /></span><span>{{ category.title }}</span><ChevronRight v-if="category.articles.length" class="nav-chevron public-icon" />
          </button>
          <div v-if="category.articles.length > 1 && expandedCategories.has(category.id)" class="nav-articles">
            <div class="nav-heading nav-heading--articles">Artigos</div>
            <NuxtLink v-for="article in category.articles" :key="article.id" class="nav-article" :to="`/${category.spaceSlug}/${article.slug}`" @click="$emit('close')">{{ article.title }}</NuxtLink>
          </div>
        </div>
        <p v-if="!categories.length" class="nav-empty">Nenhuma categoria publicada.</p>
      </section>
    </nav>
    <nav class="sidebar-mobile-links" aria-label="Links da LeCard">
      <a href="https://portal.lecard.app" target="_blank" rel="noopener noreferrer">Portal <ExternalLink class="public-icon" /></a>
      <a href="https://api.whatsapp.com/send/?phone=5516994533763&amp;text=Iniciar+atendimento&amp;type=phone_number&amp;app_absent=0" target="_blank" rel="noopener noreferrer">Suporte <ExternalLink class="public-icon" /></a>
      <div class="sidebar-mobile-links__socials">
        <a class="sidebar-mobile-links__social" href="https://www.instagram.com/lecard.app" target="_blank" rel="noopener noreferrer" aria-label="Instagram da LeCard" title="Instagram">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" class="social-icon-dot" /></svg>
        </a>
        <a class="sidebar-mobile-links__social" href="https://www.youtube.com/@sistemalecard" target="_blank" rel="noopener noreferrer" aria-label="YouTube da LeCard" title="YouTube">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.4 6.5a2.8 2.8 0 0 0-2-2C17.7 4 12 4 12 4s-5.7 0-7.4.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .6 5.5 2.8 2.8 0 0 0 2 2C6.3 20 12 20 12 20s5.7 0 7.4-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.6-5.5Z" /><path d="m10 9 5 3-5 3Z" class="social-icon-play" /></svg>
        </a>
      </div>
    </nav>
    <div class="sidebar__help">
      <span class="sidebar__help-icon">?</span>
      <div><strong>Não encontrou?</strong><small>Use a busca para localizar uma resposta.</small></div>
    </div>
  </aside>
  <button v-if="open" class="sidebar-backdrop" type="button" aria-label="Fechar menu" @click="$emit('close')" />
</template>

<script setup lang="ts">
import { ChevronRight, ExternalLink, House, X } from '@lucide/vue'

interface NavigationArticle { id: number; title: string; slug: string; summary?: string | null; publishedAt?: string | Date | null }
interface NavigationCategory { id: number; title: string; slug: string; icon: string; articles: NavigationArticle[] }
interface NavigationSpace { id: number; name: string; slug: string; sections: NavigationCategory[] }

const props = defineProps<{ spaces: NavigationSpace[]; currentSpace?: string; currentArticle?: string; open?: boolean }>()
defineEmits<{ close: [] }>()

const categories = computed(() => props.spaces.flatMap(space => space.sections.map(category => ({ ...category, spaceSlug: space.slug }))))
const activeCategoryId = computed(() => {
  for (const space of props.spaces) {
    for (const category of space.sections) {
      if (space.slug === props.currentSpace && category.articles.some(article => article.slug === props.currentArticle)) return category.id
    }
  }
})
const expandedCategories = ref(new Set<number>())

watch([() => props.spaces, activeCategoryId], () => {
  if (activeCategoryId.value !== undefined) {
    expandedCategories.value = new Set([...expandedCategories.value, activeCategoryId.value])
  }
}, { immediate: true })

function toggleCategory(id: number) {
  const next = new Set(expandedCategories.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedCategories.value = next
}
function isActiveArticle(space: string, article: string) { return space === props.currentSpace && article === props.currentArticle }
</script>
