import { z } from 'zod'
import { articles, sections } from '../../database/schema'
import { eq } from 'drizzle-orm'

const inputSchema = z.object({ title: z.string().min(2).max(200), slug: z.string().regex(/^[a-z0-9-]+$/).max(220), summary: z.string().max(1000).optional(), sectionId: z.number().int().positive(), markdown: z.string().min(1), status: z.enum(['DRAFT', 'PUBLISHED']) })
export default defineEventHandler(async event => {
  const user = await requireUser(event)
  const input = inputSchema.parse(await readBody(event))
  const [section] = await useDb().select().from(sections).where(eq(sections.id, input.sectionId)).limit(1)
  if (!section) throw createError({ statusCode: 422, statusMessage: 'Invalid section' })
  const result = await useDb().insert(articles).values({ ...input, spaceId: section.spaceId, authorId: user.id, summary: input.summary || null, publishedAt: input.status === 'PUBLISHED' ? new Date() : null })
  return { id: result[0].insertId }
})
