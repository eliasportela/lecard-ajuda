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
const email = ref('')
const password = ref('')
const loading = ref(false)
const message = ref('')
async function submit() {
  loading.value = true; message.value = ''
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: { email: email.value, password: password.value } })
    clearNuxtState('current-user')
    await navigateTo('/admin')
  } catch { message.value = 'E-mail ou senha inválidos.' }
  finally { loading.value = false }
}
</script>
