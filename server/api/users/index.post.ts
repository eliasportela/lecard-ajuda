import { hash } from 'bcryptjs'
import { z } from 'zod'
import { users } from '../../database/schema'

const schema = z.object({ name: z.string().min(2).max(120), email: z.email(), password: z.string().min(8).max(200), role: z.enum(['ADMIN', 'EDITOR']) })
export default defineEventHandler(async event => {
  await requireUser(event, 'ADMIN')
  const input = schema.parse(await readBody(event))
  const result = await useDb().insert(users).values({ name: input.name, email: input.email.toLowerCase(), passwordHash: await hash(input.password, 12), role: input.role })
  return { id: result[0].insertId }
})
