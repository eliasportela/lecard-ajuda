import { createHash, randomBytes } from 'node:crypto'

const TOKEN_TTL_MS = 30 * 60 * 1000
const REQUEST_WINDOW_MS = 60 * 60 * 1000
const resetRequests = new Map<string, { attempts: number, resetAt: number }>()

export const passwordResetTokenHash = (token: string) => createHash('sha256').update(token).digest('hex')

export function createPasswordResetToken() {
  const token = randomBytes(32).toString('base64url')
  return { token, id: passwordResetTokenHash(token), expiresAt: new Date(Date.now() + TOKEN_TTL_MS) }
}

export function allowPasswordResetRequest(event: Parameters<typeof getRequestIP>[0], email: string) {
  const now = Date.now()
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const keys = [
    { key: `identity:${passwordResetTokenHash(`${ip}:${email.toLowerCase()}`)}`, limit: 3 },
    { key: `ip:${passwordResetTokenHash(ip)}`, limit: 10 }
  ]

  for (const { key, limit } of keys) {
    const entry = resetRequests.get(key)
    if (entry && entry.resetAt > now && entry.attempts >= limit) return false
  }
  for (const { key } of keys) {
    const entry = resetRequests.get(key)
    if (entry && entry.resetAt > now) entry.attempts += 1
    else resetRequests.set(key, { attempts: 1, resetAt: now + REQUEST_WINDOW_MS })
  }
  if (resetRequests.size > 1_000) {
    for (const [key, entry] of resetRequests) if (entry.resetAt <= now) resetRequests.delete(key)
  }
  return true
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!)
}

export async function sendPasswordResetEmail(recipient: { email: string, name: string }, token: string) {
  const config = useRuntimeConfig()
  if (!config.brevoApiKey) throw new Error('Brevo is not configured')

  const resetUrl = new URL('/redefinir-senha', config.public.siteUrl)
  resetUrl.searchParams.set('token', token)
  const safeName = escapeHtml(recipient.name)
  const safeUrl = escapeHtml(resetUrl.toString())

  await $fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': config.brevoApiKey, accept: 'application/json' },
    body: {
      sender: { email: 'noreply@lecard.app', name: 'LeCard' },
      to: [{ email: recipient.email, name: recipient.name }],
      subject: 'Redefinição de senha — Lecard Ajuda',
      htmlContent: `<p>Olá, ${safeName}.</p><p>Recebemos uma solicitação para redefinir sua senha no Lecard Ajuda.</p><p><a href="${safeUrl}">Redefinir minha senha</a></p><p>Este link expira em 30 minutos e só pode ser usado uma vez. Se você não fez esta solicitação, ignore este e-mail.</p>`,
      tags: ['password-reset']
    }
  })
}
