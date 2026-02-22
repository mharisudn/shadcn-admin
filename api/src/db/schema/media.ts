import { pgTable, uuid, varchar, integer, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  filename: varchar('filename', { length: 500 }).notNull(),
  originalName: varchar('original_name', { length: 500 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  url: text('url').notNull(),
  bucket: varchar('bucket', { length: 100 }).notNull(),
  path: varchar('path', { length: 500 }).notNull(),
  altText: varchar('alt_text', { length: 500 }),
  caption: text('caption'),
  uploadedBy: uuid('uploaded_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
