import { execFileSync } from 'node:child_process'

function getCommitHash() {
  const environmentCommit = process.env.COMMIT_SHA || process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA
  if (environmentCommit) return environmentCommit.slice(0, 7)

  try {
    return execFileSync('git', ['rev-parse', '--short=7', 'HEAD'], { encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
}

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
    brevoApiKey: '',
    public: {
      appVersion: process.env.npm_package_version || '1.0.0',
      appCommit: getCommitHash(),
      siteUrl: 'https://ajuda.lecard.app',
      spacesCdnUrl: 'https://lecard-cdn.nyc3.cdn.digitaloceanspaces.com'
    }
  },
  routeRules: {
    '/admin/**': { ssr: true, cache: false },
    '/login': { ssr: true, cache: false },
    '/esqueci-senha': { ssr: true, cache: false },
    '/redefinir-senha': { ssr: true, cache: false },
    '/api/auth/**': {
      cors: false,
      cache: false,
      headers: {
        'cache-control': 'no-store, max-age=0',
        pragma: 'no-cache',
        expires: '0'
      }
    },
    '/api/public/navigation': {
      cache: { maxAge: 300, swr: true, staleMaxAge: 3600, group: 'lecard/public', name: 'navigation' }
    },
    '/api/public/articles/**': {
      cache: { maxAge: 300, swr: true, staleMaxAge: 3600, group: 'lecard/public', name: 'articles' }
    },
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
