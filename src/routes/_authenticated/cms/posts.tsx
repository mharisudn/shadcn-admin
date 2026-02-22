import { createFileRoute } from '@tanstack/react-router'
import { PostsPage } from '@/features/cms/components/posts-page'

export const Route = createFileRoute('/_authenticated/cms/posts')({
  component: PostsPage,
})
