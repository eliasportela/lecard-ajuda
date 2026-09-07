import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { sections } from '../../database/schema'

const schema = z.object({ spaceId: z.number().int().positive(), ids: z.array(z.number().int().positive()).min(1) })

export default defineEventHandler(async event => {
  await requireUser(event)
  const { spaceId, ids } = schema.parse(await readBody(event))
  if (new Set(ids).size !== ids.length) throw createError({ statusCode: 422, statusMessage: 'Duplicate category ids' })
  await useDb().transaction(async tx => {
    for (const [position, id] of ids.entries()) await tx.update(sections).set({ position }).where(and(eq(sections.id, id), eq(sections.spaceId, spaceId)))
  })
  return { ok: true }
})
