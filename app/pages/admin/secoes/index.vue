<template>
  <section class="admin-page admin-page--flush">
    <header class="admin-page__header"><div><p class="admin-page__kicker">Conteúdo</p><h1>Base de Conhecimento</h1></div><div class="admin-page__actions"><NuxtLink class="btn" to="/admin/secoes/novo"><Plus class="admin-icon" /> Nova Categoria</NuxtLink></div></header>
    <div class="admin-tabs"><NuxtLink class="admin-tab" to="/admin/artigos">Artigos</NuxtLink><button class="admin-tab is-active" type="button">Categorias <span>{{ filteredCategories.length }}</span></button><NuxtLink class="admin-tab" to="/admin/espacos">Espaços</NuxtLink></div>
    <div class="admin-toolbar"><label class="admin-search"><Search class="admin-icon" /><input v-model="query" type="search" placeholder="Buscar categorias"></label><span class="admin-toolbar__count">{{ filteredCategories.length }} {{ filteredCategories.length === 1 ? 'categoria' : 'categorias' }}</span></div>
    <div class="admin-table-wrap"><table class="admin-table admin-table--selectable">
      <thead><tr><th class="order-cell">Ordem</th><th>Categoria</th><th>Espaço</th><th>Posição</th><th class="action-cell"></th></tr></thead>
      <tbody>
        <template v-for="group in groupedCategories" :key="group.spaceId">
          <tr class="category-group-row"><td colspan="5"><PanelsTopLeft /><strong>{{ group.spaceName }}</strong><span>{{ group.categories.length }} {{ group.categories.length === 1 ? 'categoria' : 'categorias' }}</span></td></tr>
          <tr v-for="category in group.categories" :key="category.id" class="clickable-row" :class="{ 'is-dragging': draggedCategoryId === category.id }" tabindex="0" @click="openCategory(category.id)" @keydown.enter.self="openCategory(category.id)" @dragover.prevent="dragCategoryOver(category)" @drop.prevent="dropCategory">
            <td class="order-cell" @click.stop><button class="drag-handle" type="button" :draggable="!ordering && !query" :disabled="ordering || Boolean(query)" :aria-label="query ? 'Limpe a busca para reordenar' : `Arrastar ${category.title}. Use as setas para mover pelo teclado.`" @dragstart="startCategoryDrag(category, $event)" @dragend="cancelCategoryDrag" @keydown.up.prevent="moveCategory(category, -1)" @keydown.down.prevent="moveCategory(category, 1)"><GripVertical /></button></td>
            <td><NuxtLink class="article-title" :to="`/admin/secoes/${category.id}`"><span class="article-title__icon article-title__icon--berry"><CategoryIcon :name="category.icon" class="admin-icon" /></span><span><strong>{{ category.title }}</strong><small>/{{ category.slug }}</small></span></NuxtLink></td>
            <td class="muted-cell">{{ group.spaceName }}</td><td class="muted-cell">{{ category.position + 1 }}</td>
            <td class="action-cell" @click.stop><div class="row-menu"><button class="row-menu__trigger" type="button" :aria-label="`Opções de ${category.title}`" :aria-expanded="openMenuId === category.id" @click="toggleMenu(category.id)"><Ellipsis class="admin-icon" /></button><div v-if="openMenuId === category.id" class="row-menu__popover"><button type="button" @click="editCategory(category.id)"><Pencil class="admin-icon" /><span><strong>Editar Categoria</strong><small>Alterar dados e espaço</small></span></button><button class="row-menu__delete" type="button" @click="requestDelete(category)"><Trash2 class="admin-icon" /><span><strong>Excluir Categoria</strong><small>Disponível quando estiver vazia</small></span></button></div></div></td>
          </tr>
        </template>
        <tr v-if="!filteredCategories.length"><td class="empty-state" colspan="5"><strong>Nenhuma categoria encontrada</strong><span>Experimente mudar a busca ou criar uma nova categoria.</span></td></tr>
      </tbody>
    </table></div>
    <AppConfirmDialog :open="Boolean(deleteRequest)" title="Excluir categoria" :description="deleteDescription" :loading="deleting" :error="deleteError" confirm-label="Excluir categoria" @cancel="closeDeleteDialog" @confirm="confirmDelete" />
  </section>
</template>
<script setup lang="ts">
import { Ellipsis, GripVertical, PanelsTopLeft, Pencil, Plus, Search, Trash2 } from '@lucide/vue'
definePageMeta({ layout: 'admin', middleware: 'admin' })
type Category = { id: number; spaceId: number; title: string; slug: string; icon: string; position: number }
const { data: categories } = await useFetch<Category[]>('/api/sections')
const { data: meta } = await useFetch('/api/articles/meta')
const query = ref('')
const ordering = ref(false)
const { showToast } = useAppToast()
const draggedCategoryId = ref<number | null>(null)
const categoryOrderBeforeDrag = ref<Category[] | null>(null)
const categoryDropped = ref(false)
const openMenuId = ref<number | null>(null)
const deleteRequest = ref<Category | null>(null)
const deleting = ref(false)
const deleteError = ref('')
const deleteDescription = computed(() => `A categoria “${deleteRequest.value?.title || ''}” será removida permanentemente. Só é possível excluir categorias sem artigos vinculados.`)
const filteredCategories = computed(() => (categories.value || []).filter(category => { const term = query.value.toLocaleLowerCase('pt-BR'); return category.title.toLocaleLowerCase('pt-BR').includes(term) || category.slug.toLocaleLowerCase('pt-BR').includes(term) }))
const groupedCategories = computed(() => {
  const groups = new Map<number, Category[]>()
  for (const category of filteredCategories.value) groups.set(category.spaceId, [...(groups.get(category.spaceId) || []), category])
  const spaceOrder = new Map((meta.value?.spaces || []).map((space, index) => [space.id, index]))
  return [...groups.entries()]
    .map(([spaceId, groupCategories]) => ({ spaceId, spaceName: spaceName(spaceId), categories: groupCategories.sort((a, b) => a.position - b.position) }))
    .sort((a, b) => (spaceOrder.get(a.spaceId) ?? Number.MAX_SAFE_INTEGER) - (spaceOrder.get(b.spaceId) ?? Number.MAX_SAFE_INTEGER))
})
function spaceName(id: number) { return meta.value?.spaces.find(space => space.id === id)?.name || '—' }
function openCategory(id: number) { navigateTo(`/admin/secoes/${id}`) }
function editCategory(id: number) { openMenuId.value = null; navigateTo(`/admin/secoes/${id}`) }
function toggleMenu(id: number) { openMenuId.value = openMenuId.value === id ? null : id }
function requestDelete(category: Category) { deleteError.value = ''; deleteRequest.value = category; openMenuId.value = null }
function closeDeleteDialog() { if (!deleting.value) deleteRequest.value = null }
async function confirmDelete() {
  if (!deleteRequest.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await $fetch(`/api/sections/${deleteRequest.value.id}`, { method: 'DELETE' })
    categories.value = (categories.value || []).filter(category => category.id !== deleteRequest.value?.id)
    deleteRequest.value = null
  } catch (error: any) {
    deleteError.value = error?.statusCode === 409
      ? 'Existem artigos vinculados a esta categoria. Exclua-os ou vincule-os a outra categoria antes de continuar.'
      : 'Não foi possível excluir a categoria. Tente novamente.'
  }
  finally { deleting.value = false }
}
function siblings(category: Category) { return (categories.value || []).filter(item => item.spaceId === category.spaceId) }
function startCategoryDrag(category: Category, event: DragEvent) {
  if (!categories.value || ordering.value || query.value) return
  draggedCategoryId.value = category.id
  categoryOrderBeforeDrag.value = [...categories.value]
  categoryDropped.value = false
  event.dataTransfer?.setData('text/plain', String(category.id))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}
function dragCategoryOver(target: Category) {
  if (!categories.value || draggedCategoryId.value === null || draggedCategoryId.value === target.id) return
  const dragged = categories.value.find(item => item.id === draggedCategoryId.value)
  if (!dragged || dragged.spaceId !== target.spaceId) return
  const reordered = [...categories.value]
  const from = reordered.findIndex(item => item.id === dragged.id)
  const to = reordered.findIndex(item => item.id === target.id)
  const [item] = reordered.splice(from, 1)
  reordered.splice(to, 0, item!)
  const positions = new Map(reordered.filter(item => item.spaceId === target.spaceId).map((item, position) => [item.id, position]))
  categories.value = reordered.map(item => item.spaceId === target.spaceId ? { ...item, position: positions.get(item.id)! } : item)
}
async function dropCategory() {
  if (!categories.value || draggedCategoryId.value === null || !categoryOrderBeforeDrag.value) return
  categoryDropped.value = true
  const previousOrder = categoryOrderBeforeDrag.value
  const category = categories.value.find(item => item.id === draggedCategoryId.value)!
  const ids = siblings(category).map(item => item.id)
  draggedCategoryId.value = null
  categoryOrderBeforeDrag.value = null
  const previousIds = previousOrder.filter(item => item.spaceId === category.spaceId).map(item => item.id)
  if (ids.every((id, index) => id === previousIds[index])) return
  await saveCategoryOrder(category.spaceId, ids, previousOrder)
}
function cancelCategoryDrag() {
  if (!categoryDropped.value && categoryOrderBeforeDrag.value) categories.value = categoryOrderBeforeDrag.value
  draggedCategoryId.value = null
  categoryOrderBeforeDrag.value = null
  categoryDropped.value = false
}
async function moveCategory(category: Category, direction: -1 | 1) {
  if (!categories.value) return
  const previousOrder = [...categories.value]
  const group = siblings(category)
  const index = group.findIndex(item => item.id === category.id)
  const target = index + direction
  if (index < 0 || target < 0 || target >= group.length) return
  ;[group[index], group[target]] = [group[target]!, group[index]!]
  const positions = new Map(group.map((item, position) => [item.id, position]))
  categories.value = categories.value.map(item => item.spaceId === category.spaceId ? { ...item, position: positions.get(item.id)! } : item).sort((a, b) => a.spaceId - b.spaceId || a.position - b.position)
  await saveCategoryOrder(category.spaceId, group.map(item => item.id), previousOrder)
}
async function saveCategoryOrder(spaceId: number, ids: number[], previousOrder: Category[]) {
  ordering.value = true
  try {
    await $fetch('/api/sections/reorder', { method: 'POST', body: { spaceId, ids } })
    showToast('Ordem das categorias salva.')
  } catch {
    categories.value = previousOrder
    showToast('Não foi possível salvar a ordem das categorias.', 'error')
  }
  finally { ordering.value = false }
}
</script>
