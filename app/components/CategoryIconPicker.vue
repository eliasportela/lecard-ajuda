<template>
  <div class="field icon-select-field">
    <span>Ícone</span>
    <button class="icon-select-trigger" type="button" @click="openPicker">
      <span class="icon-select-trigger__preview"><CategoryIcon :name="model" /></span>
      <span><strong>{{ selectedLabel }}</strong><small :class="{ 'icon-selection-feedback': selectionChanged }">{{ selectionChanged ? 'Ícone selecionado — salve para confirmar' : 'Clique para escolher outro ícone' }}</small></span>
      <ChevronRight />
    </button>
  </div>
  <Teleport to="body">
    <Transition name="confirm-dialog">
      <div v-if="open" class="icon-modal" role="presentation" @click.self="closePicker">
        <section class="icon-modal__panel" role="dialog" aria-modal="true" aria-labelledby="icon-modal-title">
          <header><div><h2 id="icon-modal-title">Escolher ícone</h2><p>Selecione o ícone que representa esta categoria.</p></div><button type="button" aria-label="Fechar" @click="closePicker"><X /></button></header>
          <label class="icon-modal__search"><Search /><input ref="searchInput" v-model="query" type="search" placeholder="Pesquisar ícone" aria-label="Pesquisar ícone"></label>
          <div class="icon-modal__content">
            <div class="icon-modal__grid">
              <button v-for="option in filteredOptions" :key="option.name" type="button" :class="{ 'is-selected': model === option.name }" @click="selectIcon(option.name)"><CategoryIcon :name="option.name" /><span>{{ option.label }}</span><CircleCheck v-if="model === option.name" /></button>
            </div>
            <div v-if="!filteredOptions.length" class="icon-modal__empty">Nenhum ícone encontrado.</div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup lang="ts">
import { ChevronRight, CircleCheck, Search, X } from '@lucide/vue'
import { categoryIconOptions, type CategoryIconName } from '~~/shared/category-icons'
const model = defineModel<CategoryIconName>({ required: true })
const initialValue = model.value
const open = ref(false)
const query = ref('')
const searchInput = ref<HTMLInputElement>()
const selectedLabel = computed(() => categoryIconOptions.find(option => option.name === model.value)?.label || 'Pasta')
const selectionChanged = computed(() => model.value !== initialValue)
const filteredOptions = computed(() => {
  const term = query.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim()
  if (!term) return categoryIconOptions
  return categoryIconOptions.filter(option => `${option.label} ${option.name} ${option.keywords || ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').includes(term))
})
async function openPicker() { query.value = ''; open.value = true; await nextTick(); searchInput.value?.focus() }
function closePicker() { open.value = false }
async function selectIcon(name: CategoryIconName) { model.value = name; await nextTick(); closePicker() }
function onKeydown(event: KeyboardEvent) { if (event.key === 'Escape' && open.value) closePicker() }
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>
