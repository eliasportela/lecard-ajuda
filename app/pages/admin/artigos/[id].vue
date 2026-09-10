<template><AdminArticleEditor v-if="article" v-model="article" :categories="meta?.sections || []" :authors="meta?.authors || []" :can-change-author="meta?.canChangeAuthor" :saving="saving" :article-id="Number(route.params.id)" :preview-url="previewUrl" :save-version="saveVersion" allow-archived @save="save" /></template>
<script setup lang="ts">
import { ofetch } from 'ofetch'
import type { ArticleEditorModel } from '~/components/AdminArticleEditor.vue'
definePageMeta({ layout: 'admin', middleware: 'admin' })
const route = useRoute()
const articlePath = `/api/articles/${route.params.id}`
const articleUrl = import.meta.server ? `${useRequestURL().origin}${articlePath}` : articlePath
const article = ref<ArticleEditorModel>(await ofetch<ArticleEditorModel>(articleUrl, { headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined }))
const { data: meta } = await useFetch('/api/articles/meta')
const saving = ref(false)
const saveVersion = ref(0)
const previewUrl = computed(() => {
  const section = meta.value?.sections.find(item => item.id === article.value.sectionId)
  const space = meta.value?.spaces.find(item => item.id === section?.spaceId)
  return space ? `/${space.slug}/${article.value.slug}` : undefined
})
async function save() { saving.value = true; try { await ofetch(articlePath, { method: 'PUT', body: article.value }); saveVersion.value++ } finally { saving.value = false } }
</script>
