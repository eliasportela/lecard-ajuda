<template>
  <section class="card">
    <h1>Entrar</h1>
    <p style="color:var(--muted)">Acesse a administração da base de conhecimento.</p>
    <form @submit.prevent="submit">
      <label class="field">E-mail<input v-model="email" type="email" required autocomplete="email"></label>
      <label class="field">Senha<input v-model="password" type="password" required autocomplete="current-password"></label>
      <p v-if="message" class="error">{{ message }}</p>
      <button class="btn" :disabled="loading">{{ loading ? 'Entrando...' : 'Entrar' }}</button>
    </form>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const currentUser = useState<CurrentUser | null>('current-user', () => null)
const currentUserInitialized = useState('current-user-initialized', () => false)
const email = ref('')
const password = ref('')
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
