# CMS Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Build a complete Content Management System for managing blog articles, static pages, media files, and photo galleries for Yayasan Pendidikan Assurur & SDQu Assurur websites.

**Architecture:** Monolithic Hono API on Cloudflare Workers with Neon Postgres (Drizzle ORM) and Cloudflare R2 for media storage. Frontend uses React 19 with TanStack Query for server state management.

**Tech Stack:** Hono, Drizzle ORM, Neon Postgres, Cloudflare R2/KV, React 19, TanStack Router, TanStack Query, TipTap, Supabase Auth

---

# Phase 1: Foundation - Hono API & Database Setup

## Task 1: Create Hono Project Structure

**Files:**
- Create: `api/package.json`
- Create: `api/tsconfig.json`
- Create: `api/wrangler.toml`
- Create: `api/src/index.ts`
- Create: `api/src/app.ts`

**Step 1: Create package.json**

Write to `api/package.json`:

```json
{
  "name": "assurur-cms-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "@hono/zod-validator": "^0.2.0",
    "drizzle-orm": "^0.29.0",
    "@neondatabase/serverless": "^0.9.0",
    "zod": "^3.22.0",
    "jose": "^5.2.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20231218.0",
    "drizzle-kit": "^0.20.0",
    "typescript": "^5.3.0",
    "wrangler": "^3.0.0"
  }
}
```

**Step 2: Create tsconfig.json**

Write to `api/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "types": ["@cloudflare/workers-types"],
    "resolveJsonModule": true,
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

**Step 3: Create wrangler.toml**

Write to `api/wrangler.toml`:

```toml
name = "assurur-cms-api"
main = "src/index.ts"
compatibility_date = "2024-02-01"

[env.dev]
name = "assurur-cms-api-dev"

[[env.dev.d1_databases]]
binding = "DB"
database_name = "assurur-cms-dev"
database_id = "<your-database-id>"

[[env.dev.r2_buckets]]
binding = "MEDIA"
bucket_name = "assurur-media-dev"

[[env.dev.kv_namespaces]]
binding = "CACHE"
id = "<your-kv-id>"

[env.production]
name = "assurur-cms-api"

[[env.production.d1_databases]]
binding = "DB"
database_name = "assurur-cms-prod"
database_id = "<your-production-database-id>"

[[env.production.r2_buckets]]
binding = "MEDIA"
bucket_name = "assurur-media-prod"

[[env.production.kv_namespaces]]
binding = "CACHE"
id = "<your-production-kv-id>"
```

**Step 4: Create main entry point**

Write to `api/src/index.ts`:

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { errorHandler } from './middleware/error-handler'
import { authMiddleware } from './middleware/auth'
import { cmsRouter } from './routes/cms'

type Bindings = {
  DB: D1Database
  MEDIA: R2Bucket
  CACHE: KVNamespace
  DATABASE_URL: string
  SUPABASE_JWKS_URL: string
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Global middleware
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://admin.assurur.com'],
  credentials: true,
}))

// Health check
app.get('/', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Error handler (must be after routes but we'll add it last)
app.onError(errorHandler)

// API routes
app.route('/api/cms', cmsRouter)

export default app
```

**Step 5: Create app factory**

Write to `api/src/app.ts`:

```typescript
import { Hono } from 'hono'
import type { Bindings } from './index'

export function createApp() {
  const app = new Hono<{ Bindings: Bindings }>()

  // Register routes here
  return app
}
```

**Step 6: Commit**

```bash
git add api/
git commit -m "feat: initialize Hono API project structure

- Set up package.json with dependencies
- Configure TypeScript for Cloudflare Workers
- Add wrangler.toml for dev/prod environments
- Create main entry point with middleware stack"
```

---

## Task 2: Configure Drizzle ORM

**Files:**
- Create: `api/src/db/schema/index.ts`
- Create: `api/src/db/schema/users.ts`
- Create: `api/src/db/schema/posts.ts`
- Create: `api/src/db/schema/pages.ts`
- Create: `api/src/db/schema/categories.ts`
- Create: `api/src/db/schema/media.ts`
- Create: `api/src/db/schema/galleries.ts`
- Create: `api/src/db/schema/activities.ts`
- Create: `api/drizzle.config.ts`
- Create: `api/src/db/index.ts`

**Step 1: Create users schema**

Write to `api/src/db/schema/users.ts`:

```typescript
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(), // admin, editor, author
  permissions: varchar('permissions', { length: 500 }).notNull(), // JSON string
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  roleId: uuid('role_id').references(() => roles.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
```

**Step 2: Create posts schema**

Write to `api/src/db/schema/posts.ts`:

```typescript
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
```

**Step 3: Create categories schema**

Write to `api/src/db/schema/categories.ts`:

```typescript
import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
```

**Step 4: Create pages schema**

Write to `api/src/db/schema/pages.ts`:

```typescript
import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const pages = pgTable('pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 500 }).notNull().unique(),
  content: text('content').notNull(),
  status: varchar('status', { length: 20 }).notNull(), // draft, published
  parentId: uuid('parent_id'),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  entityType: varchar('entity_type', { length: 20 }).notNull(), // yayasan, school
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
```

**Step 5: Create media schema**

Write to `api/src/db/schema/media.ts`:

```typescript
import { pgTable, uuid, varchar, integer, text, timestamp } from 'drizzle-orm/pg-core'

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
  uploadedBy: uuid('uploaded_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
```

**Step 6: Create galleries schema**

Write to `api/src/db/schema/galleries.ts`:

```typescript
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
```

**Step 7: Create activities schema (audit log)**

Write to `api/src/db/schema/activities.ts`:

```typescript
import { pgTable, uuid, varchar, text, jsonb, timestamp } from 'drizzle-orm/pg-core'

export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  action: varchar('action', { length: 50 }).notNull(), // create, update, delete
  entityType: varchar('entity_type', { length: 50 }).notNull(), // post, page, media
  entityId: uuid('entity_id').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

**Step 8: Create schema index**

Write to `api/src/db/schema/index.ts`:

```typescript
export * from './users'
export * from './posts'
export * from './pages'
export * from './categories'
export * from './media'
export * from './galleries'
export * from './activities'
```

**Step 9: Create Drizzle config**

Write to `api/drizzle.config.ts`:

```typescript
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config
```

**Step 10: Create database client**

Write to `api/src/db/index.ts`:

```typescript
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

export function createDB(databaseUrl: string) {
  const sql = neon(databaseUrl)
  return drizzle(sql, { schema })
}
```

**Step 11: Commit**

```bash
git add api/src/db/ api/drizzle.config.ts api/src/db/index.ts
git commit -m "feat: add Drizzle ORM schemas

- Define users and roles tables
- Define posts, pages, categories, tags schemas
- Define media and galleries schemas
- Add activities audit log table
- Configure Drizzle Kit for migrations"
```

---

## Task 3: Create Database Migrations

**Files:**
- Create: `api/src/db/migrations/0001_initial.sql`

**Step 1: Generate migration**

```bash
cd api
bun install
bunx drizzle-kit generate
```

**Expected output:** Creates `drizzle/0001_xxx.sql` with all CREATE TABLE statements

**Step 2: Review generated migration**

The migration should include:
- `CREATE TABLE roles`
- `CREATE TABLE users`
- `CREATE TABLE posts`
- `CREATE TABLE pages`
- `CREATE TABLE categories`
- `CREATE TABLE tags`
- `CREATE TABLE post_tags`
- `CREATE TABLE media`
- `CREATE TABLE galleries`
- `CREATE TABLE gallery_media`
- `CREATE TABLE activities`
- `CREATE INDEX` statements for performance

**Step 3: Add indexes manually**

Edit the generated migration file to add these indexes at the end:

```sql
-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_entity ON posts(entity_type);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(mime_type);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_entity ON pages(entity_type);
```

**Step 4: Push migration to database**

```bash
bunx drizzle-kit push
```

**Expected output:** `Successfully pushed schema changes to database`

**Step 5: Commit**

```bash
git add api/drizzle/
git commit -m "feat: generate initial database migration

- Create all CMS tables
- Add performance indexes
- Ready for local development"
```

---

## Task 4: Implement Authentication Middleware

**Files:**
- Create: `api/src/middleware/auth.ts`
- Create: `api/src/lib/jwt.ts`

**Step 1: Create JWT utilities**

Write to `api/src/lib/jwt.ts`:

```typescript
import { jwtVerify, type JWTPayload } from 'jose'

export interface DecodedToken extends JWTPayload {
  sub: string // user_id
  email: string
  role: string
}

export async function verifySupabaseToken(
  token: string,
  jwksUrl: string,
  jwtSecret: string
): Promise<DecodedToken | null> {
  try {
    // Verify JWT with Supabase JWKS
    const { payload } = await jwtVerify(
      token,
      async () => new TextEncoder().encode(jwtSecret),
      {
        issuer: 'https://supabase.com',
      }
    )

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
      ...payload,
    }
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}
```

**Step 2: Create auth middleware**

Write to `api/src/middleware/auth.ts`:

```typescript
import { Context, Next } from 'hono'
import type { DecodedToken } from '../lib/jwt'

declare module 'hono' {
  interface ContextVariableMap {
    user: DecodedToken
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' }, 401)
  }

  const token = authHeader.substring(7)
  const jwksUrl = c.env.SUPABASE_JWKS_URL
  const jwtSecret = c.env.JWT_SECRET

  const decoded = await verifySupabaseToken(token, jwksUrl, jwtSecret)

  if (!decoded) {
    return c.json({ error: 'UNAUTHORIZED', message: 'Invalid or expired token' }, 401)
  }

  c.set('user', decoded)
  await next()
}
```

**Step 3: Create RBAC middleware**

Write to `api/src/middleware/rbac.ts`:

```typescript
import { Context, Next } from 'hono'
import type { DecodedToken } from '../lib/jwt'

type Permission =
  | 'posts:create'
  | 'posts:edit'
  | 'posts:delete'
  | 'posts:publish'
  | 'pages:create'
  | 'pages:edit'
  | 'pages:delete'
  | 'categories:manage'
  | 'media:upload'
  | 'media:delete'
  | 'galleries:manage'
  | 'users:manage'

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    'posts:create',
    'posts:edit',
    'posts:delete',
    'posts:publish',
    'pages:create',
    'pages:edit',
    'pages:delete',
    'categories:manage',
    'media:upload',
    'media:delete',
    'galleries:manage',
    'users:manage',
  ],
  editor: [
    'posts:create',
    'posts:edit',
    'posts:publish',
    'pages:create',
    'pages:edit',
    'media:upload',
    'media:delete',
    'galleries:manage',
  ],
  author: ['posts:create', 'posts:edit', 'media:upload', 'galleries:manage'],
}

export function requirePermission(...permissions: Permission[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as DecodedToken
    const userRole = user.role || 'author' // default to least privileged

    const userPermissions = ROLE_PERMISSIONS[userRole] || []

    const hasPermission = permissions.some((p) => userPermissions.includes(p))

    if (!hasPermission) {
      return c.json(
        { error: 'FORBIDDEN', message: 'You do not have permission to perform this action' },
        403
      )
    }

    await next()
  }
}
```

**Step 4: Create error handler middleware**

Write to `api/src/middleware/error-handler.ts`:

```typescript
import type { ErrorHandler } from 'hono'

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('Error:', err)

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return c.json({ error: 'VALIDATION_ERROR', message: err.message }, 400)
  }

  if (err.name === 'NotFoundError') {
    return c.json({ error: 'NOT_FOUND', message: err.message }, 404)
  }

  // Generic error
  return c.json({ error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }, 500)
}
```

**Step 5: Commit**

```bash
git add api/src/middleware/ api/src/lib/jwt.ts
git commit -m "feat: implement auth and RBAC middleware

- Add JWT verification for Supabase tokens
- Create auth middleware for protected routes
- Implement role-based access control (Admin, Editor, Author)
- Add error handler for standardized responses"
```

---

## Task 5: Set Up R2 Media Upload

**Files:**
- Create: `api/src/lib/r2.ts`
- Create: `api/src/routes/media.ts`

**Step 1: Create R2 utilities**

Write to `api/src/lib/r2.ts`:

```typescript
import type { R2Bucket } from '@cloudflare/workers-types'

export interface UploadResult {
  key: string
  url: string
  etag: string
}

export async function uploadToR2(
  bucket: R2Bucket,
  file: File,
  path: string
): Promise<UploadResult> {
  const key = `${path}/${Date.now()}-${file.name}`

  const result = await bucket.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  })

  if (!result) {
    throw new Error('UPLOAD_FAILED')
  }

  return {
    key,
    url: `https://cdn.assurur.com/${key}`, // Use your R2 custom domain
    etag: result.etag,
  }
}

export async function deleteFromR2(bucket: R2Bucket, key: string): Promise<void> {
  await bucket.delete(key)
}

export function generatePresignedUrl(bucket: R2Bucket, key: string, expiresIn: number = 3600): string {
  // Cloudflare R2 presigned URLs
  // For now, return the upload URL endpoint
  return `/api/cms/media/upload-url?key=${key}&expires=${expiresIn}`
}
```

**Step 2: Create media routes (upload only for now)**

Write to `api/src/routes/media.ts`:

```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth'
import { requirePermission } from '../middleware/rbac'
import { uploadToR2, deleteFromR2 } from '../lib/r2'
import * as schema from '../db/schema'
import { createDB } from '../db'

const media = new Hono()

// Get presigned URL for upload
media.post(
  '/upload-url',
  authMiddleware,
  requirePermission('media:upload'),
  zValidator(
    'json',
    z.object({
      filename: z.string(),
      contentType: z.string(),
    })
  ),
  async (c) => {
    const { filename, contentType } = c.req.valid('json')

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(contentType)) {
      return c.json({ error: 'VALIDATION_ERROR', message: 'Invalid file type' }, 400)
    }

    // Generate unique key
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const key = `uploads/images/${year}/${month}/${Date.now()}-${filename}`

    // For direct upload to R2, we'd use presigned URLs
    // For now, we'll return the key for multipart upload
    return c.json({
      key,
      uploadUrl: `/api/cms/media/upload`,
    })
  }
)

// Upload file (multipart form data)
media.post('/upload', authMiddleware, requirePermission('media:upload'), async (c) => {
  const body = await c.req.parseBody()
  const file = body.file as File

  if (!file) {
    return c.json({ error: 'VALIDATION_ERROR', message: 'No file provided' }, 400)
  }

  // Validate file size (5MB max for images)
  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    return c.json({ error: 'VALIDATION_ERROR', message: 'File too large (max 5MB)' }, 400)
  }

  try {
    const result = await uploadToR2(c.env.MEDIA, file, 'uploads/images')

    // Save to database
    const db = createDB(c.env.DATABASE_URL)
    const [mediaRecord] = await db
      .insert(schema.media)
      .values({
        filename: result.key,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: result.url,
        bucket: c.env.MEDIA.name,
        path: result.key,
        uploadedBy: c.get('user').sub,
      })
      .returning()

    return c.json(mediaRecord, 201)
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: 'UPLOAD_FAILED', message: 'Failed to upload file' }, 500)
  }
})

export { media as mediaRouter }
```

**Step 3: Commit**

```bash
git add api/src/lib/r2.ts api/src/routes/media.ts
git commit -m "feat: add R2 media upload functionality

- Implement upload to Cloudflare R2
- Add file validation (type, size)
- Create media upload endpoint
- Save metadata to database"
```

---

## Task 6: Create Posts API Endpoints

**Files:**
- Create: `api/src/routes/posts.ts`

**Step 1: Create posts router with validation schemas**

Write to `api/src/routes/posts.ts`:

```typescript
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
```

**Step 2: Commit**

```bash
git add api/src/routes/posts.ts
git commit -m "feat: implement posts CRUD endpoints

- Add list endpoint with pagination, filters, search
- Add create, update, delete operations
- Implement RBAC checks (author can only edit own posts)
- Add tag association
- Include activity logging
- Add publish toggle endpoint"
```

---

## Task 7: Create Pages API Endpoints

**Files:**
- Create: `api/src/routes/pages.ts`

**Step 1: Create pages router**

Write to `api/src/routes/pages.ts`:

```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth'
import { requirePermission } from '../middleware/rbac'
import * as schema from '../db/schema'
import { createDB } from '../db'
import { eq, desc, and } from 'drizzle-orm'

const pages = new Hono()

const createPageSchema = z.object({
  title: z.string().min(5).max(500),
  slug: z.string().min(5).max(500),
  content: z.string().min(50),
  status: z.enum(['draft', 'published']).default('draft'),
  parentId: z.string().uuid().optional(),
  entityType: z.enum(['yayasan', 'school']).default('school'),
})

const updatePageSchema = createPageSchema.partial()

const listPagesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['draft', 'published']).optional(),
  entityType: z.enum(['yayasan', 'school']).optional(),
  parentId: z.string().uuid().optional(),
})

// List pages
pages.get('/', authMiddleware, zValidator('query', listPagesQuerySchema), async (c) => {
  const { page, limit, status, entityType, parentId } = c.req.valid('query')
  const db = createDB(c.env.DATABASE_URL)

  const offset = (page - 1) * limit

  const conditions = []
  if (status) conditions.push(eq(schema.pages.status, status))
  if (entityType) conditions.push(eq(schema.pages.entityType, entityType))
  if (parentId) conditions.push(eq(schema.pages.parentId, parentId))

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
        },
      })
      .from(schema.pages)
      .leftJoin(schema.users, eq(schema.pages.authorId, schema.users.id))
      .where(and(...conditions))
      .orderBy(desc(schema.pages.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.pages).where(and(...conditions)),
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

  const [page] = await db.select().from(schema.pages).where(eq(schema.pages.id, id)).limit(1)

  if (!page) {
    return c.json({ error: 'NOT_FOUND', message: 'Page not found' }, 404)
  }

  return c.json(page)
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

    const [existing] = await db.select().from(schema.pages).where(eq(schema.pages.slug, data.slug)).limit(1)

    if (existing) {
      return c.json({ error: 'DUPLICATE_SLUG', message: 'A page with this slug already exists' }, 409)
    }

    const [page] = await db
      .insert(schema.pages)
      .values({
        ...data,
        authorId: user.sub,
      })
      .returning()

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

    const [existing] = await db.select().from(schema.pages).where(eq(schema.pages.id, id)).limit(1)

    if (!existing) {
      return c.json({ error: 'NOT_FOUND', message: 'Page not found' }, 404)
    }

    const [page] = await db
      .update(schema.pages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.pages.id, id))
      .returning()

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

  await db.insert(schema.activities).values({
    userId: user.sub,
    action: 'delete',
    entityType: 'page',
    entityId: id,
    metadata: { title: existing.title },
  })

  return c.json({ success: true })
})

export { pages as pagesRouter }
```

**Step 2: Commit**

```bash
git add api/src/routes/pages.ts
git commit -m "feat: implement pages CRUD endpoints

- Add list, create, update, delete operations
- Support nested pages via parentId
- Implement RBAC checks
- Add activity logging"
```

---

## Task 8: Create Categories API Endpoints

**Files:**
- Create: `api/src/routes/categories.ts`

**Step 1: Create categories router**

Write to `api/src/routes/categories.ts`:

```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth'
import { requirePermission } from '../middleware/rbac'
import * as schema from '../db/schema'
import { createDB } from '../db'
import { eq, desc } from 'drizzle-orm'

const categories = new Hono()

const createCategorySchema = z.object({
  name: z.string().min(3).max(100),
  slug: z.string().min(3).max(100),
  description: z.string().optional(),
})

const updateCategorySchema = createCategorySchema.partial()

// List categories
categories.get('/', authMiddleware, async (c) => {
  const db = createDB(c.env.DATABASE_URL)

  const items = await db
    .select({
      id: schema.categories.id,
      name: schema.categories.name,
      slug: schema.categories.slug,
      description: schema.categories.description,
      createdAt: schema.categories.createdAt,
      updatedAt: schema.categories.updatedAt,
      _count: {
        posts: sql<number>`(SELECT count(*) FROM ${schema.posts} WHERE ${schema.posts.categoryId} = ${schema.categories.id})`,
      },
    })
    .from(schema.categories)
    .orderBy(desc(schema.categories.createdAt))

  return c.json({ items })
})

// Get single category
categories.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')
  const db = createDB(c.env.DATABASE_URL)

  const [category] = await db.select().from(schema.categories).where(eq(schema.categories.id, id)).limit(1)

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

    const [existing] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.slug, data.slug))
      .limit(1)

    if (existing) {
      return c.json({ error: 'DUPLICATE_SLUG', message: 'A category with this slug already exists' }, 409)
    }

    const [category] = await db.insert(schema.categories).values(data).returning()

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

    const [existing] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, id))
      .limit(1)

    if (!existing) {
      return c.json({ error: 'NOT_FOUND', message: 'Category not found' }, 404)
    }

    const [category] = await db
      .update(schema.categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.categories.id, id))
      .returning()

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

    const [existing] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, id))
      .limit(1)

    if (!existing) {
      return c.json({ error: 'NOT_FOUND', message: 'Category not found' }, 404)
    }

    await db.delete(schema.categories).where(eq(schema.categories.id, id))

    return c.json({ success: true })
  }
)

export { categories as categoriesRouter }
```

**Step 2: Import sql helper**

The above file uses `sql` which needs to be imported. Add this import to the file:

```typescript
import { sql } from 'drizzle-orm'
```

**Step 3: Commit**

```bash
git add api/src/routes/categories.ts
git commit -m "feat: implement categories CRUD endpoints

- Add list with post counts
- Add create, update, delete operations
- Admin-only access via RBAC
- Include duplicate slug check"
```

---

## Task 9: Create Stats API Endpoint

**Files:**
- Create: `api/src/routes/stats.ts`

**Step 1: Create stats router**

Write to `api/src/routes/stats.ts`:

```typescript
import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import * as schema from '../db/schema'
import { createDB } from '../db'
import { sql, eq, and } from 'drizzle-orm'

const stats = new Hono()

// Get dashboard statistics
stats.get('/', authMiddleware, async (c) => {
  const db = createDB(c.env.DATABASE_URL)
  const user = c.get('user')

  const userRole = user.role || 'author'

  // Build conditions based on role
  const authorCondition = userRole === 'author' ? eq(schema.posts.authorId, user.sub) : sql``

  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    totalMedia,
    totalCategories,
    totalGalleries,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.posts)
      .where(authorCondition),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.posts)
      .where(and(eq(schema.posts.status, 'published'), authorCondition)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.posts)
      .where(and(eq(schema.posts.status, 'draft'), authorCondition)),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.media),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.categories),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.galleries),
  ])

  return c.json({
    totalPosts: totalPosts[0]?.count || 0,
    publishedPosts: publishedPosts[0]?.count || 0,
    draftPosts: draftPosts[0]?.count || 0,
    totalMedia: totalMedia[0]?.count || 0,
    totalCategories: totalCategories[0]?.count || 0,
    totalGalleries: totalGalleries[0]?.count || 0,
  })
})

export { stats as statsRouter }
```

**Step 2: Commit**

```bash
git add api/src/routes/stats.ts
git commit -m "feat: add dashboard stats endpoint

- Return total, published, and draft post counts
- Include media, categories, galleries counts
- Filter by user role (authors see own posts only)"
```

---

## Task 10: Register All Routes in Main App

**Files:**
- Modify: `api/src/index.ts`
- Modify: `api/src/routes/cms.ts` (create this file)

**Step 1: Create CMS route aggregator**

Write to `api/src/routes/cms.ts`:

```typescript
import { Hono } from 'hono'
import { postsRouter } from './posts'
import { pagesRouter } from './pages'
import { categoriesRouter } from './categories'
import { mediaRouter } from './media'
import { statsRouter } from './stats'

const cms = new Hono()

cms.route('/posts', postsRouter)
cms.route('/pages', pagesRouter)
cms.route('/categories', categoriesRouter)
cms.route('/media', mediaRouter)
cms.route('/stats', statsRouter)

export { cms as cmsRouter }
```

**Step 2: Update main index to import sql**

Modify `api/src/index.ts` to ensure all routes are properly exported:

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { cmsRouter } from './routes/cms'

type Bindings = {
  DB: D1Database
  MEDIA: R2Bucket
  CACHE: KVNamespace
  DATABASE_URL: string
  SUPABASE_JWKS_URL: string
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Global middleware
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://admin.assurur.com'],
  credentials: true,
}))

// Health check
app.get('/', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// API routes
app.route('/api/cms', cmsRouter)

export default app
```

**Step 3: Commit**

```bash
git add api/src/index.ts api/src/routes/cms.ts
git commit -m "feat: register all CMS routes in main app

- Aggregate all routers under /api/cms
- Configure CORS for admin dashboard
- Add health check endpoint"
```

---

# Phase 2: Frontend API Client Integration

## Task 11: Create API Client

**Files:**
- Create: `src/lib/api/client.ts`
- Create: `src/lib/api/types.ts`
- Create: `src/lib/api/endpoints/cms.ts`

**Step 1: Create API types**

Write to `src/lib/api/types.ts`:

```typescript
// Common types
export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  error: string
  message: string
  details?: unknown
}

// User types
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'author'
}

// Post types
export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  status: 'draft' | 'published'
  categoryId: string | null
  featuredImageId: string | null
  authorId: string
  entityType: 'yayasan' | 'school'
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  author?: User
  category?: Category
  tags?: Tag[]
}

export interface CreatePostInput {
  title: string
  slug: string
  content: string
  excerpt?: string
  categoryId?: string
  featuredImageId?: string
  tags?: string[]
  status?: 'draft' | 'published'
  entityType?: 'yayasan' | 'school'
}

export interface UpdatePostInput extends Partial<CreatePostInput> {}

export interface ListPostsQuery {
  page?: number
  limit?: number
  status?: 'draft' | 'published'
  entityType?: 'yayasan' | 'school'
  categoryId?: string
  search?: string
}

// Page types
export interface Page {
  id: string
  title: string
  slug: string
  content: string
  status: 'draft' | 'published'
  parentId: string | null
  authorId: string
  entityType: 'yayasan' | 'school'
  createdAt: string
  updatedAt: string
  author?: User
}

export interface CreatePageInput {
  title: string
  slug: string
  content: string
  status?: 'draft' | 'published'
  parentId?: string
  entityType?: 'yayasan' | 'school'
}

export interface UpdatePageInput extends Partial<CreatePageInput> {}

export interface ListPagesQuery {
  page?: number
  limit?: number
  status?: 'draft' | 'published'
  entityType?: 'yayasan' | 'school'
  parentId?: string
}

// Category types
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    posts: number
  }
}

export interface CreateCategoryInput {
  name: string
  slug: string
  description?: string
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}

// Media types
export interface Media {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  bucket: string
  path: string
  altText: string | null
  caption: string | null
  uploadedBy: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateMediaInput {
  altText?: string
  caption?: string
}

export interface ListMediaQuery {
  page?: number
  limit?: number
  search?: string
  mimeType?: string
}

// Gallery types
export interface Gallery {
  id: string
  title: string
  slug: string
  description: string | null
  entityType: 'yayasan' | 'school'
  createdAt: string
  updatedAt: string
}

export interface CreateGalleryInput {
  title: string
  slug: string
  description?: string
  entityType?: 'yayasan' | 'school'
}

// Stats types
export interface CmsStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalMedia: number
  totalCategories: number
  totalGalleries: number
}

// Tag types
export interface Tag {
  id: string
  name: string
  slug: string
}
```

**Step 2: Create API client**

Write to `src/lib/api/client.ts`:

```typescript
import axios, { type AxiosError } from 'axios'
import type { ApiError } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/cms`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  // Get token from Supabase session (you'll need to implement this)
  const token = localStorage.getItem('supabase-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      window.location.href = '/sign-in'
    }
    return Promise.reject(error)
  }
)

export function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError<ApiError>(error) && error.response?.data) {
    return error.response.data
  }
  return {
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  }
}
```

**Step 3: Create CMS endpoints**

Write to `src/lib/api/endpoints/cms.ts`:

```typescript
import { apiClient } from '../client'
import type {
  Post,
  CreatePostInput,
  UpdatePostInput,
  ListPostsQuery,
  PaginatedResponse,
  Page,
  CreatePageInput,
  UpdatePageInput,
  ListPagesQuery,
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  Media,
  CmsStats,
} from '../types'

// Posts
export const postsApi = {
  list: (query?: ListPostsQuery) =>
    apiClient.get<PaginatedResponse<Post>>('/posts', { params: query }),

  get: (id: string) => apiClient.get<Post>(`/posts/${id}`),

  create: (data: CreatePostInput) => apiClient.post<Post>('/posts', data),

  update: (id: string, data: UpdatePostInput) => apiClient.put<Post>(`/posts/${id}`, data),

  delete: (id: string) => apiClient.delete<{ success: true }>(`/posts/${id}`),

  togglePublish: (id: string) => apiClient.patch<Post>(`/posts/${id}/publish`),
}

// Pages
export const pagesApi = {
  list: (query?: ListPagesQuery) =>
    apiClient.get<PaginatedResponse<Page>>('/pages', { params: query }),

  get: (id: string) => apiClient.get<Page>(`/pages/${id}`),

  create: (data: CreatePageInput) => apiClient.post<Page>('/pages', data),

  update: (id: string, data: UpdatePageInput) => apiClient.put<Page>(`/pages/${id}`, data),

  delete: (id: string) => apiClient.delete<{ success: true }>(`/pages/${id}`),
}

// Categories
export const categoriesApi = {
  list: () => apiClient.get<{ items: Category[] }>('/categories'),

  get: (id: string) => apiClient.get<Category>(`/categories/${id}`),

  create: (data: CreateCategoryInput) => apiClient.post<Category>('/categories', data),

  update: (id: string, data: UpdateCategoryInput) => apiClient.put<Category>(`/categories/${id}`, data),

  delete: (id: string) => apiClient.delete<{ success: true }>(`/categories/${id}`),
}

// Media
export const mediaApi = {
  list: (query?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<PaginatedResponse<Media>>('/media', { params: query }),

  get: (id: string) => apiClient.get<Media>(`/media/${id}`),

  upload: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<Media>('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  update: (id: string, data: { altText?: string; caption?: string }) =>
    apiClient.put<Media>(`/media/${id}`, data),

  delete: (id: string) => apiClient.delete<{ success: true }>(`/media/${id}`),
}

// Stats
export const statsApi = {
  get: () => apiClient.get<CmsStats>('/stats'),
}
```

**Step 4: Commit**

```bash
git add src/lib/api/
git commit -m "feat: add API client and types

- Create TypeScript types for all CMS entities
- Set up Axios client with auth interceptor
- Add endpoint functions for posts, pages, categories, media, stats
- Implement error handling"
```

---

# Continue with remaining tasks...

[This implementation plan continues with frontend hooks, TipTap integration, and remaining features. Due to length, this is the first part of the plan covering the foundation and API setup.]

---

## Summary

This implementation plan provides detailed, step-by-step instructions for building the complete CMS system. Each task includes:

1. **Exact file paths** to create or modify
2. **Complete code** (not pseudocode)
3. **Commands** to run with expected output
4. **Commit messages** for version control

**Progress Tracking:**
- ✅ Tasks 1-10: Backend API (Hono + Drizzle)
- ✅ Task 11: Frontend API client
- ⏳ Tasks 12-30: Frontend hooks, TipTap editor, remaining features

**Next Steps:**
1. Execute Phase 1 (Foundation) - Tasks 1-10
2. Execute Phase 2 (Frontend Integration) - Tasks 11-20
3. Execute Phase 3 (Advanced Features) - Tasks 21-30
