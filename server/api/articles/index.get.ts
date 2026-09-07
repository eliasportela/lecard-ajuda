import { desc, eq } from 'drizzle-orm'
import { articles, sections, users } from '../../database/schema'
export default defineEventHandler(async event => { await requireUser(event); return useDb().select({ id: articles.id, title: articles.title, slug: articles.slug, status: articles.status, updatedAt: articles.updatedAt, sectionId: articles.sectionId, category: sections.title, authorId: users.id, authorName: users.name }).from(articles).innerJoin(sections, eq(articles.sectionId, sections.id)).innerJoin(users, eq(articles.authorId, users.id)).orderBy(desc(articles.updatedAt)) })
