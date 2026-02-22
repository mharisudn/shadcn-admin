/**
 * CMS API Endpoint Functions
 *
 * This module provides typed functions for all CMS API endpoints.
 * Each function handles the HTTP request and returns typed responses.
 */

import { apiClient } from '../client'
import type {
  // Post types
  Post,
  PostWithRelations,
  PostListItem,
  CreatePostInput,
  UpdatePostInput,
  ListPostsQuery,
  // Page types
  Page,
  PageWithRelations,
  PageListItem,
  CreatePageInput,
  UpdatePageInput,
  ListPagesQuery,
  // Category types
  Category,
  CategoryWithPostCount,
  CreateCategoryInput,
  UpdateCategoryInput,
  ListCategoriesQuery,
  // Media types
  Media,
  CreateMediaInput,
  UpdateMediaInput,
  ListMediaQuery,
  // Gallery types
  Gallery,
  GalleryWithMedia,
  CreateGalleryInput,
  UpdateGalleryInput,
  ListGalleriesQuery,
  // Stats types
  StatsResponse,
  ActivityFeedResponse,
  // Pagination
  PaginatedResponse,
  // API Error
  ApiError,
} from '../types'

// ============================================================================
// Posts API
// ============================================================================

export const postsApi = {
  /**
   * List all posts with filtering and pagination
   */
  async list(params?: ListPostsQuery): Promise<PaginatedResponse<PostListItem>> {
    const response = await apiClient.get<PaginatedResponse<PostListItem>>('/posts', { params })
    return response.data
  },

  /**
   * Get a single post by ID
   */
  async getById(id: string): Promise<PostWithRelations> {
    const response = await apiClient.get<PostWithRelations>(`/posts/${id}`)
    return response.data
  },

  /**
   * Get a single post by slug
   */
  async getBySlug(slug: string): Promise<PostWithRelations> {
    const response = await apiClient.get<PostWithRelations>(`/posts/slug/${slug}`)
    return response.data
  },

  /**
   * Create a new post
   */
  async create(data: CreatePostInput): Promise<Post> {
    const response = await apiClient.post<Post>('/posts', data)
    return response.data
  },

  /**
   * Update an existing post
   */
  async update(id: string, data: UpdatePostInput): Promise<Post> {
    const response = await apiClient.put<Post>(`/posts/${id}`, data)
    return response.data
  },

  /**
   * Delete a post
   */
  async delete(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/posts/${id}`)
    return response.data
  },

  /**
   * Toggle publish status (draft <-> published)
   */
  async togglePublish(id: string): Promise<Post> {
    const response = await apiClient.patch<Post>(`/posts/${id}/publish`)
    return response.data
  },

  /**
   * Bulk delete posts
   */
  async bulkDelete(ids: string[]): Promise<{ success: boolean; count: number }> {
    const response = await apiClient.post<{ success: boolean; count: number }>('/posts/bulk-delete', {
      ids,
    })
    return response.data
  },

  /**
   * Bulk update post status
   */
  async bulkUpdateStatus(ids: string[], status: 'draft' | 'published'): Promise<{ success: boolean; count: number }> {
    const response = await apiClient.post<{ success: boolean; count: number }>('/posts/bulk-status', {
      ids,
      status,
    })
    return response.data
  },
}

// ============================================================================
// Pages API
// ============================================================================

export const pagesApi = {
  /**
   * List all pages with filtering and pagination
   */
  async list(params?: ListPagesQuery): Promise<PaginatedResponse<PageListItem>> {
    const response = await apiClient.get<PaginatedResponse<PageListItem>>('/pages', { params })
    return response.data
  },

  /**
   * Get a single page by ID
   */
  async getById(id: string): Promise<PageWithRelations> {
    const response = await apiClient.get<PageWithRelations>(`/pages/${id}`)
    return response.data
  },

  /**
   * Get a single page by slug
   */
  async getBySlug(slug: string): Promise<PageWithRelations> {
    const response = await apiClient.get<PageWithRelations>(`/pages/slug/${slug}`)
    return response.data
  },

  /**
   * Create a new page
   */
  async create(data: CreatePageInput): Promise<Page> {
    const response = await apiClient.post<Page>('/pages', data)
    return response.data
  },

  /**
   * Update an existing page
   */
  async update(id: string, data: UpdatePageInput): Promise<Page> {
    const response = await apiClient.put<Page>(`/pages/${id}`, data)
    return response.data
  },

  /**
   * Delete a page
   */
  async delete(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/pages/${id}`)
    return response.data
  },

  /**
   * Toggle publish status (draft <-> published)
   */
  async togglePublish(id: string): Promise<Page> {
    const response = await apiClient.patch<Page>(`/pages/${id}/publish`)
    return response.data
  },

  /**
   * Get page tree (hierarchical structure)
   */
  async getTree(entityType?: 'yayasan' | 'school'): Promise<PageWithRelations[]> {
    const response = await apiClient.get<PageWithRelations[]>('/pages/tree', {
      params: { entityType },
    })
    return response.data
  },
}

// ============================================================================
// Categories API
// ============================================================================

export const categoriesApi = {
  /**
   * List all categories with filtering and pagination
   */
  async list(params?: ListCategoriesQuery): Promise<PaginatedResponse<Category>> {
    const response = await apiClient.get<PaginatedResponse<Category>>('/categories', { params })
    return response.data
  },

  /**
   * Get all categories (without pagination)
   */
  async getAll(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/categories/all')
    return response.data
  },

  /**
   * Get a single category by ID
   */
  async getById(id: string): Promise<Category> {
    const response = await apiClient.get<Category>(`/categories/${id}`)
    return response.data
  },

  /**
   * Get a single category by slug
   */
  async getBySlug(slug: string): Promise<CategoryWithPostCount> {
    const response = await apiClient.get<CategoryWithPostCount>(`/categories/slug/${slug}`)
    return response.data
  },

  /**
   * Create a new category
   */
  async create(data: CreateCategoryInput): Promise<Category> {
    const response = await apiClient.post<Category>('/categories', data)
    return response.data
  },

  /**
   * Update an existing category
   */
  async update(id: string, data: UpdateCategoryInput): Promise<Category> {
    const response = await apiClient.put<Category>(`/categories/${id}`, data)
    return response.data
  },

  /**
   * Delete a category
   */
  async delete(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/categories/${id}`)
    return response.data
  },

  /**
   * Get posts by category
   */
  async getPosts(id: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<PostListItem>> {
    const response = await apiClient.get<PaginatedResponse<PostListItem>>(`/categories/${id}/posts`, { params })
    return response.data
  },
}

// ============================================================================
// Media API
// ============================================================================

export const mediaApi = {
  /**
   * List all media with filtering and pagination
   */
  async list(params?: ListMediaQuery): Promise<PaginatedResponse<Media>> {
    const response = await apiClient.get<PaginatedResponse<Media>>('/media', { params })
    return response.data
  },

  /**
   * Get a single media item by ID
   */
  async getById(id: string): Promise<Media> {
    const response = await apiClient.get<Media>(`/media/${id}`)
    return response.data
  },

  /**
   * Upload a new media file
   */
  async upload(data: CreateMediaInput): Promise<Media> {
    const formData = new FormData()
    formData.append('file', data.file)
    if (data.altText) formData.append('altText', data.altText)
    if (data.caption) formData.append('caption', data.caption)

    const response = await apiClient.post<Media>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Upload multiple files
   */
  async uploadMultiple(files: File[], altTexts?: string[], captions?: string[]): Promise<Media[]> {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files`, file)
      if (altTexts?.[index]) formData.append(`altTexts[${index}]`, altTexts[index])
      if (captions?.[index]) formData.append(`captions[${index}]`, captions[index])
    })

    const response = await apiClient.post<Media[]>('/media/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Update media metadata
   */
  async update(id: string, data: UpdateMediaInput): Promise<Media> {
    const response = await apiClient.put<Media>(`/media/${id}`, data)
    return response.data
  },

  /**
   * Delete media
   */
  async delete(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/media/${id}`)
    return response.data
  },

  /**
   * Bulk delete media
   */
  async bulkDelete(ids: string[]): Promise<{ success: boolean; count: number }> {
    const response = await apiClient.post<{ success: boolean; count: number }>('/media/bulk-delete', { ids })
    return response.data
  },

  /**
   * Search media by filename or alt text
   */
  async search(query: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Media>> {
    const response = await apiClient.get<PaginatedResponse<Media>>('/media/search', {
      params: { q: query, ...params },
    })
    return response.data
  },
}

// ============================================================================
// Galleries API
// ============================================================================

export const galleriesApi = {
  /**
   * List all galleries with filtering and pagination
   */
  async list(params?: ListGalleriesQuery): Promise<PaginatedResponse<Gallery>> {
    const response = await apiClient.get<PaginatedResponse<Gallery>>('/galleries', { params })
    return response.data
  },

  /**
   * Get a single gallery by ID
   */
  async getById(id: string): Promise<GalleryWithMedia> {
    const response = await apiClient.get<GalleryWithMedia>(`/galleries/${id}`)
    return response.data
  },

  /**
   * Get a single gallery by slug
   */
  async getBySlug(slug: string): Promise<GalleryWithMedia> {
    const response = await apiClient.get<GalleryWithMedia>(`/galleries/slug/${slug}`)
    return response.data
  },

  /**
   * Create a new gallery
   */
  async create(data: CreateGalleryInput): Promise<Gallery> {
    const response = await apiClient.post<Gallery>('/galleries', data)
    return response.data
  },

  /**
   * Update an existing gallery
   */
  async update(id: string, data: UpdateGalleryInput): Promise<Gallery> {
    const response = await apiClient.put<Gallery>(`/galleries/${id}`, data)
    return response.data
  },

  /**
   * Delete a gallery
   */
  async delete(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/galleries/${id}`)
    return response.data
  },

  /**
   * Add media to gallery
   */
  async addMedia(galleryId: string, mediaIds: string[]): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>(`/galleries/${galleryId}/media`, { mediaIds })
    return response.data
  },

  /**
   * Remove media from gallery
   */
  async removeMedia(galleryId: string, mediaIds: string[]): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/galleries/${galleryId}/media`, {
      data: { mediaIds },
    })
    return response.data
  },

  /**
   * Reorder media in gallery
   */
  async reorderMedia(galleryId: string, mediaIds: string[]): Promise<{ success: boolean }> {
    const response = await apiClient.put<{ success: boolean }>(`/galleries/${galleryId}/media/reorder`, {
      mediaIds,
    })
    return response.data
  },
}

// ============================================================================
// Tags API
// ============================================================================

export const tagsApi = {
  /**
   * Get all tags
   */
  async getAll(): Promise<Array<{ id: string; name: string; slug: string }>> {
    const response = await apiClient.get<Array<{ id: string; name: string; slug: string }>>('/tags')
    return response.data
  },

  /**
   * Get tags by post ID
   */
  async getByPost(postId: string): Promise<Array<{ id: string; name: string; slug: string }>> {
    const response = await apiClient.get<Array<{ id: string; name: string; slug: string }>>(
      `/posts/${postId}/tags`
    )
    return response.data
  },

  /**
   * Search tags by name
   */
  async search(query: string): Promise<Array<{ id: string; name: string; slug: string }>> {
    const response = await apiClient.get<Array<{ id: string; name: string; slug: string }>>('/tags/search', {
      params: { q: query },
    })
    return response.data
  },
}

// ============================================================================
// Stats API
// ============================================================================

export const statsApi = {
  /**
   * Get dashboard statistics
   */
  async getOverview(entityType?: 'yayasan' | 'school'): Promise<StatsResponse> {
    const response = await apiClient.get<StatsResponse>('/stats', {
      params: { entityType },
    })
    return response.data
  },

  /**
   * Get activity feed
   */
  async getActivity(limit: number = 20): Promise<ActivityFeedResponse> {
    const response = await apiClient.get<ActivityFeedResponse>('/stats/activity', {
      params: { limit },
    })
    return response.data
  },
}

// ============================================================================
// Unified Export
// ============================================================================

export const cmsApi = {
  posts: postsApi,
  pages: pagesApi,
  categories: categoriesApi,
  media: mediaApi,
  galleries: galleriesApi,
  tags: tagsApi,
  stats: statsApi,
}

// Default export
export default cmsApi
