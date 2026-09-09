import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { sections } from '../../database/schema'
import { categoryIconNames } from '../../../shared/category-icons'
const schema = z.object({ spaceId: z.number().int().positive(), title: z.string().min(2).max(160), slug: z.string().regex(/^[a-z0-9-]+$/).max(180), icon: z.enum(categoryIconNames).default('Folder') })
export default defineEventHandler(async event => { await requireUser(event); const input = schema.parse(await readBody(event)); const [lastCategory] = await useDb().select({ position: sections.position }).from(sections).where(eq(sections.spaceId, input.spaceId)).orderBy(desc(sections.position)).limit(1); const result = await useDb().insert(sections).values({ ...input, position: (lastCategory?.position ?? -1) + 1 }); await invalidatePublicContentCache(); return { id: result[0].insertId } })
