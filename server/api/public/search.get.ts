import { and, eq, like, or } from 'drizzle-orm'
import { articles, spaces } from '../../database/schema'

export default defineEventHandler(async event => {
  const q = String(getQuery(event).q ?? '').trim().slice(0, 100)
  if (q.length < 2) return []
  return useDb().select({ id: articles.id, title: articles.title, slug: articles.slug, summary: articles.summary, spaceSlug: spaces.slug })
    .from(articles).innerJoin(spaces, eq(articles.spaceId, spaces.id))
    .where(and(eq(articles.status, 'PUBLISHED'), eq(spaces.visibility, 'PUBLIC'), or(like(articles.title, `%${q}%`), like(articles.markdown, `%${q}%`)))).limit(30)
})
