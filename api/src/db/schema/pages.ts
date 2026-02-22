import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

// Create table with self-reference using function
export const pages = pgTable('pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 500 }).notNull().unique(),
  content: text('content').notNull(),
  status: varchar('status', { length: 20 }).notNull(), // draft, published
  parentId: uuid('parent_id').references((): any => pages.id, { onDelete: 'set null' }),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'restrict' }).notNull(),
  entityType: varchar('entity_type', { length: 20 }).notNull(), // yayasan, school
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
