import { createFileRoute } from '@tanstack/react-router'
import { FoundationProfilePage } from '@/features/foundation/components/foundation-profile-page'

export const Route = createFileRoute('/_authenticated/foundation/')({
  component: FoundationProfilePage,
})
