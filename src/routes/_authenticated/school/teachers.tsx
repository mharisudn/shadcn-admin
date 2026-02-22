import { createFileRoute } from '@tanstack/react-router'
import { TeachersPage } from '@/features/school/components/teachers-page'

export const Route = createFileRoute('/_authenticated/school/teachers')({
  component: TeachersPage,
})
