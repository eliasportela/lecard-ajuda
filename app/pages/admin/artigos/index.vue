<template>
  <section>
    <div style="display:flex;justify-content:space-between;align-items:center"><h1>Artigos</h1><NuxtLink class="btn" to="/admin/artigos/novo">Novo artigo</NuxtLink></div>
    <div class="admin-panel"><p v-if="!data?.length">Nenhum artigo cadastrado.</p><p v-for="article in data" :key="article.id"><NuxtLink :to="`/admin/artigos/${article.id}`">{{ article.title }}</NuxtLink> — {{ article.status }}</p></div>
  </section>
</template>
<script setup lang="ts">definePageMeta({ layout: 'admin', middleware: 'admin' }); const { data } = await useFetch('/api/articles')</script>
