<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const pageTitle = computed(() => route.path === '/login' || route.path.startsWith('/admin')
  ? 'LeCard | Admin'
  : 'LeCard | Central de Ajuda')
const shareImageUrl = computed(() => new URL('/logo-1200x630.png', config.public.siteUrl).toString())

useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  ogType: 'website',
  ogImage: shareImageUrl,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'LeCard | Central de Ajuda',
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterImage: shareImageUrl,
  twitterImageAlt: 'LeCard | Central de Ajuda'
})

useHead({
  link: [
    { rel: 'icon', href: '/favicons/favicon.ico?v=2', sizes: '48x48' },
    { rel: 'icon', href: '/favicons/favicon.svg?v=2', type: 'image/svg+xml' },
    { rel: 'icon', href: '/favicons/favicon-96x96.png?v=2', type: 'image/png', sizes: '96x96' },
    { rel: 'apple-touch-icon', href: '/favicons/apple-touch-icon.png?v=2', sizes: '180x180' },
    { rel: 'manifest', href: '/favicons/site.webmanifest?v=2' }
  ]
})
</script>
