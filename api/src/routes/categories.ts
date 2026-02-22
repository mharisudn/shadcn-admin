import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth'
import { requirePermission } from '../middleware/rbac'
import * as schema from '../db/schema'
import { createDB } from '../db'
import { eq, desc, sql, count } from 'drizzle-orm'
import type { HonoEnv } from '../env.d'

const categories = new Hono<HonoEnv>()

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  description: z.string().optional(),
})

const updateCategorySchema = createCategorySchema.partial()

const listCategoriesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
})

// List categories with post counts
categories.get('/', authMiddleware, zValidator('query', listCategoriesQuerySchema), async (c) => {
  const { page, limit, search } = c.req.valid('query')
  const db = createDB(c.env.DATABASE_URL)

  const offset = (page - 1) * limit

  // Build search condition
  const whereClause = search ? sql`${schema.categories.name} ILIKE ${`%${search}%`}` : undefined

  // Get categories with pagination and post counts
  const [items, totalResult] = await Promise.all([
    db
      .select({
        id: schema.categories.id,
        name: schema.categories.name,
        slug: schema.categories.slug,
        description: schema.categories.description,
        createdAt: schema.categories.createdAt,
        updatedAt: schema.categories.updatedAt,
        postCount: count(schema.posts.id),
      })
      .from(schema.categories)
      .leftJoin(schema.posts, eq(schema.posts.categoryId, schema.categories.id))
      .where(whereClause)
      .groupBy(schema.categories.id)
      .orderBy(desc(schema.categories.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.categories)
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

// Get all categories (without pagination, for dropdowns)
categories.get('/all', authMiddleware, async (c) => {
  const db = createDB(c.env.DATABASE_URL)

  const items = await db
    .select({
      id: schema.categories.id,
      name: schema.categories.name,
      slug: schema.categories.slug,
      postCount: count(schema.posts.id),
    })
    .from(schema.categories)
    .leftJoin(schema.posts, eq(schema.posts.categoryId, schema.categories.id))
    .groupBy(schema.categories.id)
    .orderBy(schema.categories.name)

  return c.json({ items })
})

// Get single category
categories.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')
  const db = createDB(c.env.DATABASE_URL)

  const [category] = await db
    .select({
      id: schema.categories.id,
      name: schema.categories.name,
      slug: schema.categories.slug,
      description: schema.categories.description,
      createdAt: schema.categories.createdAt,
      updatedAt: schema.categories.updatedAt,
      postCount: count(schema.posts.id),
    })
    .from(schema.categories)
    .leftJoin(schema.posts, eq(schema.posts.categoryId, schema.categories.id))
    .where(eq(schema.categories.id, id))
    .groupBy(schema.categories.id)
    .limit(1)

  if (!category) {
    return c.json({ error: 'NOT_FOUND', message: 'Category not found' }, 404)
  }

  return c.json(category)
})

// Create category
categories.post(
  '/',
  authMiddleware,
  requirePermission('categories:manage'),
  zValidator('json', createCategorySchema),
  async (c) => {
    const data = c.req.valid('json')
    const db = createDB(c.env.DATABASE_URL)
    const user = c.get('user')

    // Check for duplicate slug
    const [existing] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.slug, data.slug))
      .limit(1)

    if (existing) {
      return c.json(
        { error: 'DUPLICATE_SLUG', message: 'A category with this slug already exists' },
        409
      )
    }

    // Check for duplicate name
    const [existingName] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.name, data.name))
      .limit(1)

    if (existingName) {
      return c.json(
        { error: 'DUPLICATE_NAME', message: 'A category with this name already exists' },
        409
      )
    }

    const [category] = await db.insert(schema.categories).values(data).returning()

    // Log activity
    await db.insert(schema.activities).values({
      userId: user.sub,
      action: 'create',
      entityType: 'category',
      entityId: category.id,
      metadata: { name: category.name },
    })

    return c.json(category, 201)
  }
)

// Update category
categories.put(
  '/:id',
  authMiddleware,
  requirePermission('categories:manage'),
  zValidator('json', updateCategorySchema),
  async (c) => {
    const id = c.req.param('id')
    const data = c.req.valid('json')
    const db = createDB(c.env.DATABASE_URL)
    const user = c.get('user')

    // Check if category exists
    const [existing] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, id))
      .limit(1)

    if (!existing) {
      return c.json({ error: 'NOT_FOUND', message: 'Category not found' }, 404)
    }

    // Check for duplicate slug (if changing slug)
    if (data.slug && data.slug !== existing.slug) {
      const [duplicate] = await db
        .select()
        .from(schema.categories)
        .where(eq(schema.categories.slug, data.slug))
        .limit(1)

      if (duplicate) {
        return c.json(
          { error: 'DUPLICATE_SLUG', message: 'A category with this slug already exists' },
          409
        )
      }
    }

    // Check for duplicate name (if changing name)
    if (data.name && data.name !== existing.name) {
      const [duplicateName] = await db
        .select()
        .from(schema.categories)
        .where(eq(schema.categories.name, data.name))
        .limit(1)

      if (duplicateName) {
        return c.json(
          { error: 'DUPLICATE_NAME', message: 'A category with this name already exists' },
          409
        )
      }
    }

    const [category] = await db
      .update(schema.categories)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.categories.id, id))
      .returning()

    // Log activity
    await db.insert(schema.activities).values({
      userId: user.sub,
      action: 'update',
      entityType: 'category',
      entityId: category.id,
      metadata: { name: category.name },
    })

    return c.json(category)
  }
)

// Delete category
categories.delete(
  '/:id',
  authMiddleware,
  requirePermission('categories:manage'),
  async (c) => {
    const id = c.req.param('id')
    const db = createDB(c.env.DATABASE_URL)
    const user = c.get('user')

    const [existing] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, id))
      .limit(1)

    if (!existing) {
      return c.json({ error: 'NOT_FOUND', message: 'Category not found' }, 404)
    }

    // Check if category has posts
    const [postsCount] = await db
      .select({ count: count() })
      .from(schema.posts)
      .where(eq(schema.posts.categoryId, id))

    if (postsCount && postsCount.count > 0) {
      return c.json(
        {
          error: 'CATEGORY_HAS_POSTS',
          message: 'Cannot delete category with associated posts',
          postCount: postsCount.count,
        },
        400
      )
    }

    await db.delete(schema.categories).where(eq(schema.categories.id, id))

    // Log activity
    await db.insert(schema.activities).values({
      userId: user.sub,
      action: 'delete',
      entityType: 'category',
      entityId: id,
      metadata: { name: existing.name },
    })

    return c.json({ success: true })
  }
)

export { categories as categoriesRouter }
