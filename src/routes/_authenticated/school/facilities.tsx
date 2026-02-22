import { createFileRoute } from '@tanstack/react-router'
import { FacilitiesPage } from '@/features/school/components/facilities-page'

export const Route = createFileRoute('/_authenticated/school/facilities')({
  component: FacilitiesPage,
})
