import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pagesApi, queryKeys, type CreatePageInput, type UpdatePageInput, type ListPagesQuery } from '@/lib/api'

export function usePages(query?: ListPagesQuery) {
  return useQuery({
    queryKey: queryKeys.pages.list(query || {}),
    queryFn: () => pagesApi.list(query),
  })
}

export function usePage(id: string) {
  return useQuery({
    queryKey: queryKeys.pages.detail(id),
    queryFn: () => pagesApi.getById(id),
    enabled: !!id,
  })
}

export function useCreatePage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePageInput) => pagesApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.lists() })
    },
  })
}

export function useUpdatePage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePageInput }) => pagesApi.update(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.detail(variables.id) })
    },
  })
}

export function useDeletePage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => pagesApi.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.lists() })
    },
  })
}

export function useTogglePublishPage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => pagesApi.togglePublish(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.detail(id) })
    },
  })
}
