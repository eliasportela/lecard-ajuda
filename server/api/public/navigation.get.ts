import { and, asc, eq } from 'drizzle-orm'
import { articles, sections, spaces } from '../../database/schema'

export default defineCachedEventHandler(async () => {
  const db = useDb()
  const [space] = await db.select().from(spaces).where(eq(spaces.visibility, 'PUBLIC')).limit(1)
  if (!space) return { space: { name: 'Lecard Ajuda', slug: 'ajuda', description: null }, sections: [] }
  const rows = await db.select({ sectionId: sections.id, sectionTitle: sections.title, sectionPosition: sections.position, articleId: articles.id, articleTitle: articles.title, articleSlug: articles.slug, articlePosition: articles.position })
    .from(sections).leftJoin(articles, and(eq(articles.sectionId, sections.id), eq(articles.status, 'PUBLISHED')))
    .where(eq(sections.spaceId, space.id)).orderBy(asc(sections.position), asc(articles.position))
  const grouped = new Map<number, { id: number; title: string; articles: Array<{ id: number; title: string; slug: string }> }>()
  for (const row of rows) { const section = grouped.get(row.sectionId) ?? { id: row.sectionId, title: row.sectionTitle, articles: [] }; if (row.articleId) section.articles.push({ id: row.articleId, title: row.articleTitle!, slug: row.articleSlug! }); grouped.set(row.sectionId, section) }
  return { space, sections: [...grouped.values()] }
}, { maxAge: 300, name: 'public-navigation' })
