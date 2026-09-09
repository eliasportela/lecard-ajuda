import { and, asc, eq } from 'drizzle-orm'
import { articles, sections, spaces } from '../database/schema'

export interface PublicNavigationArticle {
  id: number
  title: string
  slug: string
  summary: string | null
  publishedAt: Date | null
}

export interface PublicNavigationSection {
  id: number
  title: string
  slug: string
  icon: string
  articles: PublicNavigationArticle[]
}

export interface PublicNavigationSpace {
  id: number
  name: string
  slug: string
  description: string | null
  sections: PublicNavigationSection[]
}

export async function getPublicNavigation(): Promise<PublicNavigationSpace[]> {
  const rows = await useDb().select({
    spaceId: spaces.id,
    spaceName: spaces.name,
    spaceSlug: spaces.slug,
    spaceDescription: spaces.description,
    sectionId: sections.id,
    sectionTitle: sections.title,
    sectionSlug: sections.slug,
    sectionIcon: sections.icon,
    articleId: articles.id,
    articleTitle: articles.title,
    articleSlug: articles.slug,
    articleSummary: articles.summary,
    articlePublishedAt: articles.publishedAt
  })
    .from(spaces)
    .leftJoin(sections, eq(sections.spaceId, spaces.id))
    .leftJoin(articles, and(eq(articles.sectionId, sections.id), eq(articles.status, 'PUBLISHED')))
    .where(eq(spaces.visibility, 'PUBLIC'))
    .orderBy(asc(spaces.position), asc(sections.position), asc(articles.position))

  const navigation = new Map<number, PublicNavigationSpace>()
  const navigationSections = new Map<number, PublicNavigationSection>()

  for (const row of rows) {
    const space = navigation.get(row.spaceId) ?? {
      id: row.spaceId,
      name: row.spaceName,
      slug: row.spaceSlug,
      description: row.spaceDescription,
      sections: []
    }
    navigation.set(row.spaceId, space)

    if (!row.sectionId) continue
    let section = navigationSections.get(row.sectionId)
    if (!section) {
      section = { id: row.sectionId, title: row.sectionTitle!, slug: row.sectionSlug!, icon: row.sectionIcon!, articles: [] }
      navigationSections.set(row.sectionId, section)
      space.sections.push(section)
    }
    if (row.articleId) section.articles.push({ id: row.articleId, title: row.articleTitle!, slug: row.articleSlug!, summary: row.articleSummary, publishedAt: row.articlePublishedAt })
  }

  return [...navigation.values()]
    .map(space => ({ ...space, sections: space.sections.filter(section => section.articles.length > 0) }))
    .filter(space => space.sections.length > 0)
}
