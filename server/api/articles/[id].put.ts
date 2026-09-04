import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { articles, sections } from '../../database/schema'

const inputSchema = z.object({ title: z.string().min(2).max(200), slug: z.string().regex(/^[a-z0-9-]+$/).max(220), summary: z.string().max(1000).nullable().optional(), sectionId: z.number().int().positive(), markdown: z.string().min(1), status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']) })
export default defineEventHandler(async event => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const input = inputSchema.parse(await readBody(event))
  const [section] = await useDb().select().from(sections).where(eq(sections.id, input.sectionId)).limit(1)
  if (!section) throw createError({ statusCode: 422, statusMessage: 'Invalid section' })
  await useDb().update(articles).set({ ...input, spaceId: section.spaceId, summary: input.summary || null, publishedAt: input.status === 'PUBLISHED' ? new Date() : null }).where(eq(articles.id, id))
  return { ok: true }
})
