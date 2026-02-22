import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth'
import { requirePermission } from '../middleware/rbac'
import * as schema from '../db/schema'
import { createDB } from '../db'
import { eq, desc, and, sql } from 'drizzle-orm'

const posts = new Hono()

// Validation schemas
const createPostSchema = z.object({
  title: z.string().min(5).max(500),
  slug: z.string().min(5).max(500),
  content: z.string().min(50),
  excerpt: z.string().max(500).optional(),
  categoryId: z.string().uuid().optional(),
  featuredImageId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  entityType: z.enum(['yayasan', 'school']).default('school'),
})

const updatePostSchema = createPostSchema.partial()

const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['draft', 'published']).optional(),
  entityType: z.enum(['yayasan', 'school']).optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
})

// List posts
posts.get('/', authMiddleware, zValidator('query', listPostsQuerySchema), async (c) => {
  const { page, limit, status, entityType, categoryId, search } = c.req.valid('query')
  const db = createDB(c.env.DATABASE_URL)
  const user = c.get('user')

  const offset = (page - 1) * limit

  // Build conditions
  const conditions = []

  if (status) {
    conditions.push(eq(schema.posts.status, status))
  }

  if (entityType) {
    conditions.push(eq(schema.posts.entityType, entityType))
  }

  if (categoryId) {
    conditions.push(eq(schema.posts.categoryId, categoryId))
  }

  // Authors can only see their own drafts
  const userRole = user.role || 'author'
  if (userRole === 'author' && status === 'draft') {
    conditions.push(eq(schema.posts.authorId, user.sub))
  }

  // Search
  let whereClause = and(...conditions)
  if (search) {
    whereClause = sql`${whereClause} AND (${schema.posts.title} ILIKE ${`%${search}%`} OR ${schema.posts.excerpt} ILIKE ${`%${search}%`})`
  }

  // Get posts with pagination
  const [items, totalResult] = await Promise.all([
    db
      .select({
        id: schema.posts.id,
        title: schema.posts.title,
        slug: schema.posts.slug,
        excerpt: schema.posts.excerpt,
        status: schema.posts.status,
        entityType: schema.posts.entityType,
        publishedAt: schema.posts.publishedAt,
        createdAt: schema.posts.createdAt,
        updatedAt: schema.posts.updatedAt,
        author: {
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
        },
        category: {
          id: schema.categories.id,
          name: schema.categories.name,
        },
      })
      .from(schema.posts)
      .leftJoin(schema.users, eq(schema.posts.authorId, schema.users.id))
      .leftJoin(schema.categories, eq(schema.posts.categoryId, schema.categories.id))
      .where(whereClause)
      .orderBy(desc(schema.posts.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.posts)
      .where(whereClause),
  ])

  const total = totalResult[0]?.count || 0

  return c.json({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
})

// Get single post
posts.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')
  const db = createDB(c.env.DATABASE_URL)

  const [post] = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.id, id))
    .limit(1)

  if (!post) {
    return c.json({ error: 'NOT_FOUND', message: 'Post not found' }, 404)
  }

  // Get tags
  const tags = await db
    .select({ id: schema.tags.id, name: schema.tags.name, slug: schema.tags.slug })
    .from(schema.postTags)
    .innerJoin(schema.tags, eq(schema.postTags.tagId, schema.tags.id))
    .where(eq(schema.postTags.postId, id))

  return c.json({ ...post, tags })
})

// Create post
posts.post(
  '/',
  authMiddleware,
  requirePermission('posts:create'),
  zValidator('json', createPostSchema),
  async (c) => {
    const data = c.req.valid('json')
    const db = createDB(c.env.DATABASE_URL)
    const user = c.get('user')

    // Check for duplicate slug
    const [existing] = await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.slug, data.slug))
      .limit(1)

    if (existing) {
      return c.json({ error: 'DUPLICATE_SLUG', message: 'A post with this slug already exists' }, 409)
    }

    // Set published_at if status is published
    const publishedAt = data.status === 'published' ? new Date() : null

    const [post] = await db
      .insert(schema.posts)
      .values({
        ...data,
        authorId: user.sub,
        publishedAt,
      })
      .returning()

    // Add tags if provided
    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        // Find or create tag
        const slug = tagName.toLowerCase().replace(/\s+/g, '-')
        let [tag] = await db.select().from(schema.tags).where(eq(schema.tags.slug, slug)).limit(1)

        if (!tag) {
          [tag] = await db.insert(schema.tags).values({ name: tagName, slug }).returning()
        }

        // Link tag to post
        await db.insert(schema.postTags).values({
          postId: post.id,
          tagId: tag.id,
        })
      }
    }

    // Log activity
    await db.insert(schema.activities).values({
      userId: user.sub,
      action: 'create',
      entityType: 'post',
      entityId: post.id,
      metadata: { title: post.title },
    })

    return c.json(post, 201)
  }
)

// Update post
posts.put(
  '/:id',
  authMiddleware,
  requirePermission('posts:edit'),
  zValidator('json', updatePostSchema),
  async (c) => {
    const id = c.req.param('id')
    const data = c.req.valid('json')
    const db = createDB(c.env.DATABASE_URL)
    const user = c.get('user')

    // Check if post exists
    const [existing] = await db.select().from(schema.posts).where(eq(schema.posts.id, id)).limit(1)

    if (!existing) {
      return c.json({ error: 'NOT_FOUND', message: 'Post not found' }, 404)
    }

    // Check permissions (authors can only edit their own)
    const userRole = user.role || 'author'
    if (userRole === 'author' && existing.authorId !== user.sub) {
      return c.json({ error: 'FORBIDDEN', message: 'You can only edit your own posts' }, 403)
    }

    // Check for duplicate slug (if changing slug)
    if (data.slug && data.slug !== existing.slug) {
      const [duplicate] = await db
        .select()
        .from(schema.posts)
        .where(eq(schema.posts.slug, data.slug))
        .limit(1)

      if (duplicate) {
        return c.json({ error: 'DUPLICATE_SLUG', message: 'A post with this slug already exists' }, 409)
      }
    }

    // Set published_at if status changed to published
    let publishedAt = existing.publishedAt
    if (data.status === 'published' && existing.status !== 'published') {
      publishedAt = new Date()
    }

    const [post] = await db
      .update(schema.posts)
      .set({
        ...data,
        publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(schema.posts.id, id))
      .returning()

    // Log activity
    await db.insert(schema.activities).values({
      userId: user.sub,
      action: 'update',
      entityType: 'post',
      entityId: post.id,
      metadata: { title: post.title },
    })

    return c.json(post)
  }
)

// Delete post
posts.delete('/:id', authMiddleware, requirePermission('posts:delete'), async (c) => {
  const id = c.req.param('id')
  const db = createDB(c.env.DATABASE_URL)
  const user = c.get('user')

  const [existing] = await db.select().from(schema.posts).where(eq(schema.posts.id, id)).limit(1)

  if (!existing) {
    return c.json({ error: 'NOT_FOUND', message: 'Post not found' }, 404)
  }

  await db.delete(schema.posts).where(eq(schema.posts.id, id))

  // Log activity
  await db.insert(schema.activities).values({
    userId: user.sub,
    action: 'delete',
    entityType: 'post',
    entityId: id,
    metadata: { title: existing.title },
  })

  return c.json({ success: true })
})

// Toggle publish status
posts.patch(
  '/:id/publish',
  authMiddleware,
  requirePermission('posts:publish'),
  async (c) => {
    const id = c.req.param('id')
    const db = createDB(c.env.DATABASE_URL)

    const [existing] = await db.select().from(schema.posts).where(eq(schema.posts.id, id)).limit(1)

    if (!existing) {
      return c.json({ error: 'NOT_FOUND', message: 'Post not found' }, 404)
    }

    const newStatus = existing.status === 'published' ? 'draft' : 'published'
    const publishedAt = newStatus === 'published' ? new Date() : null

    const [post] = await db
      .update(schema.posts)
      .set({
        status: newStatus,
        publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(schema.posts.id, id))
      .returning()

    return c.json(post)
  }
)

export { posts as postsRouter }
