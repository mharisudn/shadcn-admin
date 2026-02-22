import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core'
import { users } from './users'
import { categories } from './categories'

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 500 }).notNull().unique(),
  content: text('content').notNull(),
  excerpt: varchar('excerpt', { length: 500 }),
  status: varchar('status', { length: 20 }).notNull(), // draft, published
  categoryId: uuid('category_id').references(() => categories.id),
  featuredImageId: uuid('featured_image_id'),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  entityType: varchar('entity_type', { length: 20 }).notNull(), // yayasan, school
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const postTags = pgTable('post_tags', {
  postId: uuid('post_id').references(() => posts.id).notNull(),
  tagId: uuid('tag_id').references(() => tags.id).notNull(),
})
