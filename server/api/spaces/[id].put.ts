import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { spaces } from '../../database/schema'

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(140),
  description: z.string().trim().max(2000).nullable().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE'])
})

export default defineEventHandler(async event => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Invalid space id' })
  const input = schema.parse(await readBody(event))
  const [space] = await useDb().select({ id: spaces.id }).from(spaces).where(eq(spaces.id, id)).limit(1)
  if (!space) throw createError({ statusCode: 404, statusMessage: 'Space not found' })
  await useDb().update(spaces).set({ ...input, description: input.description || null }).where(eq(spaces.id, id))
  await invalidatePublicContentCache()
  return { ok: true }
})
