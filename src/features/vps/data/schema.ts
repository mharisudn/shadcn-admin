import { z } from 'zod'

export const vpsSchema = z.object({
  id: z.string(),
  name: z.string(),
  ip: z.string(),
  os: z.string(),
  status: z.enum(['running', 'stopped', 'pending']),
  region: z.string(),
  created: z.string(),
  autoRenew: z.boolean(),
})

export type VPS = z.infer<typeof vpsSchema>
