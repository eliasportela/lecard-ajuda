<template>
  <div class="search-page">
    <span class="eyebrow"><span>✦</span> Pesquisa</span>
    <h1>Resultados de busca</h1>
    <p class="search-page__lead">Resultados encontrados para <strong>“{{ route.query.q }}”</strong></p>
    <div v-if="data?.length" class="search-results">
      <NuxtLink v-for="item in data" :key="item.id" class="search-result" :to="`/${item.spaceSlug}/${item.slug}`">
        <div><strong>{{ item.title }}</strong><p>{{ item.summary || 'Abra o artigo para saber mais.' }}</p></div><ChevronRight class="public-icon" />
      </NuxtLink>
    </div>
    <div v-else class="empty-public"><span>⌕</span><h3>Nenhum resultado encontrado</h3><p>Tente pesquisar usando outras palavras.</p></div>
  </div>
</template>
<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
const route = useRoute()
const { data } = await useFetch('/api/public/search', { query: { q: route.query.q } })
</script>
