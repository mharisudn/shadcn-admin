import { createFileRoute } from '@tanstack/react-router'
import { UnitsPage } from '@/features/school/components/units-page'

export const Route = createFileRoute('/_authenticated/school/units')({
  component: UnitsPage,
})
