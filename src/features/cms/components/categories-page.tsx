import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { CategoryWithPostCount } from '@/lib/api/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  categorySchema,
  type CategoryFormData,
} from '@/features/cms/data/schema'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/features/cms/hooks/use-categories'
import { CategoriesSkeleton } from './categories-skeleton'

export function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryWithPostCount | null>(null)

  const { data, isLoading, error } = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  })

  const handleCreate = () => {
    form.reset()
    setSelectedCategory(null)
    setDialogOpen(true)
  }

  const handleEdit = (category: CategoryWithPostCount) => {
    form.reset({
      name: category.name,
      slug: category.slug,
      description: category.description,
    })
    setSelectedCategory(category)
    setDialogOpen(true)
  }

  const handleDelete = (category: CategoryWithPostCount) => {
    setSelectedCategory(category)
    setDeleteDialogOpen(true)
  }

  const handleDialogSubmit = async (formData: CategoryFormData) => {
    try {
      if (selectedCategory) {
        await updateMutation.mutateAsync({
          id: selectedCategory.id,
          data: formData,
        })
        toast.success('Kategori berhasil diperbarui')
      } else {
        await createMutation.mutateAsync(formData)
        toast.success('Kategori berhasil dibuat')
      }
      setDialogOpen(false)
      form.reset()
    } catch {
      toast.error(
        selectedCategory
          ? 'Gagal memperbarui kategori'
          : 'Gagal membuat kategori'
      )
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return

    try {
      await deleteMutation.mutateAsync(selectedCategory.id)
      toast.success('Kategori berhasil dihapus')
      setDeleteDialogOpen(false)
      setSelectedCategory(null)
    } catch {
      toast.error('Gagal menghapus kategori')
    }
  }

  const isLoadingOperation =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  const categories = data?.items ?? []

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-6'>
        <PageHeader
          title='Kategori'
          description='Kelola kategori untuk artikel dan berita'
          actions={
            <Button onClick={handleCreate}>
              <Plus className='h-4 w-4' />
              Tambah Kategori
            </Button>
          }
        />

        {isLoading ? (
          <CategoriesSkeleton />
        ) : (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <CardTitle>{category.name}</CardTitle>
                      <p className='text-sm text-muted-foreground'>
                        /{category.slug}
                      </p>
                    </div>
                    <div className='flex gap-1'>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {category.description && (
                    <p className='mb-4 text-sm text-muted-foreground'>
                      {category.description}
                    </p>
                  )}
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>
                      Jumlah Artikel
                    </span>
                    <span className='font-medium'>
                      {category.postCount ?? 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'Edit Kategori' : 'Tambah Kategori'}
              </DialogTitle>
              <DialogDescription>
                {selectedCategory
                  ? 'Edit informasi kategori'
                  : 'Buat kategori baru'}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                id='category-form'
                onSubmit={form.handleSubmit(handleDialogSubmit)}
                className='space-y-4'
              >
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Kategori</FormLabel>
                      <FormControl>
                        <Input placeholder='Contoh: Berita' {...field} />
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
                        <Input placeholder='berita' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi (Opsional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Deskripsi singkat kategori...'
                          className='min-h-[80px]'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setDialogOpen(false)}
                disabled={isLoadingOperation}
              >
                Batal
              </Button>
              <Button
                type='submit'
                form='category-form'
                disabled={isLoadingOperation}
              >
                {isLoadingOperation
                  ? 'Menyimpan...'
                  : selectedCategory
                    ? 'Simpan'
                    : 'Buat'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Hapus Kategori</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus kategori &quot;
                {selectedCategory?.name}&quot;? Tindakan ini tidak dapat
                dibatalkan.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isLoadingOperation}
              >
                Batal
              </Button>
              <Button
                variant='destructive'
                onClick={handleDeleteConfirm}
                disabled={isLoadingOperation}
              >
                {isLoadingOperation ? 'Menghapus...' : 'Hapus'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
