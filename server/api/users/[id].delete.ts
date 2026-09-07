import { eq } from 'drizzle-orm'
import { sessions, users } from '../../database/schema'

export default defineEventHandler(async event => {
  const currentUser = await requireUser(event, 'ADMIN')
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Invalid user id' })
  if (id === currentUser.id) throw createError({ statusCode: 409, statusMessage: 'You cannot delete your own user' })

  const [targetUser] = await useDb().select({ id: users.id, active: users.active }).from(users).where(eq(users.id, id)).limit(1)
  if (!targetUser) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  await useDb().transaction(async tx => {
    await tx.update(users).set({ active: false }).where(eq(users.id, id))
    await tx.delete(sessions).where(eq(sessions.userId, id))
  })

  return { ok: true }
})
