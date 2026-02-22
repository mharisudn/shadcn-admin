import { schoolApi } from '@/lib/api/endpoints'
import { queryKeys } from '@/lib/api/query-keys'
import type {
  CreateSchoolUnitInput,
  UpdateSchoolUnitInput,
} from '@/lib/api/types'
import { useApiMutation } from '@/hooks/api/use-api-mutation'
import { useApiQuery } from '@/hooks/api/use-api-query'

export function useSchoolUnits(params?: { page?: number; pageSize?: number }) {
  const query = useApiQuery(
    queryKeys.school.units(params),
    () => schoolApi.getUnits(params),
    {
      enabled: true,
    }
  )

  const createMutation = useApiMutation(
    (data: CreateSchoolUnitInput) => schoolApi.createUnit(data),
    {
      successMessage: 'Unit sekolah berhasil dibuat',
      invalidateQueries: [queryKeys.school.units()],
    }
  )

  const updateMutation = useApiMutation(
    ({ id, data }: { id: string; data: UpdateSchoolUnitInput }) =>
      schoolApi.updateUnit(id, data),
    {
      successMessage: 'Unit sekolah berhasil diupdate',
      invalidateQueries: [queryKeys.school.units()],
    }
  )

  const deleteMutation = useApiMutation(
    (id: string) => schoolApi.deleteUnit(id),
    {
      successMessage: 'Unit sekolah berhasil dihapus',
      invalidateQueries: [queryKeys.school.units()],
    }
  )

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createUnit: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateUnit: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteUnit: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  }
}
