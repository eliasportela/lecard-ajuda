import { desc } from 'drizzle-orm'
import { articles } from '../../database/schema'
export default defineEventHandler(async event => { await requireUser(event); return useDb().select({ id: articles.id, title: articles.title, slug: articles.slug, status: articles.status, updatedAt: articles.updatedAt }).from(articles).orderBy(desc(articles.updatedAt)) })
