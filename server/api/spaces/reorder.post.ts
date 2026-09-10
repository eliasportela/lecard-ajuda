import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { spaces } from '../../database/schema'

const schema = z.object({ ids: z.array(z.number().int().positive()).min(1) })

export default defineEventHandler(async event => {
  await requireUser(event)
  const { ids } = schema.parse(await readBody(event))
  if (new Set(ids).size !== ids.length) throw createError({ statusCode: 422, statusMessage: 'Duplicate space ids' })
  await useDb().transaction(async tx => {
    for (const [position, id] of ids.entries()) await tx.update(spaces).set({ position }).where(eq(spaces.id, id))
  })
  await invalidatePublicContentCache()
  return { ok: true }
})
