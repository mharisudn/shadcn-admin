import { foundationApi } from '@/lib/api/endpoints'
import { queryKeys } from '@/lib/api/query-keys'
import type { FoundationProfile } from '@/lib/api/types'
import { useApiMutation } from '@/hooks/api/use-api-mutation'
import { useApiQuery } from '@/hooks/api/use-api-query'

export function useFoundationProfile() {
  const query = useApiQuery(
    queryKeys.foundation.profile(),
    () => foundationApi.getProfile(),
    {
      enabled: true,
    }
  )

  const updateMutation = useApiMutation(
    (data: Partial<FoundationProfile>) => foundationApi.updateProfile(data),
    {
      successMessage: 'Foundation profile updated successfully',
      invalidateQueries: [queryKeys.foundation.profile()],
    }
  )

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  }
}
