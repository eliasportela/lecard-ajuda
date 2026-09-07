import { asc } from 'drizzle-orm'
import { sections, spaces } from '../../database/schema'
export default defineEventHandler(async event => { await requireUser(event); return { sections: await useDb().select({ id: sections.id, title: sections.title, spaceId: sections.spaceId }).from(sections).orderBy(asc(sections.spaceId), asc(sections.position)), spaces: await useDb().select().from(spaces).orderBy(asc(spaces.position), asc(spaces.name)) } })
