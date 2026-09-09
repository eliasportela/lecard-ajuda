<template>
  <section class="card">
    <h1>Entrar</h1>
    <p style="color:var(--muted)">Acesse a administração da base de conhecimento.</p>
    <form @submit.prevent="submit">
      <label class="field">E-mail<input v-model="email" type="email" required autocomplete="email"></label>
      <label class="field">Senha<span class="password-field"><input v-model="password" :type="showPassword ? 'text' : 'password'" required autocomplete="current-password"><button type="button" :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'" :aria-pressed="showPassword" @click="showPassword = !showPassword"><EyeOff v-if="showPassword" /><Eye v-else /></button></span></label>
      <p v-if="message" class="error">{{ message }}</p>
      <button class="btn" :disabled="loading">{{ loading ? 'Entrando...' : 'Entrar' }}</button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue'

definePageMeta({ layout: 'auth' })
const currentUser = useState<CurrentUser | null>('current-user', () => null)
const currentUserInitialized = useState('current-user-initialized', () => false)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const message = ref('')
async function submit() {
  loading.value = true; message.value = ''
  try {
    const result = await $fetch<{ user: CurrentUser }>('/api/auth/login', { method: 'POST', body: { email: email.value, password: password.value } })
    currentUser.value = result.user
    currentUserInitialized.value = true
    await navigateTo('/admin')
  } catch { message.value = 'E-mail ou senha inválidos.' }
  finally { loading.value = false }
}
</script>
