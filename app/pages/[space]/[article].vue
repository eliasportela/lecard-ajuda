<template>
  <div class="docs-grid">
    <aside class="sidebar">
      <template v-for="section in data?.navigation" :key="section.id">
        <div class="nav-title">{{ section.title }}</div>
        <NuxtLink v-for="item in section.articles" :key="item.id" class="nav-link" :to="`/${route.params.space}/${item.slug}`">{{ item.title }}</NuxtLink>
      </template>
    </aside>
    <article class="article">
      <h1>{{ data?.article.title }}</h1>
      <p v-if="data?.article.summary" style="color:var(--muted);font-size:19px">{{ data.article.summary }}</p>
      <div v-html="data?.article.html" />
    </article>
    <aside class="toc">Nesta página</aside>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { data, error } = await useFetch(`/api/public/articles/${route.params.space}/${route.params.article}`)
if (error.value) throw createError({ statusCode: error.value.statusCode ?? 404, statusMessage: 'Artigo não encontrado' })
useSeoMeta({ title: () => data.value?.article.title, description: () => data.value?.article.summary ?? '' })
</script>
