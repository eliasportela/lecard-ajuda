<template><AdminArticleEditor v-model="form" :categories="meta?.sections || []" :authors="meta?.authors || []" :can-change-author="meta?.canChangeAuthor" :saving="saving" :save-version="saveVersion" @save="save" @title-input="syncSlug" @attachment-uploaded="trackAttachment" /></template>
<script setup lang="ts">
import type { ArticleEditorModel } from '~/components/AdminArticleEditor.vue'
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { data: meta } = await useFetch('/api/articles/meta')
const form = reactive<ArticleEditorModel>({ title: '', slug: '', summary: '', sectionId: 0, authorId: meta.value?.currentUserId || 0, markdown: '', status: 'DRAFT' })
const attachmentIds = ref<number[]>([])
const saving = ref(false)
const saveVersion = ref(0)
function slugify(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
function syncSlug() { form.slug = slugify(form.title) }
function trackAttachment(id: number) { attachmentIds.value.push(id) }
async function save() { saving.value = true; try { const result = await $fetch<{ id: number }>('/api/articles', { method: 'POST', body: { ...form, attachmentIds: attachmentIds.value } }); saveVersion.value++; await navigateTo(`/admin/artigos/${result.id}`) } finally { saving.value = false } }
</script>
