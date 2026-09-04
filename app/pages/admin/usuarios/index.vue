<template>
  <section><h1>Usuários</h1><div class="admin-panel">
    <form @submit.prevent="create"><h2>Novo usuário</h2><label class="field">Nome<input v-model="form.name" required></label><label class="field">E-mail<input v-model="form.email" type="email" required></label><label class="field">Senha inicial<input v-model="form.password" type="password" minlength="12" required></label><label class="field">Perfil<select v-model="form.role"><option value="EDITOR">Editor</option><option value="ADMIN">Administrador</option></select></label><button class="btn">Cadastrar</button></form>
  </div><div class="admin-panel" style="margin-top:24px"><h2>Cadastrados</h2><p v-for="item in users" :key="item.id"><strong>{{ item.name }}</strong> — {{ item.email }} — {{ item.role }}</p></div></section>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { user } = await useCurrentUser(); if (user.value?.role !== 'ADMIN') throw createError({ statusCode: 403 })
const { data: users, refresh } = await useFetch('/api/users')
const form = reactive({ name: '', email: '', password: '', role: 'EDITOR' as 'ADMIN' | 'EDITOR' })
async function create() { await $fetch('/api/users', { method: 'POST', body: form }); Object.assign(form, { name: '', email: '', password: '', role: 'EDITOR' }); await refresh() }
</script>
