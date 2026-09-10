import { eq } from 'drizzle-orm'
import { articles } from '../../database/schema'

export default defineEventHandler(async event => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Invalid article id' })

  const [article] = await useDb().select({ id: articles.id }).from(articles).where(eq(articles.id, id)).limit(1)
  if (!article) throw createError({ statusCode: 404, statusMessage: 'Article not found' })

  await useDb().delete(articles).where(eq(articles.id, id))
  await invalidatePublicContentCache()
  return { ok: true }
})
