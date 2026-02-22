import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import * as schema from '../db/schema'
import { createDB } from '../db'
import { eq, sql, and, desc } from 'drizzle-orm'

import type { HonoEnv } from '../env'
const stats = new Hono<HonoEnv>()

// Get dashboard statistics
stats.get('/', authMiddleware, async (c) => {
  const db = createDB(c.env.DATABASE_URL)
  const user = c.get('user')
  const entityType = c.req.query('entityType') // 'yayasan' or 'school'

  const userRole = user.role || 'author'

  // Build conditions based on role and entity type
  const buildConditions = (tableName: any) => {
    const conditions = []

    if (entityType) {
      conditions.push(eq(tableName.entityType, entityType))
    }

    // Authors can only see their own content
    if (userRole === 'author') {
      conditions.push(eq(tableName.authorId, user.sub))
    }

    return conditions.length > 0 ? and(...conditions) : undefined
  }

  // Get all statistics in parallel
  const [
    totalPostsResult,
    publishedPostsResult,
    draftPostsResult,
    totalPagesResult,
    publishedPagesResult,
    draftPagesResult,
    totalCategoriesResult,
    totalMediaResult,
    recentPosts,
    recentPages,
  ] = await Promise.all([
    // Total posts
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.posts)
      .where(buildConditions(schema.posts)),

    // Published posts
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.posts)
      .where(
        and(
          eq(schema.posts.status, 'published'),
          entityType ? eq(schema.posts.entityType, entityType) : undefined,
          userRole === 'author' ? eq(schema.posts.authorId, user.sub) : undefined
        )
      ),

    // Draft posts
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.posts)
      .where(
        and(
          eq(schema.posts.status, 'draft'),
          entityType ? eq(schema.posts.entityType, entityType) : undefined,
          userRole === 'author' ? eq(schema.posts.authorId, user.sub) : undefined
        )
      ),

    // Total pages
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.pages)
      .where(buildConditions(schema.pages)),

    // Published pages
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.pages)
      .where(
        and(
          eq(schema.pages.status, 'published'),
          entityType ? eq(schema.pages.entityType, entityType) : undefined,
          userRole === 'author' ? eq(schema.pages.authorId, user.sub) : undefined
        )
      ),

    // Draft pages
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.pages)
      .where(
        and(
          eq(schema.pages.status, 'draft'),
          entityType ? eq(schema.pages.entityType, entityType) : undefined,
          userRole === 'author' ? eq(schema.pages.authorId, user.sub) : undefined
        )
      ),

    // Total categories (not filtered by user/role)
    db.select({ count: sql<number>`count(*)::int` }).from(schema.categories),

    // Total media (not filtered by user/role)
    db.select({ count: sql<number>`count(*)::int` }).from(schema.media),

    // Recent posts (last 5)
    db
      .select({
        id: schema.posts.id,
        title: schema.posts.title,
        status: schema.posts.status,
        entityType: schema.posts.entityType,
        createdAt: schema.posts.createdAt,
        author: {
          id: schema.users.id,
          name: schema.users.name,
        },
      })
      .from(schema.posts)
      .leftJoin(schema.users, eq(schema.posts.authorId, schema.users.id))
      .where(buildConditions(schema.posts))
      .orderBy(desc(schema.posts.createdAt))
      .limit(5),

    // Recent pages (last 5)
    db
      .select({
        id: schema.pages.id,
        title: schema.pages.title,
        status: schema.pages.status,
        entityType: schema.pages.entityType,
        createdAt: schema.pages.createdAt,
        author: {
          id: schema.users.id,
          name: schema.users.name,
        },
      })
      .from(schema.pages)
      .leftJoin(schema.users, eq(schema.pages.authorId, schema.users.id))
      .where(buildConditions(schema.pages))
      .orderBy(desc(schema.pages.createdAt))
      .limit(5),
  ])

  // Get post count by category
  const postsByCategoryResult = await db
    .select({
      id: schema.categories.id,
      name: schema.categories.name,
      slug: schema.categories.slug,
      postCount: sql<number>`count(${schema.posts.id})::int`,
    })
    .from(schema.categories)
    .leftJoin(schema.posts, eq(schema.posts.categoryId, schema.categories.id))
    .where(
      and(
        entityType ? eq(schema.posts.entityType, entityType) : undefined,
        userRole === 'author' ? eq(schema.posts.authorId, user.sub) : undefined
      )
    )
    .groupBy(schema.categories.id)
    .orderBy(desc(sql`count(${schema.posts.id})`))

  const totalPosts = totalPostsResult[0]?.count || 0
  const publishedPosts = publishedPostsResult[0]?.count || 0
  const draftPosts = draftPostsResult[0]?.count || 0
  const totalPages = totalPagesResult[0]?.count || 0
  const publishedPages = publishedPagesResult[0]?.count || 0
  const draftPages = draftPagesResult[0]?.count || 0
  const totalCategories = totalCategoriesResult[0]?.count || 0
  const totalMedia = totalMediaResult[0]?.count || 0

  return c.json({
    overview: {
      posts: {
        total: totalPosts,
        published: publishedPosts,
        draft: draftPosts,
      },
      pages: {
        total: totalPages,
        published: publishedPages,
        draft: draftPages,
      },
      categories: totalCategories,
      media: totalMedia,
    },
    postsByCategory: postsByCategoryResult,
    recentContent: {
      posts: recentPosts,
      pages: recentPages,
    },
  })
})

// Get activity feed
stats.get('/activity', authMiddleware, async (c) => {
  const db = createDB(c.env.DATABASE_URL)
  const user = c.get('user')
  const limit = parseInt(c.req.query('limit') || '20')

  const userRole = user.role || 'author'

  // Authors see only their activities, admins see all
  const activities = await db
    .select({
      id: schema.activities.id,
      action: schema.activities.action,
      entityType: schema.activities.entityType,
      entityId: schema.activities.entityId,
      metadata: schema.activities.metadata,
      createdAt: schema.activities.createdAt,
      user: {
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
      },
    })
    .from(schema.activities)
    .leftJoin(schema.users, eq(schema.activities.userId, schema.users.id))
    .where(userRole === 'author' ? eq(schema.activities.userId, user.sub) : undefined)
    .orderBy(desc(schema.activities.createdAt))
    .limit(limit)

  return c.json({ items: activities })
})

export { stats as statsRouter }
