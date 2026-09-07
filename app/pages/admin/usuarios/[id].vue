<template>
  <section class="admin-page">
    <header class="form-page__header"><div><NuxtLink v-if="isAdmin" class="back-link" to="/admin/usuarios">‹ Usuários</NuxtLink><h1>{{ isAdmin ? 'Editar usuário' : 'Meu perfil' }}</h1><p>{{ isAdmin ? 'Atualize os dados e as permissões de acesso do usuário.' : 'Atualize seus dados pessoais e sua senha de acesso.' }}</p></div></header>
    <form v-if="form" class="admin-panel form-card" @submit.prevent="save">
      <label class="field">Nome completo<input v-model="form.name" required minlength="2" maxlength="120" autocomplete="name"></label>
      <label class="field">E-mail<input v-model="form.email" type="email" required autocomplete="email"></label>
      <label class="field">Nova senha <small class="field-hint">(opcional)</small><span class="password-field"><input v-model="form.password" :type="showPassword ? 'text' : 'password'" minlength="8" maxlength="200" autocomplete="new-password" placeholder="Deixe em branco para manter a senha"><button type="button" :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'" :aria-pressed="showPassword" @click="showPassword = !showPassword"><EyeOff v-if="showPassword" /><Eye v-else /></button></span><small class="field-hint">Ao alterar, use pelo menos 8 caracteres.</small></label>
      <label v-if="isAdmin" class="field">Perfil<select v-model="form.role" :disabled="form.id === currentUser?.id"><option value="EDITOR">Editor</option><option value="ADMIN">Administrador</option></select><small v-if="form.id === currentUser?.id" class="field-hint">Você não pode alterar seu próprio perfil.</small></label>
      <label v-if="isAdmin" class="field">Status<select v-model="form.active" :disabled="form.id === currentUser?.id"><option :value="true">Ativo</option><option :value="false">Inativo</option></select><small v-if="form.id === currentUser?.id" class="field-hint">Você não pode desativar sua própria conta.</small></label>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <div class="form-actions"><NuxtLink class="btn btn--secondary" :to="isAdmin ? '/admin/usuarios' : '/admin/artigos'">Cancelar</NuxtLink><button class="btn" :disabled="saving">{{ saving ? 'Salvando...' : 'Salvar alterações' }}</button></div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
const route = useRoute()
const { user: currentUser } = await useCurrentUser()
const isAdmin = computed(() => currentUser.value?.role === 'ADMIN')
type EditableUser = { id: number; name: string; email: string; role: 'ADMIN' | 'EDITOR'; active: boolean }
const { data: loadedUser } = await useFetch<EditableUser>(`/api/users/${route.params.id}`)
if (!loadedUser.value) throw createError({ statusCode: 404 })
const form = reactive({ ...loadedUser.value, password: '' })
const saving = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')
const { showToast } = useAppToast()

async function save() {
  saving.value = true
  errorMessage.value = ''
  try {
    await $fetch(`/api/users/${form.id}`, { method: 'PUT', body: { name: form.name, email: form.email, role: form.role, active: form.active, ...(form.password ? { password: form.password } : {}) } })
    if (form.id === currentUser.value?.id) currentUser.value = { ...currentUser.value, name: form.name, email: form.email }
    showToast('Usuário atualizado com sucesso.')
    await navigateTo(isAdmin.value ? '/admin/usuarios' : '/admin/artigos')
  } catch {
    errorMessage.value = 'Não foi possível atualizar o usuário. Verifique os dados e tente novamente.'
  } finally { saving.value = false }
}
</script>
