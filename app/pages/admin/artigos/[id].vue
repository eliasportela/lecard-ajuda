<template>
  <section><h1>Editar artigo</h1><form v-if="article" class="admin-panel" @submit.prevent="save">
    <label class="field">Título<input v-model="article.title" required></label>
    <label class="field">Slug<input v-model="article.slug" required pattern="[a-z0-9-]+"></label>
    <label class="field">Resumo<input v-model="article.summary"></label>
    <label class="field">Seção<select v-model.number="article.sectionId" required><option v-for="s in meta?.sections" :key="s.id" :value="s.id">{{ s.title }}</option></select></label>
    <label class="field">Markdown<textarea v-model="article.markdown" rows="18" required></textarea></label>
    <label class="field">Status<select v-model="article.status"><option value="DRAFT">Rascunho</option><option value="PUBLISHED">Publicado</option><option value="ARCHIVED">Arquivado</option></select></label>
    <button class="btn" :disabled="saving">{{ saving ? 'Salvando...' : 'Salvar alterações' }}</button>
  </form></section>
</template>
<script setup lang="ts">
import { ofetch } from 'ofetch'

definePageMeta({ layout: 'admin', middleware: 'admin' })
const route = useRoute()
interface ArticleForm { title: string; slug: string; summary: string | null; sectionId: number; markdown: string; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }
const articlePath = `/api/articles/${route.params.id}`
const articleUrl = import.meta.server ? `${useRequestURL().origin}${articlePath}` : articlePath
const article = ref<ArticleForm>(await ofetch<ArticleForm>(articleUrl, { headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined }))
const { data: meta } = await useFetch('/api/articles/meta')
const saving = ref(false)
async function save() { saving.value = true; try { await ofetch(articlePath, { method: 'PUT', body: article.value }) } finally { saving.value = false } }
</script>
