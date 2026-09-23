import { desc } from 'drizzle-orm'
import { articles, attachments } from '../../database/schema'

export default defineEventHandler(async event => {
  await requireUser(event)

  const [items, savedArticles] = await Promise.all([
    useDb().select().from(attachments).orderBy(desc(attachments.createdAt)),
    useDb().select({ id: articles.id, title: articles.title, markdown: articles.markdown }).from(articles)
  ])
  const config = useRuntimeConfig()
  const cdnUrl = config.public.spacesCdnUrl.replace(/\/$/, '')

  return items.map(item => {
    const usedBy = savedArticles
      .filter(article => article.markdown.includes(item.storageKey))
      .map(article => ({ id: article.id, title: article.title }))

    return {
      id: item.id,
      originalName: item.originalName,
      publicUrl: `${cdnUrl}/${item.storageKey}`,
      mimeType: item.mimeType,
      size: item.size,
      createdAt: item.createdAt,
      usedBy
    }
  })
})
