import { createFileRoute } from '@tanstack/react-router'
import { CmsIndexPage } from '@/features/cms/components/cms-index-page'

export const Route = createFileRoute('/_authenticated/cms/')({
  component: CmsIndexPage,
})
