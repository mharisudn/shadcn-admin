import { createFileRoute } from '@tanstack/react-router'
import { BoardMembersPage } from '@/features/foundation/components/board-members-page'

export const Route = createFileRoute('/_authenticated/foundation/board-members')({
  component: BoardMembersPage,
})
