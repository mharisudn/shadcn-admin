import { createFileRoute } from '@tanstack/react-router'
import { MediaPage } from '@/features/cms/components/media-page'

export const Route = createFileRoute('/_authenticated/cms/media')({
  component: MediaPage,
})
