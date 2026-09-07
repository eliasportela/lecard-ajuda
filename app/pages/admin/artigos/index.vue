<template>
  <section class="admin-page admin-page--flush">
    <header class="admin-page__header">
      <div><p class="admin-page__kicker">Conteúdo</p><h1>Base de Conhecimento</h1></div>
      <div class="admin-page__actions">
        <NuxtLink class="btn" to="/admin/artigos/novo"><Plus class="admin-icon" /> Criar Artigo</NuxtLink>
        <NuxtLink class="btn btn--secondary" to="/" target="_blank" rel="noopener noreferrer">Ver Central <ExternalLink class="admin-icon" /></NuxtLink>
      </div>
    </header>
    <div class="admin-tabs"><button class="admin-tab is-active" type="button">Artigos <span>{{ filteredArticles.length }}</span></button><NuxtLink class="admin-tab" to="/admin/secoes">Categorias</NuxtLink><NuxtLink class="admin-tab" to="/admin/espacos">Espaços</NuxtLink></div>
    <div v-if="selectedIds.length" class="bulk-actions">
      <strong>{{ selectedIds.length }} {{ selectedIds.length === 1 ? 'artigo selecionado' : 'artigos selecionados' }}</strong>
      <span class="bulk-actions__divider" aria-hidden="true"></span>
      <button type="button" aria-label="Excluir Artigos Selecionados" :disabled="bulkDeleting" @click="deleteSelected"><Trash2 class="admin-icon" /> Excluir</button>
      <button type="button" aria-label="Limpar Seleção" :disabled="bulkDeleting" @click="clearSelection"><X class="admin-icon" /></button>
    </div>
    <div v-else class="admin-toolbar">
      <label class="admin-search"><Search class="admin-icon" /><input v-model="query" type="search" placeholder="Buscar artigos"></label>
      <label class="admin-filter"><ListFilter class="admin-icon" /><select v-model="status"><option value="ALL">Todos os status</option><option value="PUBLISHED">Publicados</option><option value="DRAFT">Rascunhos</option><option value="ARCHIVED">Arquivados</option></select></label>
      <label class="admin-filter"><Folder class="admin-icon" /><select v-model="categoryId"><option value="ALL">Todas as categorias</option><option v-for="category in meta?.sections" :key="category.id" :value="String(category.id)">{{ category.title }}</option></select></label>
      <span class="admin-toolbar__count">{{ filteredArticles.length }} {{ filteredArticles.length === 1 ? 'artigo' : 'artigos' }}</span>
    </div>
    <div class="admin-table-wrap">
      <table class="admin-table admin-table--selectable">
        <thead><tr><th class="check-cell"><input type="checkbox" aria-label="Selecionar todos" :checked="allFilteredSelected" :indeterminate="someFilteredSelected" @change="toggleAll"></th><th><button class="sort-button" type="button" @click="sortBy('title')">Título <ArrowUpDown class="admin-icon" :class="{ 'is-active': sortKey === 'title' }" /></button></th><th>Categoria</th><th>Autor</th><th><button class="sort-button" type="button" @click="sortBy('status')">Status <ArrowUpDown class="admin-icon" :class="{ 'is-active': sortKey === 'status' }" /></button></th><th><button class="sort-button" type="button" @click="sortBy('updatedAt')">Atualizado <ArrowUpDown class="admin-icon" :class="{ 'is-active': sortKey === 'updatedAt' }" /></button></th><th class="action-cell"></th></tr></thead>
        <tbody>
          <tr v-for="article in filteredArticles" :key="article.id" class="clickable-row" tabindex="0" @click="openArticle(article.id)" @keydown.enter="openArticle(article.id)">
            <td class="check-cell"><input type="checkbox" :aria-label="`Selecionar ${article.title}`" :checked="selectedIds.includes(article.id)" @click.stop @change="toggleArticle(article.id)"></td>
            <td><NuxtLink class="article-title" :to="`/admin/artigos/${article.id}`"><span class="article-title__icon"><BookOpen class="admin-icon" /></span><span><strong>{{ article.title }}</strong><small>/{{ article.slug }}</small></span></NuxtLink></td>
            <td><span class="category-pill">{{ article.category }}</span></td>
            <td><span class="article-author" :title="article.authorName"><span class="avatar">{{ initials(article.authorName) }}</span><span>{{ article.authorName }}</span></span></td>
            <td><span class="status-pill" :class="`status-pill--${article.status.toLowerCase()}`"><i />{{ statusLabel[article.status] }}</span></td>
            <td class="muted-cell">{{ formatDate(article.updatedAt) }}</td>
            <td class="action-cell" @click.stop>
              <div class="row-menu">
                <button class="row-menu__trigger" type="button" :aria-label="`Opções de ${article.title}`" :aria-expanded="openMenuId === article.id" @click="toggleMenu(article.id)"><Ellipsis class="admin-icon" /></button>
                <div v-if="openMenuId === article.id" class="row-menu__popover">
                  <button type="button" :class="{ 'is-current': article.status === 'PUBLISHED' }" :disabled="updatingId === article.id" @click="changeStatus(article, 'PUBLISHED')"><CircleCheck class="admin-icon" /><span><strong>Publicado</strong><small>Visível na central</small></span></button>
                  <button type="button" :class="{ 'is-current': article.status === 'DRAFT' }" :disabled="updatingId === article.id" @click="changeStatus(article, 'DRAFT')"><FilePenLine class="admin-icon" /><span><strong>Rascunho</strong><small>Oculto para visitantes</small></span></button>
                  <button type="button" :class="{ 'is-current': article.status === 'ARCHIVED' }" :disabled="updatingId === article.id" @click="changeStatus(article, 'ARCHIVED')"><Archive class="admin-icon" /><span><strong>Arquivado</strong><small>Remover da listagem ativa</small></span></button>
                  <button class="row-menu__delete" type="button" :disabled="updatingId === article.id" @click="deleteArticle(article)"><Trash2 class="admin-icon" /><span><strong>Excluir Artigo</strong><small>Remover permanentemente</small></span></button>
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="!filteredArticles.length"><td class="empty-state" colspan="7"><strong>Nenhum artigo encontrado</strong><span>Experimente mudar a busca ou os filtros.</span></td></tr>
        </tbody>
      </table>
    </div>
    <AppConfirmDialog
      :open="Boolean(deleteRequest)"
      title="Confirmar exclusão"
      :description="deleteDescription"
      :loading="deleting"
      :error="deleteError"
      :confirm-label="deleteRequest?.type === 'bulk' ? 'Excluir artigos' : 'Excluir artigo'"
      @cancel="closeDeleteDialog"
      @confirm="confirmDeletion"
    />
  </section>
</template>
<script setup lang="ts">
import { Archive, ArrowUpDown, BookOpen, CircleCheck, Ellipsis, ExternalLink, FilePenLine, Folder, ListFilter, Plus, Search, Trash2, X } from '@lucide/vue'
definePageMeta({ layout: 'admin', middleware: 'admin' })
type Article = { id: number; title: string; slug: string; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; updatedAt: string; sectionId: number; category: string; authorId: number; authorName: string }
const { data, refresh } = await useFetch<Article[]>('/api/articles')
const { data: meta } = await useFetch('/api/articles/meta')
const query = ref('')
const status = ref('ALL')
const categoryId = ref('ALL')
const sortKey = ref<'title' | 'status' | 'updatedAt'>('updatedAt')
const sortDirection = ref<'asc' | 'desc'>('desc')
const openMenuId = ref<number | null>(null)
const updatingId = ref<number | null>(null)
const selectedIds = ref<number[]>([])
const bulkDeleting = ref(false)
const deleteRequest = ref<{ type: 'single'; article: Article } | { type: 'bulk'; ids: number[] } | null>(null)
const deleteError = ref('')
const statusLabel = { DRAFT: 'Rascunho', PUBLISHED: 'Publicado', ARCHIVED: 'Arquivado' }
const filteredArticles = computed(() => (data.value || []).filter(article => {
  const term = query.value.toLocaleLowerCase('pt-BR')
  const matchesQuery = article.title.toLocaleLowerCase('pt-BR').includes(term) || article.slug.toLocaleLowerCase('pt-BR').includes(term)
  return matchesQuery && (status.value === 'ALL' || article.status === status.value) && (categoryId.value === 'ALL' || article.sectionId === Number(categoryId.value))
}).sort((a, b) => {
  const direction = sortDirection.value === 'asc' ? 1 : -1
  if (sortKey.value === 'updatedAt') return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * direction
  return a[sortKey.value].localeCompare(b[sortKey.value], 'pt-BR', { sensitivity: 'base' }) * direction
}))
const allFilteredSelected = computed(() => filteredArticles.value.length > 0 && filteredArticles.value.every(article => selectedIds.value.includes(article.id)))
const someFilteredSelected = computed(() => !allFilteredSelected.value && filteredArticles.value.some(article => selectedIds.value.includes(article.id)))
const deleting = computed(() => bulkDeleting.value || updatingId.value !== null)
const deleteDescription = computed(() => {
  if (deleteRequest.value?.type === 'single') return `O artigo “${deleteRequest.value.article.title}” será removido permanentemente. Esta ação não pode ser desfeita.`
  const total = deleteRequest.value?.ids.length || 0
  return `${total} ${total === 1 ? 'artigo selecionado será removido' : 'artigos selecionados serão removidos'} permanentemente. Esta ação não pode ser desfeita.`
})
function formatDate(value: string) { return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) }
function initials(name: string) { return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() }
function openArticle(id: number) { navigateTo(`/admin/artigos/${id}`) }
function toggleMenu(id: number) { openMenuId.value = openMenuId.value === id ? null : id }
function toggleArticle(id: number) { selectedIds.value = selectedIds.value.includes(id) ? selectedIds.value.filter(selectedId => selectedId !== id) : [...selectedIds.value, id] }
function toggleAll() {
  const filteredIds = filteredArticles.value.map(article => article.id)
  selectedIds.value = allFilteredSelected.value ? selectedIds.value.filter(id => !filteredIds.includes(id)) : [...new Set([...selectedIds.value, ...filteredIds])]
}
function clearSelection() { selectedIds.value = [] }
function sortBy(key: typeof sortKey.value) { if (sortKey.value === key) sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'; else { sortKey.value = key; sortDirection.value = 'asc' } }
async function changeStatus(article: Article, nextStatus: Article['status']) {
  if (article.status === nextStatus) { openMenuId.value = null; return }
  updatingId.value = article.id
  try { await $fetch(`/api/articles/${article.id}/status`, { method: 'PATCH', body: { status: nextStatus } }); await refresh(); openMenuId.value = null }
  finally { updatingId.value = null }
}
async function deleteArticle(article: Article) {
  deleteError.value = ''
  deleteRequest.value = { type: 'single', article }
  openMenuId.value = null
}
async function deleteSelected() {
  deleteError.value = ''
  deleteRequest.value = { type: 'bulk', ids: [...selectedIds.value] }
}
function closeDeleteDialog() {
  if (!deleting.value) deleteRequest.value = null
}
async function confirmDeletion() {
  const request = deleteRequest.value
  if (!request) return
  deleteError.value = ''
  if (request.type === 'single') updatingId.value = request.article.id
  else bulkDeleting.value = true
  try {
    if (request.type === 'single') await $fetch(`/api/articles/${request.article.id}`, { method: 'DELETE' })
    else {
      await $fetch('/api/articles/bulk-delete', { method: 'POST', body: { ids: request.ids } })
      clearSelection()
    }
    await refresh()
    deleteRequest.value = null
  } catch {
    deleteError.value = 'Não foi possível excluir. Tente novamente.'
  } finally {
    updatingId.value = null
    bulkDeleting.value = false
  }
}
</script>
