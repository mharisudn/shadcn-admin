import { createFileRoute } from '@tanstack/react-router'
import { CategoriesPage } from '@/features/cms/components/categories-page'

export const Route = createFileRoute('/_authenticated/cms/categories')({
  component: CategoriesPage,
})
