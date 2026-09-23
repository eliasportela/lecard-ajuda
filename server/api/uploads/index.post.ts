import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { articles, attachments } from '../../database/schema'

const allowedContentTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
} as const
const maxUploadSize = 5_000_000

export default defineEventHandler(async event => {
  await requireUser(event)

  const parts = await readMultipartFormData(event)
  const image = parts?.find(part => part.name === 'file' && part.filename)
  const articleIdPart = parts?.find(part => part.name === 'articleId')
  const articleIdValue = articleIdPart?.data.toString().trim()
  const articleId = articleIdValue ? Number(articleIdValue) : null

  if (!image?.filename || !image.type || !(image.type in allowedContentTypes)) {
    throw createError({ statusCode: 422, message: 'Envie uma imagem JPG, PNG, WebP ou GIF.' })
  }
  if (!image.data.length || image.data.length > maxUploadSize) {
    throw createError({ statusCode: 422, message: 'A imagem deve ter no máximo 5 MB.' })
  }
  if (articleId !== null && (!Number.isInteger(articleId) || articleId <= 0)) {
    throw createError({ statusCode: 422, message: 'Artigo inválido.' })
  }

  if (articleId) {
    const [article] = await useDb().select({ id: articles.id }).from(articles).where(eq(articles.id, articleId)).limit(1)
    if (!article) throw createError({ statusCode: 422, message: 'Artigo inválido.' })
  }

  const config = useRuntimeConfig()
  if (!config.spacesEndpoint || !config.spacesBucket || !config.spacesKey || !config.spacesSecret) {
    throw createError({ statusCode: 503, message: 'O armazenamento de imagens não está configurado.' })
  }

  const contentType = image.type as keyof typeof allowedContentTypes
  let processedImage: Awaited<ReturnType<typeof processUploadedImage>>
  try {
    processedImage = await processUploadedImage(image.data, contentType, image.filename)
  } catch {
    throw createError({ statusCode: 422, message: 'Não foi possível processar a imagem. Verifique se o arquivo é válido.' })
  }
  const prefix = config.spacesPrefix.replace(/^\/+|\/+$/g, '')
  const objectPath = `articles/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${processedImage.extension}`
  const key = prefix ? `${prefix}/${objectPath}` : objectPath
  const client = new S3Client({
    endpoint: config.spacesEndpoint,
    region: config.spacesRegion,
    forcePathStyle: false,
    credentials: { accessKeyId: config.spacesKey, secretAccessKey: config.spacesSecret }
  })

  try {
    await client.send(new PutObjectCommand({
      Bucket: config.spacesBucket,
      Key: key,
      Body: processedImage.data,
      ContentType: processedImage.mimeType,
      ContentLength: processedImage.data.length,
      ACL: 'public-read'
    }))
  } catch (error) {
    console.error(`Spaces upload failed (bucket: ${config.spacesBucket}, key: ${key})`, error)
    throw createError({ statusCode: 502, message: 'Não foi possível enviar a imagem para o armazenamento.' })
  }

  const result = await useDb().insert(attachments).values({
    articleId,
    originalName: processedImage.originalName,
    storageKey: key,
    mimeType: processedImage.mimeType,
    size: processedImage.data.length
  })

  return {
    id: result[0].insertId,
    publicUrl: `${config.public.spacesCdnUrl.replace(/\/$/, '')}/${key}`
  }
})
