import { z } from 'zod'
import { articles, attachments, sections } from '../../database/schema'
import { and, eq, inArray, isNull } from 'drizzle-orm'

const inputSchema = z.object({ title: z.string().min(2).max(200), slug: z.string().regex(/^[a-z0-9-]+$/).max(220), summary: z.string().max(1000).optional(), sectionId: z.number().int().positive(), markdown: z.string().min(1), status: z.enum(['DRAFT', 'PUBLISHED']), attachmentIds: z.array(z.number().int().positive()).max(100).optional() })
export default defineEventHandler(async event => {
  const user = await requireUser(event)
  const parsedInput = inputSchema.safeParse(await readBody(event))
  if (!parsedInput.success) throw createError({ statusCode: 400, statusMessage: 'Invalid article data' })
  const input = parsedInput.data
  const [section] = await useDb().select().from(sections).where(eq(sections.id, input.sectionId)).limit(1)
  if (!section) throw createError({ statusCode: 422, statusMessage: 'Invalid section' })
  const { attachmentIds = [], ...articleInput } = input
  const db = useDb()
  const articleId = await db.transaction(async tx => {
    const result = await tx.insert(articles).values({ ...articleInput, spaceId: section.spaceId, authorId: user.id, summary: input.summary || null, publishedAt: input.status === 'PUBLISHED' ? new Date() : null })
    const id = result[0].insertId
    if (attachmentIds.length) {
      await tx.update(attachments).set({ articleId: id }).where(and(inArray(attachments.id, attachmentIds), isNull(attachments.articleId)))
    }
    return id
  })
  return { id: articleId }
})
