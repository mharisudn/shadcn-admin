import { createFileRoute } from '@tanstack/react-router'
import { CreateVPS } from '@/features/vps/create'

export const Route = createFileRoute('/_authenticated/vps/create')({
  component: CreateVPS,
})
