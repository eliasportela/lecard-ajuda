import sharp from 'sharp'

const MAX_DIMENSION = 1920
const WEBP_QUALITY = 82

export async function processUploadedImage(data: Buffer, mimeType: string, originalName: string) {
  if (mimeType === 'image/gif') {
    return { data, mimeType, extension: 'gif', originalName }
  }

  const image = sharp(data, { failOn: 'error' })
  const metadata = await image.metadata()
  const resized = image
    .autoOrient()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })

  if (mimeType === 'image/png' && metadata.hasAlpha) {
    const processed = await resized.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer()
    return { data: processed, mimeType: 'image/png', extension: 'png', originalName }
  }

  const processed = await resized.webp({ quality: WEBP_QUALITY, effort: 4 }).toBuffer()
  const convertedName = originalName.replace(/\.[^.]+$/, '') + '.webp'
  return { data: processed, mimeType: 'image/webp', extension: 'webp', originalName: convertedName }
}
