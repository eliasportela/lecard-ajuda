<template>
  <section class="card">
    <h1>Recuperar senha</h1>
    <p style="color:var(--muted)">Informe o e-mail usado para acessar a administração.</p>
    <form v-if="!sent" @submit.prevent="submit">
      <label class="field">E-mail<input v-model="email" type="email" required autocomplete="email"></label>
      <p v-if="message" class="error">{{ message }}</p>
      <button class="btn" :disabled="loading">{{ loading ? 'Enviando...' : 'Enviar instruções' }}</button>
    </form>
    <template v-else>
      <p>Se existir uma conta ativa com esse e-mail, enviaremos as instruções para redefinir a senha.</p>
      <NuxtLink to="/login">Voltar para o login</NuxtLink>
    </template>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const email = ref('')
const loading = ref(false)
const sent = ref(false)
const message = ref('')

async function submit() {
  loading.value = true
  message.value = ''
  try {
    await $fetch('/api/auth/forgot-password', { method: 'POST', body: { email: email.value } })
    sent.value = true
  } catch {
    message.value = 'Não foi possível processar a solicitação. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>
