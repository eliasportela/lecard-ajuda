import { createHash } from 'node:crypto'

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS_PER_IDENTITY = 5
const MAX_ATTEMPTS_PER_IP = 20

interface RateLimitEntry {
  attempts: number
  resetAt: number
}

const attempts = new Map<string, RateLimitEntry>()
let operationsSinceCleanup = 0

function hash(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function clientIp(event: Parameters<typeof getRequestIP>[0]) {
  return getRequestIP(event, { xForwardedFor: true }) || 'unknown'
}

function cleanupExpiredEntries(now: number) {
  operationsSinceCleanup += 1
  if (operationsSinceCleanup < 100) return

  operationsSinceCleanup = 0
  for (const [key, entry] of attempts) {
    if (entry.resetAt <= now) attempts.delete(key)
  }
}

function activeEntry(key: string, now: number) {
  const entry = attempts.get(key)
  if (!entry || entry.resetAt <= now) return null
  return entry
}

export function consumeLoginAttempt(event: Parameters<typeof getRequestIP>[0], email: string) {
  const now = Date.now()
  cleanupExpiredEntries(now)

  const ipHash = hash(clientIp(event))
  const keys = [
    { key: `identity:${hash(`${ipHash}:${email.toLowerCase()}`)}`, limit: MAX_ATTEMPTS_PER_IDENTITY },
    { key: `ip:${ipHash}`, limit: MAX_ATTEMPTS_PER_IP }
  ]

  let retryAfter = 0
  for (const { key, limit } of keys) {
    const entry = activeEntry(key, now)
    if (entry && entry.attempts >= limit) {
      retryAfter = Math.max(retryAfter, Math.ceil((entry.resetAt - now) / 1000))
    }
  }

  if (retryAfter > 0) return { allowed: false as const, retryAfter }

  for (const { key } of keys) {
    const entry = activeEntry(key, now)
    if (entry) entry.attempts += 1
    else attempts.set(key, { attempts: 1, resetAt: now + WINDOW_MS })
  }

  return { allowed: true as const, keys: keys.map(({ key }) => key) }
}

export function refundLoginAttempt(keys: string[]) {
  for (const key of keys) {
    const entry = attempts.get(key)
    if (!entry) continue
    entry.attempts -= 1
    if (entry.attempts <= 0) attempts.delete(key)
  }
}
