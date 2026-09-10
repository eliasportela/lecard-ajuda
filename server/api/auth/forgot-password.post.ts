import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { passwordResetTokens, users } from '../../database/schema'

const schema = z.object({ email: z.email() })
const response = { message: 'Se existir uma conta ativa com esse e-mail, enviaremos as instruções para redefinir a senha.' }

export default defineEventHandler(async event => {
  const input = schema.parse(await readBody(event))
  const email = input.email.toLowerCase()
  if (!allowPasswordResetRequest(event, email)) return response
  const [user] = await useDb().select({ id: users.id, email: users.email, name: users.name })
    .from(users).where(and(eq(users.email, email), eq(users.active, true))).limit(1)

  if (!user) return response

  const reset = createPasswordResetToken()
  await useDb().transaction(async tx => {
    await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id))
    await tx.insert(passwordResetTokens).values({ id: reset.id, userId: user.id, expiresAt: reset.expiresAt })
  })

  event.waitUntil(sendPasswordResetEmail(user, reset.token).catch(error => {
    console.error('Failed to send password reset email through Brevo', error)
  }))

  return response
})
