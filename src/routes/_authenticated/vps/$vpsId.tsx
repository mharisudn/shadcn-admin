import { createFileRoute } from '@tanstack/react-router'
import { VPSDetails } from '@/features/vps/details'

export const Route = createFileRoute('/_authenticated/vps/$vpsId')({
  component: VPSDetails,
})
