import { schoolApi } from '@/lib/api/endpoints'
import { queryKeys } from '@/lib/api/query-keys'
import type { CreateTeacherInput, UpdateTeacherInput } from '@/lib/api/types'
import { useApiMutation } from '@/hooks/api/use-api-mutation'
import { useApiQuery } from '@/hooks/api/use-api-query'

export function useTeachers(
  schoolUnitId?: string,
  params?: { page?: number; pageSize?: number }
) {
  const query = useApiQuery(
    queryKeys.school.teachers(schoolUnitId, params),
    () => schoolApi.getTeachers(schoolUnitId, params),
    {
      enabled: true,
    }
  )

  const createMutation = useApiMutation(
    (data: CreateTeacherInput) => schoolApi.createTeacher(data),
    {
      successMessage: 'Guru berhasil ditambahkan',
      invalidateQueries: [queryKeys.school.teachers()],
    }
  )

  const updateMutation = useApiMutation(
    ({ id, data }: { id: string; data: UpdateTeacherInput }) =>
      schoolApi.updateTeacher(id, data),
    {
      successMessage: 'Data guru berhasil diupdate',
      invalidateQueries: [queryKeys.school.teachers()],
    }
  )

  const deleteMutation = useApiMutation(
    (id: string) => schoolApi.deleteTeacher(id),
    {
      successMessage: 'Guru berhasil dihapus',
      invalidateQueries: [queryKeys.school.teachers()],
    }
  )

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createTeacher: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateTeacher: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteTeacher: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  }
}
