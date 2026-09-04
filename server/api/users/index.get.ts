import { desc } from 'drizzle-orm'
import { users } from '../../database/schema'
export default defineEventHandler(async event => { await requireUser(event, 'ADMIN'); return useDb().select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt)) })
