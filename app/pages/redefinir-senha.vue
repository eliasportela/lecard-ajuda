<template>
  <section class="card">
    <h1>Redefinir senha</h1>
    <template v-if="done">
      <p>Sua senha foi alterada. Todas as sessões anteriores foram encerradas.</p>
      <NuxtLink class="btn" to="/login">Entrar</NuxtLink>
    </template>
    <form v-else @submit.prevent="submit">
      <label class="field">Nova senha<span class="password-field"><input v-model="password" :type="showPassword ? 'text' : 'password'" minlength="8" required autocomplete="new-password"><button type="button" :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'" :aria-pressed="showPassword" @click="showPassword = !showPassword"><EyeOff v-if="showPassword" /><Eye v-else /></button></span></label>
      <label class="field">Confirmar nova senha<input v-model="confirmation" type="password" minlength="8" required autocomplete="new-password"></label>
      <p v-if="message" class="error">{{ message }}</p>
      <button class="btn" :disabled="loading || !token">{{ loading ? 'Alterando...' : 'Alterar senha' }}</button>
      <p v-if="!token" class="error">O link de recuperação é inválido.</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue'

definePageMeta({ layout: 'auth' })
const route = useRoute()
const token = computed(() => typeof route.query.token === 'string' ? route.query.token : '')
const password = ref('')
const confirmation = ref('')
const showPassword = ref(false)
const loading = ref(false)
const done = ref(false)
const message = ref('')

async function submit() {
  message.value = ''
  if (password.value !== confirmation.value) {
    message.value = 'As senhas não coincidem.'
    return
  }
  loading.value = true
  try {
    await $fetch('/api/auth/reset-password', { method: 'POST', body: { token: token.value, password: password.value } })
    done.value = true
  } catch (error: any) {
    message.value = error?.statusCode === 422
      ? 'A nova senha deve ser diferente da senha atual.'
      : 'O link é inválido ou expirou. Solicite uma nova recuperação.'
  } finally {
    loading.value = false
  }
}
</script>
