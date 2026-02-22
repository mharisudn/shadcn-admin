/**
 * CMS API Module
 *
 * Central export point for all API-related functionality.
 */

// Export API client
export { apiClient, extractErrorInfo, showErrorToast } from './client'
export type { ApiError } from './client'

// Export all types
export type {
  // Base types
  EntityType,
  ContentStatus,
  UserRole,
  // User & Auth types
  User,
  Role,
  AuthUser,
  // Post types
  Post,
  PostWithRelations,
  PostListItem,
  CreatePostInput,
  UpdatePostInput,
  // Page types
  Page,
  PageWithRelations,
  PageListItem,
  CreatePageInput,
  UpdatePageInput,
  // Category types
  Category,
  CategoryWithPostCount,
  CreateCategoryInput,
  UpdateCategoryInput,
  // Media types
  Media,
  CreateMediaInput,
  UpdateMediaInput,
  // Gallery types
  Gallery,
  GalleryWithMedia,
  CreateGalleryInput,
  UpdateGalleryInput,
  // Tag types
  Tag,
  // Activity types
  Activity,
  ActivityWithUser,
  ActivityAction,
  ActivityEntityType,
  // Stats types
  StatsOverview,
  RecentContentItem,
  StatsResponse,
  ActivityFeedResponse,
  // Pagination types
  PaginationMeta,
  PaginatedResponse,
  // Query types
  ListPostsQuery,
  ListPagesQuery,
  ListCategoriesQuery,
  ListMediaQuery,
  ListGalleriesQuery,
  // API Error types
  ApiErrorCode,
} from './types'

// Export endpoint functions
export { cmsApi, postsApi, pagesApi, categoriesApi, mediaApi, galleriesApi, tagsApi, statsApi } from './endpoints/cms'
