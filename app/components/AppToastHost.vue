<template>
  <Teleport to="body">
    <Transition name="app-toast">
      <div v-if="toast" class="app-toast" :class="`app-toast--${toast.type}`" role="status" aria-live="polite">
        <CircleCheck v-if="toast.type === 'success'" aria-hidden="true" />
        <CircleAlert v-else aria-hidden="true" />
        <span>{{ toast.message }}</span>
        <button type="button" aria-label="Fechar notificação" @click="closeToast"><X /></button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { CircleAlert, CircleCheck, X } from '@lucide/vue'

const { toast, closeToast } = useAppToast()
let timer: ReturnType<typeof setTimeout> | undefined

watch(() => toast.value?.id, id => {
  if (timer) clearTimeout(timer)
  if (id) timer = setTimeout(closeToast, 4500)
}, { immediate: true })
onBeforeUnmount(() => { if (timer) clearTimeout(timer) })
</script>
