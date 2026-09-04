<template>
  <section><h1>Novo artigo</h1><form class="admin-panel" @submit.prevent="save">
    <label class="field">Título<input v-model="form.title" required></label>
    <label class="field">Slug<input v-model="form.slug" required pattern="[a-z0-9-]+"></label>
    <label class="field">Resumo<input v-model="form.summary"></label>
    <label class="field">Seção<select v-model.number="form.sectionId" required><option v-for="s in meta?.sections" :key="s.id" :value="s.id">{{ s.title }}</option></select></label>
    <label class="field">Markdown<textarea v-model="form.markdown" rows="18" required></textarea></label>
    <label class="field">Status<select v-model="form.status"><option value="DRAFT">Rascunho</option><option value="PUBLISHED">Publicado</option></select></label>
    <button class="btn">Salvar</button>
  </form></section>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { data: meta } = await useFetch('/api/articles/meta')
const form = reactive({ title: '', slug: '', summary: '', sectionId: 0, markdown: '# Novo artigo\n', status: 'DRAFT' })
async function save() { const result = await $fetch<{ id: number }>('/api/articles', { method: 'POST', body: form }); await navigateTo(`/admin/artigos/${result.id}`) }
</script>
