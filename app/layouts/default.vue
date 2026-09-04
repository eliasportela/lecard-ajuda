<template>
  <div class="shell">
    <header class="topbar">
      <NuxtLink class="brand" to="/">Lecard Ajuda</NuxtLink>
      <input class="search" type="search" placeholder="Buscar na documentação..." aria-label="Buscar" @keyup.enter="search">
      <NuxtLink to="/login">Entrar</NuxtLink>
    </header>
    <main><slot /></main>
  </div>
</template>

<script setup lang="ts">
function search(event: KeyboardEvent) {
  const query = (event.target as HTMLInputElement).value.trim()
  if (query) navigateTo({ path: '/busca', query: { q: query } })
}
</script>
