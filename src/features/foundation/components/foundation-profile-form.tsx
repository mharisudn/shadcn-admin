import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
  vision: z.string().min(10, 'Visi harus minimal 10 karakter'),
  mission: z.array(z.string()).min(1, 'Minimal satu misi diperlukan'),
  history: z.string().min(50, 'Sejarah harus minimal 50 karakter'),
  establishedDate: z.string().min(1, 'Tanggal berdiri diperlukan'),
})

type FormData = z.infer<typeof formSchema>

interface FoundationProfileFormProps {
  defaultValues?: FormData
  onSubmit: (data: FormData) => void
  isLoading?: boolean
}

export function FoundationProfileForm({
  defaultValues,
  onSubmit,
  isLoading,
}: FoundationProfileFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      vision: '',
      mission: [''],
      history: '',
      establishedDate: '',
    },
  })

  const mission = form.watch('mission')

  const addMission = () => {
    const newMission = [...mission, '']
    form.setValue('mission', newMission)
  }

  const removeMission = (index: number) => {
    const newMission = mission.filter((_, i) => i !== index)
    form.setValue('mission', newMission)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Visi & Misi</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FormField
            control={form.control}
            name='vision'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visi</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Masukkan visi yayasan...'
                    className='min-h-[100px]'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <FormLabel>Misi</FormLabel>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={addMission}
              >
                + Tambah Misi
              </Button>
            </div>
            {mission.map((_, index) => (
              <div key={index} className='flex gap-2'>
                <FormField
                  control={form.control}
                  name={`mission.${index}`}
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormControl>
                        <Input placeholder={`Misi ${index + 1}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {mission.length > 1 && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => removeMission(index)}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sejarah & Informasi</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
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

          <FormField
            control={form.control}
            name='history'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sejarah Singkat</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Masukkan sejarah singkat yayasan...'
                    className='min-h-[200px]'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <div className='flex justify-end gap-4'>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </div>
    </form>
  )
}
