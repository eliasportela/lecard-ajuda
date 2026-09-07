import { asc, count, eq } from 'drizzle-orm'
import { sections, spaces } from '../../database/schema'

export default defineEventHandler(async event => {
  await requireUser(event)
  return useDb()
    .select({
      id: spaces.id,
      name: spaces.name,
      slug: spaces.slug,
      description: spaces.description,
      visibility: spaces.visibility,
      position: spaces.position,
      categoryCount: count(sections.id),
      createdAt: spaces.createdAt,
      updatedAt: spaces.updatedAt
    })
    .from(spaces)
    .leftJoin(sections, eq(sections.spaceId, spaces.id))
    .groupBy(spaces.id, spaces.name, spaces.slug, spaces.description, spaces.visibility, spaces.position, spaces.createdAt, spaces.updatedAt)
    .orderBy(asc(spaces.position), asc(spaces.name))
})
