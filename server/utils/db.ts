import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from '../database/schema'

let pool: mysql.Pool | undefined

export function useDb() {
  const config = useRuntimeConfig()
  if (!config.databaseUrl) throw new Error('NUXT_DATABASE_URL is not configured')
  pool ??= mysql.createPool({ uri: config.databaseUrl, connectionLimit: 10, enableKeepAlive: true })
  return drizzle(pool, { schema, mode: 'default' })
}
