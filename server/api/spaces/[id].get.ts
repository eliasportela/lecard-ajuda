import { eq } from 'drizzle-orm'
import { spaces } from '../../database/schema'

export default defineEventHandler(async event => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Invalid space id' })
  const [space] = await useDb().select().from(spaces).where(eq(spaces.id, id)).limit(1)
  if (!space) throw createError({ statusCode: 404, statusMessage: 'Space not found' })
  return space
})
