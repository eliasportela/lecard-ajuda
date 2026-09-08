import { sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  await useDb().execute(sql`SELECT 1`)

  return { status: 'ok', database: 'connected', timestamp: new Date().toISOString() }
})
