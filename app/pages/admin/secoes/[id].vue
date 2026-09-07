<template>
  <section class="admin-page">
    <header class="form-page__header"><div><NuxtLink class="back-link" to="/admin/secoes">‹ Categorias</NuxtLink><h1>Editar categoria</h1><p>Atualize os dados da categoria.</p></div></header>
    <form v-if="category" class="admin-panel form-card" @submit.prevent="save">
      <label class="field">Nome da categoria<input v-model="category.title" required minlength="2" maxlength="160"></label>
      <label class="field">Slug<input v-model="category.slug" required pattern="[a-z0-9-]+" maxlength="180"></label>
      <label class="field">Espaço<select v-model.number="category.spaceId" required><option v-for="space in meta?.spaces" :key="space.id" :value="space.id">{{ space.name }}</option></select></label>
      <CategoryIconPicker v-model="categoryIcon" />
      <div class="form-actions"><NuxtLink class="btn btn--secondary" to="/admin/secoes">Cancelar</NuxtLink><button class="btn" :disabled="saving">{{ saving ? 'Salvando...' : 'Salvar Alterações' }}</button></div>
    </form>
  </section>
</template>
<script setup lang="ts">
import type { CategoryIconName } from '~~/shared/category-icons'
definePageMeta({ layout: 'admin', middleware: 'admin' })
const route = useRoute()
type Category = { id: number; spaceId: number; title: string; slug: string; icon: CategoryIconName; position: number }
const { data: category } = await useFetch<Category>(`/api/sections/${route.params.id}`)
const { data: meta } = await useFetch('/api/articles/meta')
const saving = ref(false)
const categoryIcon = computed<CategoryIconName>({
  get: () => category.value?.icon || 'Folder',
  set: icon => { if (category.value) category.value = { ...category.value, icon } }
})
async function save() { if (!category.value) return; saving.value = true; try { await $fetch(`/api/sections/${route.params.id}`, { method: 'PUT', body: { spaceId: category.value.spaceId, title: category.value.title, slug: category.value.slug, icon: category.value.icon } }); await navigateTo('/admin/secoes') } finally { saving.value = false } }
</script>
