import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'

export default defineEventHandler(async event => {
  const currentUser = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Invalid user id' })
  if (currentUser.role !== 'ADMIN' && id !== currentUser.id) throw createError({ statusCode: 403, statusMessage: 'Insufficient permission' })

  const [user] = await useDb().select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active }).from(users).where(eq(users.id, id)).limit(1)
  if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })
  return user
})
