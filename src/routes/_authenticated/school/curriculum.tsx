import { createFileRoute } from '@tanstack/react-router'
import { CurriculumPage } from '@/features/school/components/curriculum-page'

export const Route = createFileRoute('/_authenticated/school/curriculum')({
  component: CurriculumPage,
})
