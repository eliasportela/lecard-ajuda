import { createHash, randomBytes } from 'node:crypto'
import { and, eq, gt } from 'drizzle-orm'
import { sessions, users } from '../database/schema'

const COOKIE = 'lecard_session'
const sessionTtl = 60 * 60 * 24 * 14
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

export async function createUserSession(event: Parameters<typeof setCookie>[0], userId: number) {
  const token = randomBytes(32).toString('base64url')
  await useDb().insert(sessions).values({ id: hashToken(token), userId, expiresAt: new Date(Date.now() + sessionTtl * 1000) })
  setCookie(event, COOKIE, token, { httpOnly: true, secure: !import.meta.dev, sameSite: 'lax', path: '/', maxAge: sessionTtl })
}

export async function getCurrentUser(event: Parameters<typeof getCookie>[0]) {
  const token = getCookie(event, COOKIE)
  if (!token) return null
  const rows = await useDb().select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(sessions).innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, new Date()), eq(users.active, true))).limit(1)
  return rows[0] ?? null
}

export async function requireUser(event: Parameters<typeof getCookie>[0], role?: 'ADMIN') {
  const user = await getCurrentUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  if (role && user.role !== role) throw createError({ statusCode: 403, statusMessage: 'Insufficient permission' })
  return user
}

export async function destroyUserSession(event: Parameters<typeof getCookie>[0]) {
  const token = getCookie(event, COOKIE)
  if (token) await useDb().delete(sessions).where(eq(sessions.id, hashToken(token)))
  deleteCookie(event, COOKIE, { path: '/' })
}
