<template>
  <section><h1>Seções</h1><div class="admin-panel"><form @submit.prevent="create"><label class="field">Espaço<select v-model.number="form.spaceId" required><option v-for="space in meta?.spaces" :key="space.id" :value="space.id">{{ space.name }}</option></select></label><label class="field">Título<input v-model="form.title" required></label><label class="field">Slug<input v-model="form.slug" required pattern="[a-z0-9-]+"></label><button class="btn">Criar seção</button></form></div><div class="admin-panel" style="margin-top:24px"><p v-for="item in sections" :key="item.id">{{ item.title }} — /{{ item.slug }}</p></div></section>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { data: sections, refresh } = await useFetch('/api/sections'); const { data: meta } = await useFetch('/api/articles/meta')
const form = reactive({ spaceId: 0, title: '', slug: '', position: 0 })
async function create() { await $fetch('/api/sections', { method: 'POST', body: form }); Object.assign(form, { spaceId: 0, title: '', slug: '', position: 0 }); await refresh() }
</script>
