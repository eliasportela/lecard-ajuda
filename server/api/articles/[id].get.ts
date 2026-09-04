import { eq } from 'drizzle-orm'
import { articles } from '../../database/schema'

export default defineEventHandler(async event => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const [article] = await useDb().select().from(articles).where(eq(articles.id, id)).limit(1)
  if (!article) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  return article
})
