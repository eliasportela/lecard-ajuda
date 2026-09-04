export default defineEventHandler(async event => ({ user: await getCurrentUser(event) }))
