import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'mysql',
  schema: './server/database/schema.ts',
  out: './database/migrations',
  dbCredentials: { url: process.env.DATABASE_URL ?? 'mysql://root:root@127.0.0.1:3306/lecard_ajuda' }
})
