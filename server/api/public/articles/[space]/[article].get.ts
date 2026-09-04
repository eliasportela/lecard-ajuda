import { and, asc, eq } from 'drizzle-orm'
import { articles, sections, spaces } from '../../../../database/schema'

export default defineCachedEventHandler(async (event) => {
  const spaceSlug = getRouterParam(event, 'space')!
  const articleSlug = getRouterParam(event, 'article')!
  const db = useDb()
  const rows = await db.select({ id: articles.id, title: articles.title, summary: articles.summary, markdown: articles.markdown, spaceId: spaces.id })
    .from(articles).innerJoin(spaces, eq(articles.spaceId, spaces.id))
    .where(and(eq(spaces.slug, spaceSlug), eq(spaces.visibility, 'PUBLIC'), eq(articles.slug, articleSlug), eq(articles.status, 'PUBLISHED'))).limit(1)
  const article = rows[0]
  if (!article) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  const nav = await db.select({ id: sections.id, title: sections.title, articleId: articles.id, articleTitle: articles.title, articleSlug: articles.slug })
    .from(sections).leftJoin(articles, and(eq(articles.sectionId, sections.id), eq(articles.status, 'PUBLISHED')))
    .where(eq(sections.spaceId, article.spaceId)).orderBy(asc(sections.position), asc(articles.position))
  const grouped = new Map<number, { id: number; title: string; articles: Array<{ id: number; title: string; slug: string }> }>()
  for (const row of nav) { const section = grouped.get(row.id) ?? { id: row.id, title: row.title, articles: [] }; if (row.articleId) section.articles.push({ id: row.articleId, title: row.articleTitle!, slug: row.articleSlug! }); grouped.set(row.id, section) }
  return { article: { ...article, html: await renderMarkdown(article.markdown), markdown: undefined }, navigation: [...grouped.values()] }
}, { maxAge: 300, name: 'public-article', getKey: event => `${getRouterParam(event, 'space')}:${getRouterParam(event, 'article')}` })
