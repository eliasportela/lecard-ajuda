import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '../../database/schema'

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.email(),
  role: z.enum(['ADMIN', 'EDITOR']),
  active: z.boolean(),
  password: z.string().min(8).max(200).optional()
})

export default defineEventHandler(async event => {
  const currentUser = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Invalid user id' })
  const input = schema.parse(await readBody(event))
  if (currentUser.role !== 'ADMIN' && id !== currentUser.id) throw createError({ statusCode: 403, statusMessage: 'Insufficient permission' })
  if (currentUser.role !== 'ADMIN' && (input.role !== currentUser.role || !input.active)) throw createError({ statusCode: 403, statusMessage: 'You cannot change role or status' })
  if (id === currentUser.id && !input.active) throw createError({ statusCode: 409, statusMessage: 'You cannot deactivate your own user' })
  if (id === currentUser.id && input.role !== currentUser.role) throw createError({ statusCode: 409, statusMessage: 'You cannot change your own role' })

  const [targetUser] = await useDb().select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1)
  if (!targetUser) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  const passwordHash = input.password ? await hash(input.password, 12) : undefined
  await useDb().update(users).set({ name: input.name, email: input.email.toLowerCase(), role: input.role, active: input.active, ...(passwordHash ? { passwordHash } : {}) }).where(eq(users.id, id))
  return { ok: true }
})
