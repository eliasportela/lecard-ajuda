import { z } from 'zod'
import { desc } from 'drizzle-orm'
import { spaces } from '../../database/schema'

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(140),
  description: z.string().trim().max(2000).nullable().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC')
})

export default defineEventHandler(async event => {
  await requireUser(event)
  const input = schema.parse(await readBody(event))
  const [lastSpace] = await useDb().select({ position: spaces.position }).from(spaces).orderBy(desc(spaces.position)).limit(1)
  const result = await useDb().insert(spaces).values({ ...input, description: input.description || null, position: (lastSpace?.position ?? -1) + 1 })
  return { id: result[0].insertId }
})
