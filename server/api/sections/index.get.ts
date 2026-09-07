import { asc } from 'drizzle-orm'
import { sections } from '../../database/schema'
export default defineEventHandler(async event => { await requireUser(event); return useDb().select().from(sections).orderBy(asc(sections.spaceId), asc(sections.position)) })
