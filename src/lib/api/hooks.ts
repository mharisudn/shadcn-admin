import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import type {
  Post,
  Page,
  Category,
  Media,
  CreatePostInput,
  UpdatePostInput,
  CreatePageInput,
  UpdatePageInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  ListPostsQuery,
  ListPagesQuery,
  ListMediaQuery,
} from './types'
import { postsApi, pagesApi, categoriesApi, mediaApi, showErrorToast } from './'

// Query key factories for cache management
export const queryKeys = {
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (query: ListPostsQuery) => [...queryKeys.posts.lists(), query] as const,
    details: () => [...queryKeys.posts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.posts.details(), id] as const,
  },
  pages: {
    all: ['pages'] as const,
    lists: () => [...queryKeys.pages.all, 'list'] as const,
    list: (query: ListPagesQuery) => [...queryKeys.pages.lists(), query] as const,
    details: () => [...queryKeys.pages.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.pages.details(), id] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  media: {
    all: ['media'] as const,
    lists: () => [...queryKeys.media.all, 'list'] as const,
    list: (query: ListMediaQuery) => [...queryKeys.media.lists(), query] as const,
    details: () => [...queryKeys.media.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.media.details(), id] as const,
  },
}

// Generic mutation options with error handling
function getMutationOptions<TData, TError, TVariables, TContext>(
  successMessage?: string,
  queryKeysToInvalidate?: readonly unknown[][]
) {
  return {
    onSuccess: () => {
      if (successMessage) {
        // TODO: Add toast notification
        console.log(successMessage)
      }
      // Invalidate affected queries
      if (queryKeysToInvalidate) {
        const queryClient = useQueryClient()
        queryKeysToInvalidate.forEach((keys) => {
          queryClient.invalidateQueries({ queryKey: keys })
        })
      }
    },
    onError: (error: TError) => {
      showErrorToast(error)
    },
  }
}
