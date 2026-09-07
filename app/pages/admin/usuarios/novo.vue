<template>
  <section class="admin-page">
    <header class="form-page__header"><div><NuxtLink class="back-link" to="/admin/usuarios">‹ Usuários</NuxtLink><h1>Cadastrar usuário</h1><p>Crie um novo acesso para a administração da central de ajuda.</p></div></header>
    <form class="admin-panel form-card" @submit.prevent="create">
      <label class="field">Nome completo<input v-model="form.name" required minlength="2" maxlength="120" autocomplete="name"></label>
      <label class="field">E-mail<input v-model="form.email" type="email" required autocomplete="email"></label>
      <label class="field">Senha inicial<span class="password-field"><input v-model="form.password" :type="showPassword ? 'text' : 'password'" minlength="8" maxlength="200" required autocomplete="new-password"><button type="button" :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'" :aria-pressed="showPassword" @click="showPassword = !showPassword"><EyeOff v-if="showPassword" /><Eye v-else /></button></span><small class="field-hint">Use pelo menos 8 caracteres.</small></label>
      <label class="field">Perfil<select v-model="form.role"><option value="EDITOR">Editor</option><option value="ADMIN">Administrador</option></select></label>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <div class="form-actions"><NuxtLink class="btn btn--secondary" to="/admin/usuarios">Cancelar</NuxtLink><button class="btn" :disabled="saving"><UserPlus class="admin-icon" />{{ saving ? 'Cadastrando...' : 'Cadastrar Usuário' }}</button></div>
    </form>
  </section>
</template>
<script setup lang="ts">
import { Eye, EyeOff, UserPlus } from '@lucide/vue'
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { user } = await useCurrentUser()
if (user.value?.role !== 'ADMIN') throw createError({ statusCode: 403 })
const form = reactive({ name: '', email: '', password: '', role: 'EDITOR' as 'ADMIN' | 'EDITOR' })
const saving = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)
const { showToast } = useAppToast()
async function create() {
  saving.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/users', { method: 'POST', body: form })
    showToast('Usuário cadastrado com sucesso.')
    await navigateTo('/admin/usuarios')
  } catch {
    errorMessage.value = 'Não foi possível cadastrar o usuário. Verifique os dados e tente novamente.'
  } finally { saving.value = false }
}
</script>
