<template>
  <div class="admin-shell">
    <aside class="admin-nav">
      <NuxtLink class="brand" to="/admin">Lecard Ajuda</NuxtLink>
      <p><NuxtLink to="/admin/artigos">Artigos</NuxtLink></p>
      <p><NuxtLink to="/admin/secoes">Seções</NuxtLink></p>
      <p v-if="user?.role === 'ADMIN'"><NuxtLink to="/admin/usuarios">Usuários</NuxtLink></p>
      <p><NuxtLink to="/">Ver base</NuxtLink></p>
    </aside>
    <main class="admin-main"><slot /></main>
  </div>
</template>

<script setup lang="ts">
const { user } = await useCurrentUser()
</script>
