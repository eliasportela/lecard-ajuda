import { compare, hash } from 'bcryptjs'
import { and, eq, gt } from 'drizzle-orm'
import { z } from 'zod'
import { passwordResetTokens, sessions, users } from '../../database/schema'

const schema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  password: z.string().min(8).max(200)
})

export default defineEventHandler(async event => {
  const input = schema.parse(await readBody(event))
  const tokenId = passwordResetTokenHash(input.token)
  const [reset] = await useDb().select({ id: passwordResetTokens.id, userId: passwordResetTokens.userId, passwordHash: users.passwordHash })
    .from(passwordResetTokens)
    .innerJoin(users, eq(passwordResetTokens.userId, users.id))
    .where(and(eq(passwordResetTokens.id, tokenId), gt(passwordResetTokens.expiresAt, new Date()), eq(users.active, true)))
    .limit(1)

  if (!reset) throw createError({ statusCode: 400, statusMessage: 'Invalid or expired reset token' })
  if (await compare(input.password, reset.passwordHash)) throw createError({ statusCode: 422, statusMessage: 'New password must be different' })

  const passwordHash = await hash(input.password, 12)
  await useDb().transaction(async tx => {
    const deleted = await tx.delete(passwordResetTokens).where(and(eq(passwordResetTokens.id, reset.id), gt(passwordResetTokens.expiresAt, new Date())))
    if (deleted[0].affectedRows !== 1) throw createError({ statusCode: 400, statusMessage: 'Invalid or expired reset token' })
    await tx.update(users).set({ passwordHash }).where(eq(users.id, reset.userId))
    await tx.delete(sessions).where(eq(sessions.userId, reset.userId))
    await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, reset.userId))
  })

  return { ok: true }
})
