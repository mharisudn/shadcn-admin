import { z } from 'zod'

// Foundation Profile Schema
export const foundationProfileSchema = z.object({
  vision: z.string().min(10, 'Vision must be at least 10 characters'),
  mission: z
    .array(z.string())
    .min(1, 'At least one mission statement is required'),
  history: z.string().min(50, 'History must be at least 50 characters'),
  establishedDate: z.string().min(1, 'Established date is required'),
})

export type FoundationProfileFormData = z.infer<typeof foundationProfileSchema>

// Board Member Schema
export const boardMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  position: z.string().min(3, 'Position must be at least 3 characters'),
  photoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  bio: z.string().optional(),
  orderIndex: z.number().default(0),
})

export type BoardMemberFormData = z.infer<typeof boardMemberSchema>
