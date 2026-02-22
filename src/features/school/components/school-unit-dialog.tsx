import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import type { SchoolUnit } from '@/lib/api/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { schoolUnitSchema, type SchoolUnitFormData } from '../data/schema'

interface SchoolUnitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  schoolUnit?: SchoolUnit
  onSubmit: (data: SchoolUnitFormData) => void
  isLoading?: boolean
}

export function SchoolUnitDialog({
  open,
  onOpenChange,
  mode,
  schoolUnit,
  onSubmit,
  isLoading,
}: SchoolUnitDialogProps) {
  const form = useForm<SchoolUnitFormData>({
    resolver: zodResolver(schoolUnitSchema),
    defaultValues: schoolUnit || {
      name: '',
      level: 'sd',
      address: '',
      phone: '',
      principalName: '',
      establishedDate: '',
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Tambah Unit Sekolah' : 'Edit Unit Sekolah'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Tambahkan unit sekolah baru'
              : 'Edit informasi unit sekolah'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Unit</FormLabel>
                <FormControl>
                  <Input placeholder='Misal: SDQu Assurur 01' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='level'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenjang</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Pilih jenjang' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='sd'>SD (Sekolah Dasar)</SelectItem>
                    <SelectItem value='smp'>
                      SMP (Sekolah Menengah Pertama)
                    </SelectItem>
                    <SelectItem value='sma'>
                      SMA (Sekolah Menengah Atas)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='address'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alamat</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Masukkan alamat lengkap...'
                    className='min-h-[80px]'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. Telepon</FormLabel>
                <FormControl>
                  <Input placeholder='08xxxxxxxxxx' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='principalName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Kepala Sekolah</FormLabel>
                <FormControl>
                  <Input placeholder='Nama kepala sekolah' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='establishedDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Berdiri</FormLabel>
                <FormControl>
                  <Input type='date' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {mode === 'create' ? 'Tambah' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
