import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mediaApi, queryKeys, type CreateMediaInput, type UpdateMediaInput, type ListMediaQuery } from '@/lib/api'

export function useMedia(query?: ListMediaQuery) {
  return useQuery({
    queryKey: queryKeys.media.list(query || {}),
    queryFn: () => mediaApi.list(query),
  })
}

export function useMediaItem(id: string) {
  return useQuery({
    queryKey: queryKeys.media.detail(id),
    queryFn: () => mediaApi.getById(id),
    enabled: !!id,
  })
}

export function useUploadMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMediaInput) => mediaApi.upload(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.lists() })
    },
  })
}

export function useUpdateMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMediaInput }) => mediaApi.update(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.media.detail(variables.id) })
    },
  })
}

export function useDeleteMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => mediaApi.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.lists() })
    },
  })
}
