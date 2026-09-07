<template>
  <section class="admin-page admin-page--flush">
    <header class="admin-page__header">
      <div><p class="admin-page__kicker">Acesso</p><h1>Usuários</h1></div>
      <div class="admin-page__actions"><NuxtLink class="btn" to="/admin/usuarios/novo"><UserPlus class="admin-icon" /> Cadastrar Usuário</NuxtLink></div>
    </header>
    <div class="admin-toolbar">
      <label class="admin-search"><Search class="admin-icon" /><input v-model="query" type="search" placeholder="Buscar por nome ou e-mail"></label>
      <label class="admin-filter"><ListFilter class="admin-icon" /><select v-model="role"><option value="ALL">Todos os perfis</option><option value="ADMIN">Administradores</option><option value="EDITOR">Editores</option></select></label>
      <span class="admin-toolbar__count">{{ filteredUsers.length }} {{ filteredUsers.length === 1 ? 'usuário' : 'usuários' }}</span>
    </div>
    <div class="admin-table-wrap">
      <table class="admin-table admin-table--users">
        <thead><tr><th>Usuário</th><th>Perfil</th><th>Status</th><th>Cadastrado em</th><th class="action-cell"></th></tr></thead>
        <tbody>
          <tr v-for="item in filteredUsers" :key="item.id" class="clickable-row" tabindex="0" @click="openUser(item.id)" @keydown.enter="openUser(item.id)">
            <td><div class="user-cell"><span class="avatar">{{ initials(item.name) }}</span><span><strong>{{ item.name }}</strong><small>{{ item.email }}</small></span></div></td>
            <td><span class="role-pill"><ShieldCheck v-if="item.role === 'ADMIN'" class="admin-icon" /><UserRound v-else class="admin-icon" />{{ item.role === 'ADMIN' ? 'Administrador' : 'Editor' }}</span></td>
            <td><span class="status-pill" :class="item.active ? 'status-pill--published' : 'status-pill--archived'"><i />{{ item.active ? 'Ativo' : 'Inativo' }}</span></td>
            <td class="muted-cell">{{ formatDate(item.createdAt) }}</td>
            <td class="action-cell" @click.stop>
              <div class="user-actions"><NuxtLink class="row-menu__trigger" :to="`/admin/usuarios/${item.id}`" :aria-label="`Editar usuário ${item.name}`"><PenLine class="admin-icon" /></NuxtLink><button v-if="item.active && item.id !== user?.id" class="row-menu__trigger user-delete" type="button" :aria-label="`Excluir usuário ${item.name}`" @click="requestDelete(item)"><Trash2 class="admin-icon" /></button></div>
            </td>
          </tr>
          <tr v-if="!filteredUsers.length"><td class="empty-state" colspan="5"><strong>Nenhum usuário encontrado</strong><span>Experimente mudar a busca ou cadastrar um novo usuário.</span></td></tr>
        </tbody>
      </table>
    </div>
    <AppConfirmDialog
      :open="Boolean(userToDelete)"
      title="Excluir usuário?"
      :description="userToDelete ? `O acesso de ${userToDelete.name} será removido e todas as sessões serão encerradas. Os artigos publicados por esse usuário continuarão vinculados a ele.` : ''"
      confirm-label="Excluir usuário"
      :loading="deleting"
      :error="deleteError"
      @cancel="closeDeleteDialog"
      @confirm="deleteUser"
    />
  </section>
</template>
<script setup lang="ts">
import { ListFilter, PenLine, Search, ShieldCheck, Trash2, UserPlus, UserRound } from '@lucide/vue'
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { user } = await useCurrentUser()
if (user.value?.role !== 'ADMIN') throw createError({ statusCode: 403 })
type User = { id: number; name: string; email: string; role: 'ADMIN' | 'EDITOR'; active: boolean; createdAt: string }
const { data: users, refresh } = await useFetch<User[]>('/api/users')
const query = ref('')
const role = ref('ALL')
const userToDelete = ref<User | null>(null)
const deleting = ref(false)
const deleteError = ref('')
const filteredUsers = computed(() => (users.value || []).filter(item => { const term = query.value.toLocaleLowerCase('pt-BR'); return (item.name.toLocaleLowerCase('pt-BR').includes(term) || item.email.toLocaleLowerCase('pt-BR').includes(term)) && (role.value === 'ALL' || item.role === role.value) }))
function initials(name: string) { return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() }
function formatDate(value: string) { return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) }
function openUser(id: number) { navigateTo(`/admin/usuarios/${id}`) }
function requestDelete(item: User) { deleteError.value = ''; userToDelete.value = item }
function closeDeleteDialog() { if (!deleting.value) userToDelete.value = null }
async function deleteUser() {
  if (!userToDelete.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await $fetch(`/api/users/${userToDelete.value.id}`, { method: 'DELETE' })
    await refresh()
    userToDelete.value = null
  } catch {
    deleteError.value = 'Não foi possível excluir o usuário. Tente novamente.'
  } finally { deleting.value = false }
}
</script>
