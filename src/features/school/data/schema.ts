import { z } from 'zod'

// School Unit Schema
export const schoolUnitSchema = z.object({
  name: z.string().min(3, 'Nama unit harus minimal 3 karakter'),
  level: z.enum(['sd', 'smp', 'sma'], {
    message: 'Level harus salah satu dari: sd, smp, sma',
  }),
  address: z.string().min(10, 'Alamat harus minimal 10 karakter'),
  phone: z.string().optional(),
  principalName: z.string().optional(),
  establishedDate: z.string().optional(),
})

export type SchoolUnitFormData = z.infer<typeof schoolUnitSchema>

// Teacher Schema
export const teacherSchema = z.object({
  schoolUnitId: z.string().min(1, 'Unit sekolah harus dipilih'),
  name: z.string().min(3, 'Nama harus minimal 3 karakter'),
  subject: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  bio: z.string().optional(),
})

export type TeacherFormData = z.infer<typeof teacherSchema>
