<template>
  <section class="admin-page admin-page--flush">
    <header class="admin-page__header">
      <div><p class="admin-page__kicker">Conteúdo</p><h1>Base de Conhecimento</h1></div>
      <div class="admin-page__actions"><NuxtLink class="btn" to="/admin/espacos/novo"><Plus class="admin-icon" /> Novo Espaço</NuxtLink></div>
    </header>
    <div class="admin-tabs"><NuxtLink class="admin-tab" to="/admin/artigos">Artigos</NuxtLink><NuxtLink class="admin-tab" to="/admin/secoes">Categorias</NuxtLink><button class="admin-tab is-active" type="button">Espaços <span>{{ filteredSpaces.length }}</span></button></div>
    <div class="admin-toolbar"><label class="admin-search"><Search class="admin-icon" /><input v-model="query" type="search" placeholder="Buscar espaços"></label><span class="admin-toolbar__count">{{ filteredSpaces.length }} {{ filteredSpaces.length === 1 ? 'espaço' : 'espaços' }}</span></div>
    <div class="admin-table-wrap"><table class="admin-table admin-table--selectable">
      <thead><tr><th class="order-cell">Ordem</th><th>Espaço</th><th>Visibilidade</th><th>Categorias</th><th class="action-cell"></th></tr></thead>
      <tbody>
        <tr v-for="space in filteredSpaces" :key="space.id" class="clickable-row" :class="{ 'is-dragging': draggedSpaceId === space.id }" tabindex="0" @click="openSpace(space.id)" @keydown.enter.self="openSpace(space.id)" @dragover.prevent="dragSpaceOver(space.id)" @drop.prevent="dropSpace">
          <td class="order-cell" @click.stop><button class="drag-handle" type="button" :draggable="!ordering && !query" :disabled="ordering || Boolean(query)" :aria-label="query ? 'Limpe a busca para reordenar' : `Arrastar ${space.name}. Use as setas para mover pelo teclado.`" @dragstart="startSpaceDrag(space.id, $event)" @dragend="cancelSpaceDrag" @keydown.up.prevent="moveSpace(space.id, -1)" @keydown.down.prevent="moveSpace(space.id, 1)"><GripVertical /></button></td>
          <td><NuxtLink class="article-title" :to="`/admin/espacos/${space.id}`"><span class="article-title__icon"><PanelsTopLeft class="admin-icon" /></span><span><strong>{{ space.name }}</strong><small>/{{ space.slug }}</small></span></NuxtLink></td>
          <td><span class="status-pill" :class="space.visibility === 'PUBLIC' ? 'status-pill--published' : 'status-pill--archived'"><i />{{ space.visibility === 'PUBLIC' ? 'Público' : 'Privado' }}</span></td>
          <td class="muted-cell">{{ space.categoryCount }}</td>
          <td class="action-cell" @click.stop><div class="row-menu"><button class="row-menu__trigger" type="button" :aria-label="`Opções de ${space.name}`" :aria-expanded="openMenuId === space.id" @click="toggleMenu(space.id)"><Ellipsis class="admin-icon" /></button><div v-if="openMenuId === space.id" class="row-menu__popover"><button type="button" @click="editSpace(space.id)"><Pencil class="admin-icon" /><span><strong>Editar Espaço</strong><small>Alterar dados e visibilidade</small></span></button><button class="row-menu__delete" type="button" @click="requestDelete(space)"><Trash2 class="admin-icon" /><span><strong>Excluir Espaço</strong><small>Remover espaço e conteúdo</small></span></button></div></div></td>
        </tr>
        <tr v-if="!filteredSpaces.length"><td class="empty-state" colspan="5"><strong>Nenhum espaço encontrado</strong><span>Experimente mudar a busca ou criar um novo espaço.</span></td></tr>
      </tbody>
    </table></div>
    <AppConfirmDialog :open="Boolean(deleteRequest)" title="Excluir espaço" :description="deleteDescription" :loading="deleting" :error="deleteError" confirm-label="Excluir espaço" @cancel="closeDeleteDialog" @confirm="confirmDelete" />
  </section>
</template>
<script setup lang="ts">
import { Ellipsis, GripVertical, PanelsTopLeft, Pencil, Plus, Search, Trash2 } from '@lucide/vue'
definePageMeta({ layout: 'admin', middleware: 'admin' })
type Space = { id: number; name: string; slug: string; description: string | null; visibility: 'PUBLIC' | 'PRIVATE'; position: number; categoryCount: number }
const { data: spaces } = await useFetch<Space[]>('/api/spaces')
const query = ref('')
const ordering = ref(false)
const { showToast } = useAppToast()
const draggedSpaceId = ref<number | null>(null)
const spaceOrderBeforeDrag = ref<Space[] | null>(null)
const spaceDropped = ref(false)
const openMenuId = ref<number | null>(null)
const deleteRequest = ref<Space | null>(null)
const deleting = ref(false)
const deleteError = ref('')
const deleteDescription = computed(() => `O espaço “${deleteRequest.value?.name || ''}”, suas categorias e seus artigos serão removidos permanentemente. Esta ação não pode ser desfeita.`)
const filteredSpaces = computed(() => (spaces.value || []).filter(space => {
  const term = query.value.toLocaleLowerCase('pt-BR')
  return space.name.toLocaleLowerCase('pt-BR').includes(term) || space.slug.toLocaleLowerCase('pt-BR').includes(term)
}))
function openSpace(id: number) { navigateTo(`/admin/espacos/${id}`) }
function editSpace(id: number) { openMenuId.value = null; navigateTo(`/admin/espacos/${id}`) }
function toggleMenu(id: number) { openMenuId.value = openMenuId.value === id ? null : id }
function requestDelete(space: Space) { deleteError.value = ''; deleteRequest.value = space; openMenuId.value = null }
function closeDeleteDialog() { if (!deleting.value) deleteRequest.value = null }
async function confirmDelete() {
  if (!deleteRequest.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await $fetch(`/api/spaces/${deleteRequest.value.id}`, { method: 'DELETE' })
    spaces.value = (spaces.value || []).filter(space => space.id !== deleteRequest.value?.id)
    deleteRequest.value = null
  } catch { deleteError.value = 'Não foi possível excluir o espaço. Tente novamente.' }
  finally { deleting.value = false }
}
function startSpaceDrag(id: number, event: DragEvent) {
  if (!spaces.value || ordering.value || query.value) return
  draggedSpaceId.value = id
  spaceOrderBeforeDrag.value = [...spaces.value]
  spaceDropped.value = false
  event.dataTransfer?.setData('text/plain', String(id))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}
function dragSpaceOver(targetId: number) {
  if (!spaces.value || draggedSpaceId.value === null || draggedSpaceId.value === targetId) return
  const reordered = [...spaces.value]
  const from = reordered.findIndex(space => space.id === draggedSpaceId.value)
  const to = reordered.findIndex(space => space.id === targetId)
  if (from < 0 || to < 0) return
  const [dragged] = reordered.splice(from, 1)
  reordered.splice(to, 0, dragged!)
  spaces.value = reordered
}
async function dropSpace() {
  if (!spaces.value || draggedSpaceId.value === null || !spaceOrderBeforeDrag.value) return
  spaceDropped.value = true
  const previousOrder = spaceOrderBeforeDrag.value
  const ids = spaces.value.map(space => space.id)
  draggedSpaceId.value = null
  spaceOrderBeforeDrag.value = null
  if (ids.every((id, index) => id === previousOrder[index]?.id)) return
  await saveSpaceOrder(ids, previousOrder)
}
function cancelSpaceDrag() {
  if (!spaceDropped.value && spaceOrderBeforeDrag.value) spaces.value = spaceOrderBeforeDrag.value
  draggedSpaceId.value = null
  spaceOrderBeforeDrag.value = null
  spaceDropped.value = false
}
async function moveSpace(id: number, direction: -1 | 1) {
  if (!spaces.value) return
  const previousOrder = [...spaces.value]
  const index = spaces.value.findIndex(space => space.id === id)
  const target = index + direction
  if (index < 0 || target < 0 || target >= spaces.value.length) return
  const reordered = [...spaces.value]
  ;[reordered[index], reordered[target]] = [reordered[target]!, reordered[index]!]
  spaces.value = reordered
  await saveSpaceOrder(reordered.map(space => space.id), previousOrder)
}
async function saveSpaceOrder(ids: number[], previousOrder: Space[]) {
  ordering.value = true
  try {
    await $fetch('/api/spaces/reorder', { method: 'POST', body: { ids } })
    showToast('Ordem dos espaços salva.')
  } catch {
    spaces.value = previousOrder
    showToast('Não foi possível salvar a ordem dos espaços.', 'error')
  }
  finally { ordering.value = false }
}
</script>
