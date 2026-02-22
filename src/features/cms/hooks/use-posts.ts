import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postsApi, queryKeys, type CreatePostInput, type UpdatePostInput, type ListPostsQuery } from '@/lib/api'

export function usePosts(query?: ListPostsQuery) {
  return useQuery({
    queryKey: queryKeys.posts.list(query || {}),
    queryFn: () => postsApi.list(query),
  })
}

export function usePost(id: string) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => postsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePostInput) => postsApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() })
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostInput }) => postsApi.update(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(variables.id) })
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => postsApi.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() })
    },
  })
}

export function useTogglePublishPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => postsApi.togglePublish(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) })
    },
  })
}
