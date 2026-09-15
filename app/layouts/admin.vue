<template>
  <div class="admin-shell" :class="{ 'admin-shell--expanded': menuExpanded }">
    <aside class="admin-rail">
      <NuxtLink class="admin-rail__brand" to="/admin/artigos" aria-label="LeCard Ajuda"><img :src="menuExpanded ? logoHorizontal : logoSquare" alt="LeCard"></NuxtLink>
      <nav class="admin-rail__nav" aria-label="Navegação principal">
        <NuxtLink class="admin-rail__link" to="/admin/artigos" data-label="Base de Conhecimento"><BookOpen class="admin-icon" /><span>Base de Conhecimento</span></NuxtLink>
        <NuxtLink v-if="user?.role === 'ADMIN'" class="admin-rail__link" to="/admin/usuarios" data-label="Usuários"><Users class="admin-icon" /><span>Usuários</span></NuxtLink>
        <NuxtLink v-else-if="user" class="admin-rail__link" :to="`/admin/usuarios/${user.id}`" data-label="Meu Perfil"><UserRound class="admin-icon" /><span>Meu Perfil</span></NuxtLink>
      </nav>
      <div class="admin-rail__footer">
        <button class="admin-rail__link" type="button" :data-label="menuExpanded ? 'Recolher Menu' : 'Expandir Menu'" @click="menuExpanded = !menuExpanded"><PanelLeftClose v-if="menuExpanded" class="admin-icon" /><PanelLeftOpen v-else class="admin-icon" /><span>{{ menuExpanded ? 'Recolher Menu' : 'Expandir Menu' }}</span></button>
        <div class="admin-rail__divider" aria-hidden="true"></div>
        <button class="admin-rail__link" type="button" data-label="Sair" @click="logout"><LogOut class="admin-icon" /><span>Sair</span></button>
        <p class="admin-rail__version" :title="versionLabel">{{ versionLabel }}</p>
      </div>
    </aside>
    <main class="admin-main"><slot /></main>
    <AppToastHost />
  </div>
</template>
<script setup lang="ts">
import { BookOpen, LogOut, PanelLeftClose, PanelLeftOpen, UserRound, Users } from '@lucide/vue'
import logoSquare from '~/assets/img/logo-lecard.png'
import logoHorizontal from '~/assets/img/logo-lecard-horizontal.png'
const { user } = await useCurrentUser()
const config = useRuntimeConfig()
const menuExpanded = ref(false)
const versionLabel = computed(() => `v${config.public.appVersion}${config.public.appCommit ? ` · ${config.public.appCommit}` : ''}`)
async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  user.value = null
  useState('current-user-initialized').value = true
  await navigateTo('/login')
}
</script>
