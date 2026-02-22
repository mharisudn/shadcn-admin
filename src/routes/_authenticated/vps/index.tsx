import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { VPS } from '@/features/vps'

const vpsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(z.enum(['running', 'stopped', 'pending']))
    .optional()
    .catch([]),
  region: z
    .array(
      z.enum([
        'us-east-1',
        'us-west-2',
        'eu-central-1',
        'eu-west-1',
        'ap-southeast-1',
        'ap-northeast-1',
      ])
    )
    .optional()
    .catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/vps/')({
  component: VPS,
  validateSearch: vpsSearchSchema,
})
