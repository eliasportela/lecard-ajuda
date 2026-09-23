import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { articles, attachments } from '../../database/schema'

const schema = z.object({
  key: z.string().regex(/^(?:[a-zA-Z0-9._-]+\/)*articles\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}\.[a-z0-9]+$/).max(500),
  filename: z.string().min(1).max(255),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  size: z.number().int().positive().max(5_000_000),
  articleId: z.number().int().positive().nullable().optional()
})

export default defineEventHandler(async event => {
  await requireUser(event)
  const input = schema.parse(await readBody(event))
  const config = useRuntimeConfig()

  if (!config.spacesEndpoint || !config.spacesBucket || !config.spacesKey || !config.spacesSecret) {
    throw createError({ statusCode: 503, statusMessage: 'Spaces is not configured' })
  }

  if (input.articleId) {
    const [article] = await useDb().select({ id: articles.id }).from(articles).where(eq(articles.id, input.articleId)).limit(1)
    if (!article) throw createError({ statusCode: 422, statusMessage: 'Invalid article' })
  }

  const client = new S3Client({
    endpoint: config.spacesEndpoint,
    region: config.spacesRegion,
    forcePathStyle: false,
    credentials: { accessKeyId: config.spacesKey, secretAccessKey: config.spacesSecret }
  })
  const uploaded = await client.send(new HeadObjectCommand({ Bucket: config.spacesBucket, Key: input.key }))

  if (uploaded.ContentLength !== input.size || uploaded.ContentType !== input.contentType) {
    throw createError({ statusCode: 422, statusMessage: 'Uploaded file metadata does not match' })
  }

  const result = await useDb().insert(attachments).values({
    articleId: input.articleId ?? null,
    originalName: input.filename,
    storageKey: input.key,
    mimeType: input.contentType,
    size: input.size
  })

  return {
    id: result[0].insertId,
    publicUrl: `${config.public.spacesCdnUrl.replace(/\/$/, '')}/${input.key}`
  }
})
