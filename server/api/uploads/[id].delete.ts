import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { eq } from 'drizzle-orm'
import { articles, attachments } from '../../database/schema'

export default defineEventHandler(async event => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Imagem inválida.' })

  const [attachment] = await useDb().select().from(attachments).where(eq(attachments.id, id)).limit(1)
  if (!attachment) throw createError({ statusCode: 404, statusMessage: 'Imagem não encontrada.' })

  const savedArticles = await useDb().select({ id: articles.id, title: articles.title, markdown: articles.markdown }).from(articles)
  const usedBy = savedArticles.filter(article => article.markdown.includes(attachment.storageKey))
  if (usedBy.length) {
    const titles = usedBy.slice(0, 3).map(article => `“${article.title}”`).join(', ')
    const suffix = usedBy.length > 3 ? ` e mais ${usedBy.length - 3}` : ''
    throw createError({ statusCode: 409, statusMessage: `Esta imagem está em uso em ${titles}${suffix}. Remova-a dos artigos antes de excluir.` })
  }

  const config = useRuntimeConfig()
  if (!config.spacesEndpoint || !config.spacesBucket || !config.spacesKey || !config.spacesSecret) {
    throw createError({ statusCode: 503, statusMessage: 'O armazenamento de imagens não está configurado.' })
  }
  const client = new S3Client({
    endpoint: config.spacesEndpoint,
    region: config.spacesRegion,
    forcePathStyle: false,
    credentials: { accessKeyId: config.spacesKey, secretAccessKey: config.spacesSecret }
  })

  try {
    await client.send(new DeleteObjectCommand({ Bucket: config.spacesBucket, Key: attachment.storageKey }))
  } catch (error) {
    console.error(`Spaces delete failed (bucket: ${config.spacesBucket}, key: ${attachment.storageKey})`, error)
    throw createError({ statusCode: 502, statusMessage: 'Não foi possível excluir a imagem do armazenamento.' })
  }

  await useDb().delete(attachments).where(eq(attachments.id, id))
  return { ok: true }
})
