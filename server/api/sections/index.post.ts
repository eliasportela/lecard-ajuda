import { z } from 'zod'
import { sections } from '../../database/schema'
const schema = z.object({ spaceId: z.number().int().positive(), title: z.string().min(2).max(160), slug: z.string().regex(/^[a-z0-9-]+$/).max(180), position: z.number().int().min(0).default(0) })
export default defineEventHandler(async event => { await requireUser(event); const input = schema.parse(await readBody(event)); const result = await useDb().insert(sections).values(input); return { id: result[0].insertId } })
