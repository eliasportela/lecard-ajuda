<template>
  <section class="admin-page">
    <header class="form-page__header"><div><NuxtLink class="back-link" to="/admin/espacos">‹ Espaços</NuxtLink><h1>Novo espaço</h1><p>Crie uma área principal para agrupar categorias e artigos da central.</p></div></header>
    <form class="admin-panel form-card" @submit.prevent="save">
      <label class="field">Nome do espaço<input v-model="form.name" required minlength="2" maxlength="120" @input="syncSlug"></label>
      <label class="field">Slug<input v-model="form.slug" required pattern="[a-z0-9-]+" maxlength="140"></label>
      <label class="field">Descrição<textarea v-model="form.description" maxlength="2000" rows="4" placeholder="Explique brevemente o conteúdo deste espaço"></textarea></label>
      <label class="field">Visibilidade<select v-model="form.visibility"><option value="PUBLIC">Público</option><option value="PRIVATE">Privado</option></select><small class="field-hint">Espaços privados não aparecem na central pública.</small></label>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <div class="form-actions"><NuxtLink class="btn btn--secondary" to="/admin/espacos">Cancelar</NuxtLink><button class="btn" :disabled="saving"><Plus class="admin-icon" />{{ saving ? 'Criando...' : 'Criar Espaço' }}</button></div>
    </form>
  </section>
</template>
<script setup lang="ts">
import { Plus } from '@lucide/vue'
definePageMeta({ layout: 'admin', middleware: 'admin' })
const form = reactive({ name: '', slug: '', description: '', visibility: 'PUBLIC' as 'PUBLIC' | 'PRIVATE' })
const saving = ref(false)
const errorMessage = ref('')
const { showToast } = useAppToast()
function slugify(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
function syncSlug() { form.slug = slugify(form.name) }
async function save() {
  saving.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/spaces', { method: 'POST', body: form })
    showToast('Espaço criado com sucesso.')
    await navigateTo('/admin/espacos')
  } catch {
    errorMessage.value = 'Não foi possível criar o espaço. Verifique se o slug já está em uso.'
  } finally { saving.value = false }
}
</script>
