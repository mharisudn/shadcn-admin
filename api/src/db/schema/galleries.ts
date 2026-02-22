import { pgTable, uuid, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core'
import { media } from './media'

export const galleries = pgTable('galleries', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 500 }).notNull().unique(),
  description: text('description'),
  entityType: varchar('entity_type', { length: 20 }).notNull(), // yayasan, school
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const galleryMedia = pgTable('gallery_media', {
  id: uuid('id').primaryKey().defaultRandom(),
  galleryId: uuid('gallery_id').references(() => galleries.id).notNull(),
  mediaId: uuid('media_id').references(() => media.id).notNull(),
  order: integer('order').notNull().default(0),
})
