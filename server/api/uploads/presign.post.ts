import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

const schema = z.object({ filename: z.string().min(1).max(255), contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']), size: z.number().int().positive().max(10_000_000) })
export default defineEventHandler(async event => {
  await requireUser(event)
  const input = schema.parse(await readBody(event))
  const config = useRuntimeConfig()
  if (!config.spacesEndpoint || !config.spacesBucket || !config.spacesKey || !config.spacesSecret) throw createError({ statusCode: 503, statusMessage: 'Spaces is not configured' })
  const extension = input.filename.split('.').pop()?.toLowerCase() ?? 'bin'
  const key = `articles/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`
  const client = new S3Client({ endpoint: config.spacesEndpoint, region: config.spacesRegion, credentials: { accessKeyId: config.spacesKey, secretAccessKey: config.spacesSecret } })
  const url = await getSignedUrl(client, new PutObjectCommand({ Bucket: config.spacesBucket, Key: key, ContentType: input.contentType, ContentLength: input.size, ACL: 'public-read' }), { expiresIn: 300 })
  return { uploadUrl: url, key, publicUrl: `${config.public.spacesCdnUrl.replace(/\/$/, '')}/${key}` }
})
