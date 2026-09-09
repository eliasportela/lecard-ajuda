import { inArray } from 'drizzle-orm'
import { z } from 'zod'
import { articles } from '../../database/schema'

const schema = z.object({ ids: z.array(z.number().int().positive()).min(1).max(1000) })

export default defineEventHandler(async event => {
  await requireUser(event)
  const { ids } = schema.parse(await readBody(event))
  await useDb().delete(articles).where(inArray(articles.id, [...new Set(ids)]))
  await invalidatePublicContentCache()
  return { ok: true }
})
