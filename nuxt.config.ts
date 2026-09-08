export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: true },
  css: [
    '@fontsource-variable/inter/wght.css',
    '@fontsource-variable/manrope/wght.css',
    '~/assets/css/main.css'
  ],
  runtimeConfig: {
    databaseUrl: '',
    spacesEndpoint: 'https://nyc3.digitaloceanspaces.com',
    spacesRegion: 'nyc3',
    spacesBucket: 'lecard-cdn',
    spacesPrefix: 'lecard-ajuda',
    spacesKey: '',
    spacesSecret: '',
    public: {
      siteUrl: 'https://ajuda.lecard.app',
      spacesCdnUrl: 'https://lecard-cdn.nyc3.cdn.digitaloceanspaces.com'
    }
  },
  routeRules: {
    '/admin/**': { ssr: true, cache: false },
    '/login': { ssr: true, cache: false },
    '/api/**': { cors: false, cache: false }
  },
  nitro: {
    preset: 'node-server'
  },
  typescript: {
    strict: true,
    typeCheck: true
  }
})
