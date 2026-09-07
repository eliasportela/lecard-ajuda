<template>
  <section class="admin-page">
    <header class="form-page__header"><div><NuxtLink class="back-link" to="/admin/secoes">‹ Categorias</NuxtLink><h1>Nova categoria</h1><p>Crie uma categoria para organizar os artigos da central.</p></div></header>
    <form class="admin-panel form-card" @submit.prevent="save">
      <label class="field">Nome da categoria<input v-model="form.title" required minlength="2" maxlength="160" @input="syncSlug"></label>
      <label class="field">Slug<input v-model="form.slug" required pattern="[a-z0-9-]+" maxlength="180"></label>
      <label class="field">Espaço<select v-model.number="form.spaceId" required><option disabled :value="0">Selecione um espaço</option><option v-for="space in meta?.spaces" :key="space.id" :value="space.id">{{ space.name }}</option></select></label>
      <CategoryIconPicker v-model="form.icon" />
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <div class="form-actions"><NuxtLink class="btn btn--secondary" to="/admin/secoes">Cancelar</NuxtLink><button class="btn" :disabled="saving">{{ saving ? 'Criando...' : 'Criar Categoria' }}</button></div>
    </form>
  </section>
</template>
<script setup lang="ts">
import type { CategoryIconName } from '~~/shared/category-icons'
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { data: meta } = await useFetch('/api/articles/meta')
const form = reactive({ spaceId: 0, title: '', slug: '', icon: 'Folder' as CategoryIconName })
const saving = ref(false)
const errorMessage = ref('')
const { showToast } = useAppToast()
function slugify(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
function syncSlug() { form.slug = slugify(form.title) }
async function save() {
  saving.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/sections', { method: 'POST', body: form })
    showToast('Categoria criada com sucesso.')
    await navigateTo('/admin/secoes')
  } catch {
    errorMessage.value = 'Não foi possível criar a categoria. Verifique os dados e tente novamente.'
  } finally { saving.value = false }
}
</script>
