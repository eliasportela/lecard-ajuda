import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { articles } from '../../../database/schema'

const schema = z.object({ status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']) })
export default defineEventHandler(async event => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Invalid article id' })
  const input = schema.parse(await readBody(event))
  const [article] = await useDb().select({ id: articles.id, publishedAt: articles.publishedAt }).from(articles).where(eq(articles.id, id)).limit(1)
  if (!article) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  await useDb().update(articles).set({ status: input.status, publishedAt: input.status === 'PUBLISHED' ? (article.publishedAt || new Date()) : null }).where(eq(articles.id, id))
  return { ok: true }
})
