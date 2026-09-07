import { eq } from 'drizzle-orm'
import { sections } from '../../database/schema'
export default defineEventHandler(async event => { await requireUser(event); const id = Number(getRouterParam(event, 'id')); if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Invalid category id' }); const [category] = await useDb().select().from(sections).where(eq(sections.id, id)).limit(1); if (!category) throw createError({ statusCode: 404, statusMessage: 'Category not found' }); return category })
