<template>
  <div class="docs-grid">
    <aside class="sidebar">
      <div v-for="section in data?.sections" :key="section.id">
        <div class="nav-title">{{ section.title }}</div>
        <NuxtLink v-for="article in section.articles" :key="article.id" class="nav-link" :to="`/${data?.space.slug}/${article.slug}`">{{ article.title }}</NuxtLink>
      </div>
    </aside>
    <article class="article">
      <p style="color:var(--brand);font-weight:700">BASE DE CONHECIMENTO</p>
      <h1>{{ data?.space.name ?? 'Lecard Ajuda' }}</h1>
      <p>{{ data?.space.description ?? 'Encontre respostas, orientações e documentação dos nossos sistemas.' }}</p>
      <div class="admin-panel" style="margin-top:32px">
        <h2>Comece por aqui</h2>
        <p v-if="!data?.sections.length">A base está pronta. Entre como administrador para cadastrar o primeiro artigo.</p>
        <NuxtLink v-else :to="`/${data.space.slug}/${data.sections[0]?.articles[0]?.slug}`">Abrir documentação →</NuxtLink>
      </div>
    </article>
    <aside class="toc">Navegação</aside>
  </div>
</template>

<script setup lang="ts">
const { data } = await useFetch('/api/public/navigation')
useSeoMeta({ title: 'Lecard Ajuda', description: 'Base de conhecimento Lecard' })
</script>
