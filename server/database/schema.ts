import { bigint, boolean, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/mysql-core'

export const users = mysqlTable('users', {
  id: bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  email: varchar('email', { length: 190 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['ADMIN', 'EDITOR']).notNull().default('EDITOR'),
  active: boolean('active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
}, table => [uniqueIndex('users_email_unique').on(table.email)])

export const sessions = mysqlTable('sessions', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: bigint('user_id', { mode: 'number', unsigned: true }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const spaces = mysqlTable('spaces', {
  id: bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  slug: varchar('slug', { length: 140 }).notNull(),
  description: text('description'),
  visibility: mysqlEnum('visibility', ['PUBLIC', 'PRIVATE']).notNull().default('PUBLIC'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
}, table => [uniqueIndex('spaces_slug_unique').on(table.slug)])

export const sections = mysqlTable('sections', {
  id: bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
  spaceId: bigint('space_id', { mode: 'number', unsigned: true }).notNull().references(() => spaces.id, { onDelete: 'cascade' }),
  parentId: bigint('parent_id', { mode: 'number', unsigned: true }),
  title: varchar('title', { length: 160 }).notNull(),
  slug: varchar('slug', { length: 180 }).notNull(),
  position: int('position').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
})

export const articles = mysqlTable('articles', {
  id: bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
  spaceId: bigint('space_id', { mode: 'number', unsigned: true }).notNull().references(() => spaces.id, { onDelete: 'cascade' }),
  sectionId: bigint('section_id', { mode: 'number', unsigned: true }).notNull().references(() => sections.id),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 220 }).notNull(),
  summary: text('summary'),
  markdown: text('markdown').notNull(),
  status: mysqlEnum('status', ['DRAFT', 'PUBLISHED', 'ARCHIVED']).notNull().default('DRAFT'),
  position: int('position').notNull().default(0),
  authorId: bigint('author_id', { mode: 'number', unsigned: true }).notNull().references(() => users.id),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
}, table => [uniqueIndex('articles_space_slug_unique').on(table.spaceId, table.slug)])

export const attachments = mysqlTable('attachments', {
  id: bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
  articleId: bigint('article_id', { mode: 'number', unsigned: true }).references(() => articles.id, { onDelete: 'set null' }),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  storageKey: varchar('storage_key', { length: 500 }).notNull(),
  mimeType: varchar('mime_type', { length: 120 }).notNull(),
  size: int('size', { unsigned: true }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
})
