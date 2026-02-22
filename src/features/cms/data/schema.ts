import { z } from 'zod'

// Post Schema
export const postSchema = z.object({
  title: z.string().min(5, 'Judul harus minimal 5 karakter'),
  slug: z.string().min(5, 'Slug harus minimal 5 karakter'),
  content: z.string().min(50, 'Konten harus minimal 50 karakter'),
  excerpt: z.string().max(200, 'Kutipan maksimal 200 karakter').optional(),
  featuredImageUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  category: z.string().min(1, 'Kategori wajib dipilih'),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published'], {
    message: 'Status harus draft atau published',
  }),
})

export type PostFormData = z.infer<typeof postSchema>

// Category Schema
export const categorySchema = z.object({
  name: z.string().min(3, 'Nama kategori harus minimal 3 karakter'),
  slug: z.string().min(3, 'Slug harus minimal 3 karakter'),
  description: z.string().optional(),
})

export type CategoryFormData = z.infer<typeof categorySchema>

// Media Schema
export const mediaSchema = z.object({
  fileName: z.string().min(1, 'Nama file wajib diisi'),
  fileUrl: z.string().url('URL tidak valid'),
  altText: z.string().optional(),
})

export type MediaFormData = z.infer<typeof mediaSchema>

