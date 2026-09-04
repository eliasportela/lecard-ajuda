import { compare } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '../../database/schema'

const schema = z.object({ email: z.email(), password: z.string().min(8).max(200) })

export default defineEventHandler(async (event) => {
  const input = schema.parse(await readBody(event))
  const rows = await useDb().select().from(users).where(eq(users.email, input.email.toLowerCase())).limit(1)
  const user = rows[0]
  if (!user?.active || !(await compare(input.password, user.passwordHash))) throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  await useDb().update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id))
  await createUserSession(event, user.id)
  return { user: { id: user.id, name: user.name, email: user.email, role: user.role } }
})
