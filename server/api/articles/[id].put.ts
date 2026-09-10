import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { articles, sections, users } from '../../database/schema'

const inputSchema = z.object({ title: z.string().min(2).max(200), slug: z.string().regex(/^[a-z0-9-]+$/).max(220), summary: z.string().max(1000).nullable().optional(), sectionId: z.number().int().positive(), authorId: z.number().int().positive(), markdown: z.string().min(1), status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']) })
export default defineEventHandler(async event => {
  const currentUser = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const parsedInput = inputSchema.safeParse(await readBody(event))
  if (!parsedInput.success) throw createError({ statusCode: 400, statusMessage: 'Invalid article data' })
  const input = parsedInput.data
  const [section] = await useDb().select().from(sections).where(eq(sections.id, input.sectionId)).limit(1)
  if (!section) throw createError({ statusCode: 422, statusMessage: 'Invalid section' })
  const [article] = await useDb().select({ authorId: articles.authorId }).from(articles).where(eq(articles.id, id)).limit(1)
  if (!article) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  if (currentUser.role !== 'ADMIN' && input.authorId !== article.authorId) throw createError({ statusCode: 403, statusMessage: 'Only administrators can change the author' })
  const [author] = await useDb().select({ id: users.id, active: users.active }).from(users).where(eq(users.id, input.authorId)).limit(1)
  if (!author || (!author.active && input.authorId !== article.authorId)) throw createError({ statusCode: 422, statusMessage: 'Invalid author' })
  await useDb().update(articles).set({ ...input, spaceId: section.spaceId, summary: input.summary || null, publishedAt: input.status === 'PUBLISHED' ? new Date() : null }).where(eq(articles.id, id))
  await invalidatePublicContentCache()
  return { ok: true }
})
