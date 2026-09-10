import { asc } from 'drizzle-orm'
import { sections, spaces, users } from '../../database/schema'
export default defineEventHandler(async event => {
  const currentUser = await requireUser(event)
  const authors = await useDb().select({ id: users.id, name: users.name, active: users.active }).from(users).orderBy(asc(users.name))
  return {
    sections: await useDb().select({ id: sections.id, title: sections.title, spaceId: sections.spaceId }).from(sections).orderBy(asc(sections.spaceId), asc(sections.position)),
    spaces: await useDb().select().from(spaces).orderBy(asc(spaces.position), asc(spaces.name)),
    authors,
    currentUserId: currentUser.id,
    canChangeAuthor: currentUser.role === 'ADMIN'
  }
})
