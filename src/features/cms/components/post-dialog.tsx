import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
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
  Form,
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
import { TiptapEditor } from '@/components/editor'
import { postSchema, type PostFormData } from '../data/schema'

interface PostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  post?: Partial<PostFormData>
  onSubmit: (data: PostFormData) => void
  isLoading: boolean
}

export function PostDialog({
  open,
  onOpenChange,
  mode,
  post,
  onSubmit,
  isLoading,
}: PostDialogProps) {
  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title || '',
      slug: post?.slug || '',
      content: post?.content || '',
      excerpt: post?.excerpt || '',
      featuredImageUrl: post?.featuredImageUrl || '',
      category: post?.category || '',
      tags: post?.tags || [],
      status: post?.status || 'draft',
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Buat Artikel Baru' : 'Edit Artikel'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Isi formulir untuk membuat artikel baru'
              : 'Edit informasi artikel'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id='post-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel>Judul</FormLabel>
                    <FormControl>
                      <Input placeholder='Judul artikel' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='slug'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder='url-friendly-slug' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Pilih kategori' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='berita'>Berita</SelectItem>
                        <SelectItem value='pengumuman'>Pengumuman</SelectItem>
                        <SelectItem value='artikel'>Artikel</SelectItem>
                        <SelectItem value='kegiatan'>Kegiatan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='excerpt'
                render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel>Kutipan (Opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder='Ringkasan singkat artikel' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='featuredImageUrl'
                render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel>URL Gambar Utama (Opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder='https://example.com/image.jpg' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Pilih status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='draft'>Draft</SelectItem>
                        <SelectItem value='published'>Published</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='content'
                render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel>Konten</FormLabel>
                    <FormControl>
                      <TiptapEditor
                        content={field.value}
                        onChange={field.onChange}
                        placeholder='Konten artikel...'
                        className='min-h-[300px]'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            type='submit'
            form='post-form'
            disabled={isLoading}
          >
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {mode === 'create' ? 'Buat' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
