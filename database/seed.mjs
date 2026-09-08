import { hash } from 'bcryptjs'
import mysql from 'mysql2/promise'

const url = process.env.NUXT_DATABASE_URL
const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD
const name = process.env.ADMIN_NAME ?? 'Administrador'

if (!url || !email || !password || password.length < 12) {
  throw new Error('Configure NUXT_DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD (minimum 12 characters)')
}

const connection = await mysql.createConnection(url)
try {
  const passwordHash = await hash(password, 12)
  await connection.execute(
    `INSERT INTO users (name, email, password_hash, role, active)
     VALUES (?, ?, ?, 'ADMIN', TRUE)
     ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = 'ADMIN', active = TRUE`,
    [name, email.toLowerCase(), passwordHash]
  )
  await connection.execute(
    `INSERT INTO spaces (name, slug, description, visibility)
     SELECT 'Lecard Ajuda', 'ajuda', 'Base de conhecimento Lecard', 'PUBLIC'
     WHERE NOT EXISTS (SELECT 1 FROM spaces WHERE slug = 'ajuda')`
  )
  await connection.execute(
    `INSERT INTO sections (space_id, title, slug, position)
     SELECT id, 'Primeiros passos', 'primeiros-passos', 0 FROM spaces
     WHERE slug = 'ajuda' AND NOT EXISTS (SELECT 1 FROM sections WHERE slug = 'primeiros-passos')`
  )
  console.log(`Administrador ${email.toLowerCase()} e estrutura inicial configurados.`)
} finally {
  await connection.end()
}
