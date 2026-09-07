<template>
  <section class="admin-page">
    <header class="form-page__header"><div><NuxtLink class="back-link" to="/admin/espacos">‹ Espaços</NuxtLink><h1>Editar espaço</h1><p>Atualize os dados e a visibilidade deste espaço.</p></div></header>
    <form v-if="space" class="admin-panel form-card" @submit.prevent="save">
      <label class="field">Nome do espaço<input v-model="space.name" required minlength="2" maxlength="120"></label>
      <label class="field">Slug<input v-model="space.slug" required pattern="[a-z0-9-]+" maxlength="140"></label>
      <label class="field">Descrição<textarea v-model="space.description" maxlength="2000" rows="4" placeholder="Explique brevemente o conteúdo deste espaço"></textarea></label>
      <label class="field">Visibilidade<select v-model="space.visibility"><option value="PUBLIC">Público</option><option value="PRIVATE">Privado</option></select><small class="field-hint">Espaços privados não aparecem na central pública.</small></label>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <div class="form-actions"><NuxtLink class="btn btn--secondary" to="/admin/espacos">Cancelar</NuxtLink><button class="btn" :disabled="saving">{{ saving ? 'Salvando...' : 'Salvar Alterações' }}</button></div>
    </form>
  </section>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
type Space = { id: number; name: string; slug: string; description: string | null; visibility: 'PUBLIC' | 'PRIVATE' }
const route = useRoute()
const { data: space } = await useFetch<Space>(`/api/spaces/${route.params.id}`)
const saving = ref(false)
const errorMessage = ref('')
const { showToast } = useAppToast()
async function save() {
  if (!space.value) return
  saving.value = true
  errorMessage.value = ''
  try {
    await $fetch(`/api/spaces/${route.params.id}`, { method: 'PUT', body: { name: space.value.name, slug: space.value.slug, description: space.value.description, visibility: space.value.visibility } })
    showToast('Espaço atualizado com sucesso.')
    await navigateTo('/admin/espacos')
  } catch {
    errorMessage.value = 'Não foi possível salvar o espaço. Verifique se o slug já está em uso.'
  } finally { saving.value = false }
}
</script>
