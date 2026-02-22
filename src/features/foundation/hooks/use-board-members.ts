import { foundationApi } from '@/lib/api/endpoints'
import { queryKeys } from '@/lib/api/query-keys'
import type {
  CreateBoardMemberInput,
  UpdateBoardMemberInput,
} from '@/lib/api/types'
import { useApiMutation } from '@/hooks/api/use-api-mutation'
import { useApiQuery } from '@/hooks/api/use-api-query'

export function useBoardMembers(params?: { page?: number; pageSize?: number }) {
  const query = useApiQuery(
    queryKeys.foundation.boardMembers(params),
    () => foundationApi.getBoardMembers(params),
    {
      enabled: true,
    }
  )

  const createMutation = useApiMutation(
    (data: CreateBoardMemberInput) => foundationApi.createBoardMember(data),
    {
      successMessage: 'Board member created successfully',
      invalidateQueries: [queryKeys.foundation.boardMembers()],
    }
  )

  const updateMutation = useApiMutation(
    ({ id, data }: { id: string; data: UpdateBoardMemberInput }) =>
      foundationApi.updateBoardMember(id, data),
    {
      successMessage: 'Board member updated successfully',
      invalidateQueries: [queryKeys.foundation.boardMembers()],
    }
  )

  const deleteMutation = useApiMutation(
    (id: string) => foundationApi.deleteBoardMember(id),
    {
      successMessage: 'Board member deleted successfully',
      invalidateQueries: [queryKeys.foundation.boardMembers()],
    }
  )

  const reorderMutation = useApiMutation(
    (ids: string[]) => foundationApi.reorderBoardMembers(ids),
    {
      successMessage: 'Board members reordered successfully',
      invalidateQueries: [queryKeys.foundation.boardMembers()],
    }
  )

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createBoardMember: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateBoardMember: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteBoardMember: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    reorderBoardMembers: reorderMutation.mutate,
    isReordering: reorderMutation.isPending,
  }
}
