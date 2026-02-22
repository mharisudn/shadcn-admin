/**
 * CMS API Type Definitions
 *
 * This file contains TypeScript interfaces for all CMS entities
 * matching the backend API response structures.
 */

// ============================================================================
// Base Types
// ============================================================================

export type EntityType = 'yayasan' | 'school'
export type ContentStatus = 'draft' | 'published'
export type UserRole = 'admin' | 'editor' | 'author'

// ============================================================================
// User & Auth Types
// ============================================================================

export interface User {
  id: string
  email: string
  name: string
  roleId?: string
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: UserRole
  permissions: string // JSON string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Post Types
// ============================================================================

export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  status: ContentStatus
  categoryId?: string
  featuredImageId?: string
  authorId: string
  entityType: EntityType
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface PostWithRelations extends Post {
  author?: {
    id: string
    name: string
    email: string
  }
  category?: {
    id: string
    name: string
  }
  featuredImage?: Media
  tags?: Tag[]
}

export interface PostListItem {
  id: string
  title: string
  slug: string
  excerpt?: string
  status: ContentStatus
  entityType: EntityType
  publishedAt?: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    email: string
  }
  category?: {
    id: string
    name: string
  }
}

export interface CreatePostInput {
  title: string
  slug: string
  content: string
  excerpt?: string
  categoryId?: string
  featuredImageId?: string
  tags?: string[]
  status?: ContentStatus
  entityType?: EntityType
}

export interface UpdatePostInput {
  title?: string
  slug?: string
  content?: string
  excerpt?: string
  categoryId?: string
  featuredImageId?: string
  tags?: string[]
  status?: ContentStatus
  entityType?: EntityType
}

// ============================================================================
// Page Types
// ============================================================================

export interface Page {
  id: string
  title: string
  slug: string
  content: string
  status: ContentStatus
  parentId?: string
  authorId: string
  entityType: EntityType
  createdAt: string
  updatedAt: string
}

export interface PageWithRelations extends Page {
  author?: {
    id: string
    name: string
    email: string
  }
  parent?: Page
  children?: Page[]
}

export interface PageListItem {
  id: string
  title: string
  slug: string
  status: ContentStatus
  entityType: EntityType
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
  }
}

export interface CreatePageInput {
  title: string
  slug: string
  content: string
  status?: ContentStatus
  parentId?: string
  entityType?: EntityType
}

export interface UpdatePageInput {
  title?: string
  slug?: string
  content?: string
  status?: ContentStatus
  parentId?: string
  entityType?: EntityType
}

// ============================================================================
// Category Types
// ============================================================================

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CategoryWithPostCount extends Category {
  postCount?: number
}

export interface CreateCategoryInput {
  name: string
  slug: string
  description?: string
}

export interface UpdateCategoryInput {
  name?: string
  slug?: string
  description?: string
}

// ============================================================================
// Media Types
// ============================================================================

export interface Media {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  bucket: string
  path: string
  altText?: string
  caption?: string
  uploadedBy?: string
  createdAt: string
  updatedAt: string
}

export interface CreateMediaInput {
  file: File
  altText?: string
  caption?: string
}

export interface UpdateMediaInput {
  altText?: string
  caption?: string
}

// ============================================================================
// Gallery Types
// ============================================================================

export interface Gallery {
  id: string
  title: string
  slug: string
  description?: string
  entityType: EntityType
  createdAt: string
  updatedAt: string
}

export interface GalleryWithMedia extends Gallery {
  media: Array<{
    media: Media
    order: number
  }>
}

export interface CreateGalleryInput {
  title: string
  slug: string
  description?: string
  entityType?: EntityType
  mediaIds?: string[]
}

export interface UpdateGalleryInput {
  title?: string
  slug?: string
  description?: string
  entityType?: EntityType
  mediaIds?: string[]
}

// ============================================================================
// Tag Types
// ============================================================================

export interface Tag {
  id: string
  name: string
  slug: string
  createdAt: string
}

// ============================================================================
// Activity Types
// ============================================================================

export type ActivityAction = 'create' | 'update' | 'delete'
export type ActivityEntityType = 'post' | 'page' | 'media' | 'category' | 'gallery'

export interface Activity {
  id: string
  userId: string
  action: ActivityAction
  entityType: ActivityEntityType
  entityId: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface ActivityWithUser extends Activity {
  user?: {
    id: string
    name: string
    email: string
  }
}

// ============================================================================
// Stats Types
// ============================================================================

export interface StatsOverview {
  posts: {
    total: number
    published: number
    draft: number
  }
  pages: {
    total: number
    published: number
    draft: number
  }
  categories: number
  media: number
}

export interface RecentContentItem {
  id: string
  title: string
  status: ContentStatus
  entityType: EntityType
  createdAt: string
  author: {
    id: string
    name: string
  }
}

export interface StatsResponse {
  overview: StatsOverview
  postsByCategory: Array<CategoryWithPostCount>
  recentContent: {
    posts: Array<RecentContentItem>
    pages: Array<RecentContentItem>
  }
}

export interface ActivityFeedResponse {
  items: Array<ActivityWithUser>
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationMeta
}

// ============================================================================
// Query & Filter Types
// ============================================================================

export interface ListPostsQuery {
  page?: number
  limit?: number
  status?: ContentStatus
  entityType?: EntityType
  categoryId?: string
  search?: string
}

export interface ListPagesQuery {
  page?: number
  limit?: number
  status?: ContentStatus
  entityType?: EntityType
  search?: string
}

export interface ListCategoriesQuery {
  page?: number
  limit?: number
  search?: string
}

export interface ListMediaQuery {
  page?: number
  limit?: number
  search?: string
  mimeType?: string
}

export interface ListGalleriesQuery {
  page?: number
  limit?: number
  entityType?: EntityType
  search?: string
}

// ============================================================================
// API Error Types
// ============================================================================

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'DUPLICATE_SLUG'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'

export interface ApiError {
  error: ApiErrorCode
  message: string
  details?: Record<string, unknown>
}

// ============================================================================
// Auth Types
// ============================================================================

export interface AuthUser {
  sub: string // User ID
  email: string
  name: string
  role?: UserRole
  permissions?: string[]
}
