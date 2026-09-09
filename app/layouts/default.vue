<template>
  <div class="shell">
    <header class="topbar">
      <button class="mobile-menu" type="button" aria-label="Abrir menu" @click="openMenu"><Menu class="public-icon" /></button>
      <NuxtLink class="brand" to="/">
        <img src="~/assets/img/logo-lecard-horizontal.png" alt="LeCard">
        <span class="brand__slash">/</span><span>Central de Ajuda</span>
      </NuxtLink>
      <label class="global-search">
        <Search class="public-icon" />
        <input ref="searchInput" type="search" placeholder="Pergunte ou busque uma resposta..." aria-label="Buscar na base de conhecimento" @keyup.enter="search">
        <kbd>⌘ K</kbd>
      </label>
      <div class="topbar-actions">
        <nav class="topbar-links" aria-label="Links da LeCard">
          <a href="https://portal.lecard.app" target="_blank" rel="noopener noreferrer">Portal</a>
          <a href="https://api.whatsapp.com/send/?phone=5516994533763&amp;text=Iniciar+atendimento&amp;type=phone_number&amp;app_absent=0" target="_blank" rel="noopener noreferrer">Suporte</a>
        </nav>
        <div class="social-links" aria-label="Redes sociais da LeCard">
          <a href="https://www.instagram.com/lecard.app" target="_blank" rel="noopener noreferrer" aria-label="Instagram da LeCard" title="Instagram">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" class="social-icon-dot" /></svg>
          </a>
          <a href="https://www.youtube.com/@sistemalecard" target="_blank" rel="noopener noreferrer" aria-label="YouTube da LeCard" title="YouTube">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.4 6.5a2.8 2.8 0 0 0-2-2C17.7 4 12 4 12 4s-5.7 0-7.4.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .6 5.5 2.8 2.8 0 0 0 2 2C6.3 20 12 20 12 20s5.7 0 7.4-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.6-5.5Z" /><path d="m10 9 5 3-5 3Z" class="social-icon-play" /></svg>
          </a>
        </div>
      </div>
    </header>
    <main :class="{ 'public-home-background': hasPublicGradient }"><slot /></main>
  </div>
</template>

<script setup lang="ts">
import { Menu, Search } from '@lucide/vue'
const route = useRoute()
const searchInput = ref<HTMLInputElement>()
const hasPublicGradient = computed(() => route.path === '/' || Boolean(route.params.space))

function search(event: KeyboardEvent) {
  const query = (event.target as HTMLInputElement).value.trim()
  if (query) navigateTo({ path: '/busca', query: { q: query } })
}

function openMenu() {
  window.dispatchEvent(new CustomEvent('public-menu-open'))
}

function shortcut(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    searchInput.value?.focus()
  }
}

onMounted(() => window.addEventListener('keydown', shortcut))
onBeforeUnmount(() => window.removeEventListener('keydown', shortcut))
</script>
