import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth'
import { requirePermission } from '../middleware/rbac'
import * as schema from '../db/schema'
import { createDB } from '../db'
import { eq, desc, and, sql, isNull } from 'drizzle-orm'
import type { HonoEnv } from '../env.d'

const pages = new Hono<HonoEnv>()

// Validation schemas
const createPageSchema = z.object({
  title: z.string().min(5).max(500),
  slug: z.string().min(5).max(500),
  content: z.string().min(50),
  parentId: z.string().uuid().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  entityType: z.enum(['yayasan', 'school']).default('school'),
})

const updatePageSchema = createPageSchema.partial()

const listPagesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['draft', 'published']).optional(),
  entityType: z.enum(['yayasan', 'school']).optional(),
  parentId: z.string().uuid().optional(),
  search: z.string().optional(),
})

// List pages
pages.get('/', authMiddleware, zValidator('query', listPagesQuerySchema), async (c) => {
  const { page, limit, status, entityType, parentId, search } = c.req.valid('query')
  const db = createDB(c.env.DATABASE_URL)
  const user = c.get('user')

  const offset = (page - 1) * limit

  // Build conditions
  const conditions = []

  if (status) {
    conditions.push(eq(schema.pages.status, status))
  }

  if (entityType) {
    conditions.push(eq(schema.pages.entityType, entityType))
  }

  if (parentId === null || parentId === 'null') {
    conditions.push(isNull(schema.pages.parentId))
  } else if (parentId) {
    conditions.push(eq(schema.pages.parentId, parentId))
  }

  // Authors can only see their own drafts
  const userRole = user.role || 'author'
  if (userRole === 'author' && status === 'draft') {
    conditions.push(eq(schema.pages.authorId, user.sub))
  }

  // Search
  let whereClause = and(...conditions)
  if (search) {
    whereClause = sql`${whereClause} AND (${schema.pages.title} ILIKE ${`%${search}%`})`
  }

  // Get pages with pagination
  const [items, totalResult] = await Promise.all([
    db
      .select({
        id: schema.pages.id,
        title: schema.pages.title,
        slug: schema.pages.slug,
        status: schema.pages.status,
        entityType: schema.pages.entityType,
        parentId: schema.pages.parentId,
        createdAt: schema.pages.createdAt,
        updatedAt: schema.pages.updatedAt,
        author: {
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
        },
      })
      .from(schema.pages)
      .leftJoin(schema.users, eq(schema.pages.authorId, schema.users.id))
      .where(whereClause)
      .orderBy(desc(schema.pages.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.pages)
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

// Get single page
pages.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')
  const db = createDB(c.env.DATABASE_URL)

  const result = await db
    .select()
    .from(schema.pages)
    .where(eq(schema.pages.id, id))
    .limit(1)

  const [page] = result

  if (!page) {
    return c.json({ error: 'NOT_FOUND', message: 'Page not found' }, 404)
  }

  return c.json(page)
})

// Get page tree (nested structure)
pages.get('/tree', authMiddleware, async (c) => {
  const db = createDB(c.env.DATABASE_URL)
  const user = c.get('user')
  const entityType = c.req.query('entityType')

  const conditions = []
  if (entityType) {
    conditions.push(eq(schema.pages.entityType, entityType))
  }

  // Authors can only see their own drafts
  const userRole = user.role || 'author'
  if (userRole === 'author') {
    conditions.push(
      sql`(${schema.pages.status} = 'published' OR ${schema.pages.authorId} = ${user.sub})`
    )
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const allPages = await db
    .select({
      id: schema.pages.id,
      title: schema.pages.title,
      slug: schema.pages.slug,
      status: schema.pages.status,
      entityType: schema.pages.entityType,
      parentId: schema.pages.parentId,
      createdAt: schema.pages.createdAt,
      updatedAt: schema.pages.updatedAt,
    })
    .from(schema.pages)
    .where(whereClause)
    .orderBy(desc(schema.pages.createdAt))

  // Build tree structure
  interface PageNode {
    id: string
    title: string
    slug: string
    status: string
    entityType: string
    parentId: string | null
    createdAt: Date
    updatedAt: Date
    children?: PageNode[]
  }

  const buildTree = (parentId: string | null = null): PageNode[] => {
    return allPages
      .filter((page) => page.parentId === parentId)
      .map((page) => ({
        ...page,
        children: buildTree(page.id),
      }))
  }

  const tree = buildTree(null)

  return c.json(tree)
})

// Create page
pages.post(
  '/',
  authMiddleware,
  requirePermission('pages:create'),
  zValidator('json', createPageSchema),
  async (c) => {
    const data = c.req.valid('json')
    const db = createDB(c.env.DATABASE_URL)
    const user = c.get('user')

    // Check for duplicate slug
    const [existing] = await db
      .select()
      .from(schema.pages)
      .where(eq(schema.pages.slug, data.slug))
      .limit(1)

    if (existing) {
      return c.json({ error: 'DUPLICATE_SLUG', message: 'A page with this slug already exists' }, 409)
    }

    const result = await db
      .insert(schema.pages)
      .values({
        ...data,
        authorId: user.sub,
      })
      .returning()

    // Use type assertion to handle Drizzle ORM self-referential schema limitation
    const page = (result as any)[0]

    // Log activity
    await db.insert(schema.activities).values({
      userId: user.sub,
      action: 'create',
      entityType: 'page',
      entityId: page.id,
      metadata: { title: page.title },
    })

    return c.json(page, 201)
  }
)

// Update page
pages.put(
  '/:id',
  authMiddleware,
  requirePermission('pages:edit'),
  zValidator('json', updatePageSchema),
  async (c) => {
    const id = c.req.param('id')
    const data = c.req.valid('json')
    const db = createDB(c.env.DATABASE_URL)
    const user = c.get('user')

    // Check if page exists
    const [existing] = await db.select().from(schema.pages).where(eq(schema.pages.id, id)).limit(1)

    if (!existing) {
      return c.json({ error: 'NOT_FOUND', message: 'Page not found' }, 404)
    }

    // Check permissions (authors can only edit their own)
    const userRole = user.role || 'author'
    if (userRole === 'author' && existing.authorId !== user.sub) {
      return c.json({ error: 'FORBIDDEN', message: 'You can only edit your own pages' }, 403)
    }

    // Check for duplicate slug (if changing slug)
    if (data.slug && data.slug !== existing.slug) {
      const [duplicate] = await db
        .select()
        .from(schema.pages)
        .where(eq(schema.pages.slug, data.slug))
        .limit(1)

      if (duplicate) {
        return c.json({ error: 'DUPLICATE_SLUG', message: 'A page with this slug already exists' }, 409)
      }
    }

    // Prevent setting parent to self
    if (data.parentId === id) {
      return c.json({ error: 'INVALID_PARENT', message: 'A page cannot be its own parent' }, 400)
    }

    const result = await db
      .update(schema.pages)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.pages.id, id))
      .returning()

    const page = (result as any)[0]

    // Log activity
    await db.insert(schema.activities).values({
      userId: user.sub,
      action: 'update',
      entityType: 'page',
      entityId: page.id,
      metadata: { title: page.title },
    })

    return c.json(page)
  }
)

// Delete page
pages.delete('/:id', authMiddleware, requirePermission('pages:delete'), async (c) => {
  const id = c.req.param('id')
  const db = createDB(c.env.DATABASE_URL)
  const user = c.get('user')

  const [existing] = await db.select().from(schema.pages).where(eq(schema.pages.id, id)).limit(1)

  if (!existing) {
    return c.json({ error: 'NOT_FOUND', message: 'Page not found' }, 404)
  }

  await db.delete(schema.pages).where(eq(schema.pages.id, id))

  // Log activity
  await db.insert(schema.activities).values({
    userId: user.sub,
    action: 'delete',
    entityType: 'page',
    entityId: id,
    metadata: { title: existing.title },
  })

  return c.json({ success: true })
})

// Toggle publish status
pages.patch(
  '/:id/publish',
  authMiddleware,
  requirePermission('pages:edit'),
  async (c) => {
    const id = c.req.param('id')
    const db = createDB(c.env.DATABASE_URL)

    const [existing] = await db.select().from(schema.pages).where(eq(schema.pages.id, id)).limit(1)

    if (!existing) {
      return c.json({ error: 'NOT_FOUND', message: 'Page not found' }, 404)
    }

    const newStatus = existing.status === 'published' ? 'draft' : 'published'

    const result = await db
      .update(schema.pages)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(schema.pages.id, id))
      .returning()

    const page = (result as any)[0]

    return c.json(page)
  }
)

export { pages as pagesRouter }
