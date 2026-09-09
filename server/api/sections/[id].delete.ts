import { count, eq } from 'drizzle-orm'
import { articles, sections } from '../../database/schema'

export default defineEventHandler(async event => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Invalid category id' })
  const [category] = await useDb().select({ id: sections.id }).from(sections).where(eq(sections.id, id)).limit(1)
  if (!category) throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  const [linked] = await useDb().select({ total: count(articles.id) }).from(articles).where(eq(articles.sectionId, id))
  if ((linked?.total ?? 0) > 0) throw createError({ statusCode: 409, statusMessage: 'Category has linked articles' })
  await useDb().delete(sections).where(eq(sections.id, id))
  await invalidatePublicContentCache()
  return { ok: true }
})
