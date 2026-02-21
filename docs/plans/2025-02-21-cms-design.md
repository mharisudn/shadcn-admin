# CMS Design Document
**Complete Content Management System for Yayasan Pendidikan Assurur & SDQu Assurur**

**Date:** 2025-02-21
**Status:** Approved
**Version:** 1.0

---

## 1. System Overview

The **Complete CMS System** is a monolithic content management platform built to serve both the Yayasan Pendidikan Assurur (Foundation) and SDQu Assurur (School Unit) websites. It enables administrators, editors, and authors to manage blog articles, static pages, media files, and photo galleries through a unified admin interface.

### Key Objectives

- Manage content for two entity levels: Yayasan (Foundation) and SDQu (School Unit)
- Provide role-based access control (Admin, Editor, Author)
- Support rich content editing with TipTap
- Handle media storage with Cloudflare R2
- Deliver content through a Hono API on Cloudflare Workers

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, TanStack Router, TanStack Query, TipTap |
| **Backend** | Hono on Cloudflare Workers |
| **Database** | Neon Postgres with Drizzle ORM |
| **Storage** | Cloudflare R2 for media |
| **Auth** | Supabase JWT |
| **Cache** | Cloudflare KV |

---

## 3. Database Schema (Drizzle + Neon)

### Core Tables

```sql
-- Users & Roles
users (id, email, name, role_id, created_at, updated_at)
roles (id, name, permissions)

-- Content
posts (id, title, slug, content, excerpt, status, category_id, featured_image_id, author_id, entity_type, published_at, created_at, updated_at)
pages (id, title, slug, content, status, parent_id, author_id, entity_type, created_at, updated_at)
categories (id, name, slug, description, created_at, updated_at)
tags (id, name, slug, created_at, updated_at)
post_tags (post_id, tag_id)

-- Media
media (id, filename, original_name, mime_type, size, url, bucket, path, alt_text, caption, uploaded_by, created_at, updated_at)
galleries (id, title, slug, description, entity_type, created_at, updated_at)
gallery_media (gallery_id, media_id, order)

-- Audit
activities (id, user_id, action, entity_type, entity_id, metadata, created_at)
```

### Key Relationships

- Users have roles (Admin, Editor, Author)
- Posts and Pages have authors (users)
- Posts belong to categories and have many tags
- Galleries contain media items
- All content has `entity_type` ('yayasan' or 'school')

### Key Indexes

```sql
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_entity ON posts(entity_type);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_media_type ON media(mime_type);
CREATE INDEX idx_activities_user ON activities(user_id);
```

---

## 4. API Architecture (Hono on Cloudflare Workers)

### Route Structure

```
/api/cms
├── /auth
│   └── /validate        # POST - Validate JWT token
├── /posts
│   ├── GET /            # List posts (with filters, pagination)
│   ├── GET /:id         # Get single post
│   ├── POST /           # Create post
│   ├── PUT /:id         # Update post
│   ├── DELETE /:id      # Delete post
│   └── PATCH /:id/publish # Toggle publish status
├── /pages
│   ├── GET /            # List pages
│   ├── GET /:id         # Get single page
│   ├── POST /           # Create page
│   ├── PUT /:id         # Update page
│   └── DELETE /:id      # Delete page
├── /categories
│   ├── GET /            # List categories
│   ├── POST /           # Create category
│   ├── PUT /:id         # Update category
│   └── DELETE /:id      # Delete category
├── /media
│   ├── GET /            # List media (with filters)
│   ├── POST /upload     # Upload file to R2
│   ├── GET /:id         # Get media details
│   ├── PUT /:id         # Update media metadata
│   └── DELETE /:id      # Delete media
├── /galleries
│   ├── GET /            # List galleries
│   ├── POST /           # Create gallery
│   ├── GET /:id         # Get gallery with media
│   ├── PUT /:id         # Update gallery
│   ├── DELETE /:id      # Delete gallery
│   └── POST /:id/media  # Add media to gallery
└── /stats
    └── GET /            # Dashboard stats
```

### Middleware Stack

1. **CORS** - Allow requests from admin dashboard
2. **Auth** - Validate Supabase JWT token
3. **RBAC** - Check role-based permissions
4. **Logging** - Track all API calls
5. **Error Handling** - Standardized error responses

---

## 5. Frontend Architecture

### Component Structure

```
src/features/cms/
├── components/
│   ├── cms-index-page.tsx        # Dashboard overview
│   ├── posts-page.tsx            # Posts list & management
│   ├── post-dialog.tsx           # Create/edit dialog
│   ├── posts-table.tsx           # Posts data table
│   ├── pages-page.tsx            # Pages list & management
│   ├── page-dialog.tsx           # Create/edit page
│   ├── media-page.tsx            # Media library
│   ├── media-upload-zone.tsx     # Drag-drop upload
│   ├── media-grid.tsx            # Media gallery view
│   ├── galleries-page.tsx        # Galleries list
│   ├── gallery-dialog.tsx        # Create/edit gallery
│   ├── gallery-media-picker.tsx  # Select media for gallery
│   └── categories-page.tsx       # Categories management
├── hooks/
│   ├── use-posts.ts              # Posts CRUD queries
│   ├── use-pages.ts              # Pages CRUD queries
│   ├── use-media.ts              # Media upload/management
│   ├── use-galleries.ts          # Galleries CRUD
│   └── use-categories.ts         # Categories CRUD
├── types.ts                      # TypeScript types
└── utils/
    ├── tiptap-extension.ts       # TipTap editor config
    └── slug-generator.ts         # URL slug generator
```

### TipTap Editor Configuration

- Rich text formatting (bold, italic, headings, lists)
- Image upload (via drag-drop or paste)
- Link embedding
- Block quotes and code blocks
- Undo/redo history
- Character/word count

---

## 6. Authentication & Authorization

### Auth Flow

```
1. User signs in via Supabase Auth (existing)
2. Frontend receives JWT token from Supabase
3. JWT token stored in Zustand store
4. All API calls include token in Authorization header
5. Hono middleware validates JWT with Supabase JWKS
6. User role extracted from token or database
7. RBAC middleware checks permissions
8. Request proceeds if authorized
```

### Role Permissions Matrix

| Feature | Admin | Editor | Author |
|---------|-------|--------|--------|
| View all content | ✅ | ✅ | ✅ |
| Create posts | ✅ | ✅ | ✅ |
| Edit own posts | ✅ | ✅ | ✅ |
| Edit others' posts | ✅ | ✅ | ❌ |
| Publish content | ✅ | ✅ | ❌ |
| Delete content | ✅ | ❌ | ❌ |
| Manage categories | ✅ | ❌ | ❌ |
| Manage all media | ✅ | ✅ | ✅ |
| Manage pages | ✅ | ✅ | ❌ |
| Manage galleries | ✅ | ✅ | ✅ |
| Manage users | ✅ | ❌ | ❌ |

---

## 7. Media Handling & Storage

### Upload Flow

```
1. User drags file to MediaUploadZone
2. Frontend: Generate presigned URL from Hono API
3. Frontend: Upload directly to R2 using presigned URL
4. R2: Stores file and returns success
5. Frontend: Call Hono API to create media record in database
6. Database: Store metadata (filename, URL, alt text, etc.)
7. Return: Media object with CDN URL
```

### R2 Bucket Structure

```
assurur-media/
├── uploads/
│   ├── images/
│   │   ├── 2025/02/
│   │   └── 2025/03/
│   ├── documents/
│   └── videos/
└── galleries/
    └── {gallery-id}/
```

### Media Features

- Drag-and-drop upload
- Multiple file selection
- Image preview with zoom
- Bulk delete
- Alt text and caption editing
- Search by filename
- Filter by type (image, video, document)

---

## 8. Data Flow & State Management

### State Management Layers

```
┌─────────────────────────────────────────────────────────────┐
│                       UI Components                          │
│  (PostsPage, PagesPage, MediaPage, etc.)                    │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      TanStack Query                          │
│  - usePosts(), usePages(), useMedia()                       │
│  - Caching, invalidation, optimistic updates                │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                       API Client                             │
│  - Axios instance with auth interceptor                     │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Hono API                                │
│  - Route handlers, Business logic, Auth & RBAC             │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Drizzle ORM → Neon PostgreSQL             │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Error Handling

### Error Types

| Type | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or expired JWT |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `DUPLICATE_SLUG` | 409 | Post/page slug already exists |
| `UPLOAD_FAILED` | 500 | R2 upload error |
| `INTERNAL_ERROR` | 500 | Server error |

### Edge Cases

| Scenario | Handling |
|----------|----------|
| Duplicate slug | Auto-generate unique suffix |
| Concurrent edits | Last-write-wins with warning |
| Large file upload | Progress bar, allow cancel |
| Network timeout | Auto-retry 3x with backoff |
| Session expires | Redirect to login, save draft |

---

## 10. Testing Strategy

### Testing Layers

| Type | Tool | Target |
|------|------|--------|
| Unit | Vitest | 70-80% coverage for utilities/hooks |
| Integration | Hono test runner | Critical API endpoints |
| E2E | Playwright | Main user journeys |

### Key Test Scenarios

- Posts: Create, edit, publish, delete, filter
- Pages: Create nested pages, edit, delete
- Media: Upload, edit metadata, delete
- Galleries: Create, add/remove media, reorder
- Auth: Login, logout, token refresh
- Permissions: Verify RBAC rules

---

## 11. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare Pages                         │
│              (React Frontend - Admin)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Cloudflare Workers                         │
│                 (Hono API - Backend)                         │
└─────────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Neon DB   │    │  R2 Storage │    │Cloudflare KV│
└─────────────┘    └─────────────┘    └─────────────┘
```

### Environment Variables

**Frontend:**
- `VITE_API_URL`
- `VITE_APP_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Backend:**
- `DATABASE_URL`
- `R2_BUCKET_NAME`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `SUPABASE_JWKS_URL`
- `JWT_SECRET`
- `KV_NAMESPACE`

---

## 12. Security

- JWT tokens signed by Supabase
- Role-based access control (RBAC)
- Zod validation for all inputs
- File upload validation (type, size)
- CORS restricted to admin domain
- Rate limiting per user/IP
- Encrypted database connections
- R2 bucket with private access

---

## 13. Performance Optimization

### Database
- Indexes on frequently queried columns
- Pagination for all list endpoints
- Connection pooling

### Caching
- Cloudflare KV for public content (TTL: 5-15 min)
- TanStack Query for user-specific data

### Frontend
- Code splitting (automatic with TanStack Router)
- Lazy loading for heavy components
- Image lazy loading
- Debounced search inputs
- Optimistic UI updates

### Performance Targets

| Metric | Target |
|--------|--------|
| API response time | < 200ms (p95) |
| Page load (LCP) | < 2.5s |
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |

---

## 14. Implementation Roadmap

### Phase 1: Foundation (Week 1)
- Set up Hono project structure on Cloudflare Workers
- Configure Drizzle ORM with Neon database
- Create database schema and migrations
- Implement authentication middleware (Supabase JWT)
- Set up R2 bucket and upload logic
- Basic error handling structure

### Phase 2: Core API (Week 2)
- Posts CRUD endpoints
- Pages CRUD endpoints
- Categories CRUD endpoints
- Media upload and management endpoints
- Basic testing for API endpoints

### Phase 3: Frontend Integration (Week 3)
- Extend existing CMS components with full CRUD
- Integrate TipTap editor for rich text
- Media upload zone with drag-drop
- Connect to Hono API with TanStack Query
- Error handling and toast notifications

### Phase 4: Advanced Features (Week 4)
- Galleries management
- Tags management
- Search and filtering
- Pagination
- Bulk operations (delete, publish)

### Phase 5: Polish & Testing (Week 5)
- Complete RBAC implementation
- Audit logging
- Loading states and skeletons
- Form validations
- Integration tests
- E2E tests for critical flows

### Phase 6: Deployment (Week 6)
- Set up CI/CD pipeline
- Configure production environment
- Run migrations on production database
- Deploy to Cloudflare Workers and Pages
- Smoke testing on production
- Documentation

---

## 15. Summary

This design document outlines a complete, production-ready CMS system for managing content across both the Yayasan Pendidikan Assurur and SDQu Assurur websites. The system leverages modern edge computing technologies (Cloudflare Workers, R2, KV) with a TypeScript-fullstack architecture for optimal performance and developer experience.

**Key Features:**
- Posts management with categories and tags
- Static pages management
- Media library with drag-drop upload
- Photo galleries
- Role-based access control (Admin, Editor, Author)
- Rich text editing with TipTap
- Optimistic UI updates
- Real-time validation

---

**Next Step:** Create detailed implementation plan using `writing-plans` skill.
