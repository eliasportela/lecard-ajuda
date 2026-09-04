export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    databaseUrl: '',
    sessionSecret: '',
    spacesEndpoint: '',
    spacesRegion: 'us-east-1',
    spacesBucket: '',
    spacesKey: '',
    spacesSecret: '',
    public: {
      siteUrl: 'http://localhost:3000',
      spacesCdnUrl: ''
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
