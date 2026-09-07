<template>
  <Teleport to="body">
    <Transition name="confirm-dialog">
      <div v-if="open" class="confirm-dialog" role="presentation" @click.self="cancel">
        <section class="confirm-dialog__panel" :class="`confirm-dialog__panel--${variant}`" role="alertdialog" aria-modal="true" :aria-labelledby="titleId" :aria-describedby="descriptionId">
          <div class="confirm-dialog__icon" aria-hidden="true"><TriangleAlert v-if="variant === 'warning'" /><Trash2 v-else /></div>
          <h2 :id="titleId">{{ title }}</h2>
          <p :id="descriptionId">{{ description }}</p>
          <p v-if="error" class="confirm-dialog__error">{{ error }}</p>
          <div class="confirm-dialog__actions">
            <button type="button" class="btn btn--secondary" :disabled="loading" @click="cancel">Cancelar</button>
            <button ref="confirmButton" type="button" class="btn confirm-dialog__confirm" :disabled="loading" @click="$emit('confirm')">{{ loading ? 'Excluindo...' : confirmLabel }}</button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Trash2, TriangleAlert } from '@lucide/vue'

const props = withDefaults(defineProps<{ open: boolean; title: string; description: string; confirmLabel?: string; loading?: boolean; error?: string; variant?: 'danger' | 'warning' }>(), {
  confirmLabel: 'Excluir',
  loading: false,
  error: '',
  variant: 'danger'
})
const emit = defineEmits<{ cancel: []; confirm: [] }>()
const confirmButton = ref<HTMLButtonElement>()
const titleId = useId()
const descriptionId = useId()

function cancel() { if (!props.loading) emit('cancel') }
function onKeydown(event: KeyboardEvent) { if (event.key === 'Escape') cancel() }

watch(() => props.open, async open => {
  if (!open) return
  await nextTick()
  confirmButton.value?.focus()
})
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>
