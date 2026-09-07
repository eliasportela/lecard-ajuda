import { and, eq } from 'drizzle-orm'
import { articles, spaces } from '../../../../database/schema'

export default defineEventHandler(async (event) => {
  const spaceSlug = getRouterParam(event, 'space')!
  const articleSlug = getRouterParam(event, 'article')!
  const db = useDb()
  const rows = await db.select({ id: articles.id, title: articles.title, summary: articles.summary, markdown: articles.markdown, spaceId: spaces.id })
    .from(articles).innerJoin(spaces, eq(articles.spaceId, spaces.id))
    .where(and(eq(spaces.slug, spaceSlug), eq(spaces.visibility, 'PUBLIC'), eq(articles.slug, articleSlug), eq(articles.status, 'PUBLISHED'))).limit(1)
  const article = rows[0]
  if (!article) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  return { article: { ...article, html: await renderMarkdown(article.markdown), markdown: undefined }, navigation: await getPublicNavigation() }
})
