import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PostDialog } from '@/features/cms/components/post-dialog'
import { PostsDeleteDialog } from '@/features/cms/components/posts-delete-dialog'
import { PostsTable } from '@/features/cms/components/posts-table'
import { usePosts, useCreatePost, useUpdatePost, useDeletePost } from '@/features/cms/hooks/use-posts'
import type { PostFormData } from '@/features/cms/data/schema'
import type { PostListItem } from '@/lib/api/types'
import { toast } from 'sonner'

export function PostsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedPost, setSelectedPost] = useState<PostListItem | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { data, isLoading, error } = usePosts()
  const createMutation = useCreatePost()
  const updateMutation = useUpdatePost()
  const deleteMutation = useDeletePost()

  const handleCreate = () => {
    setDialogMode('create')
    setSelectedPost(null)
    setDialogOpen(true)
  }

  const handleEdit = (post: PostListItem) => {
    setDialogMode('edit')
    setSelectedPost(post)
    setDialogOpen(true)
  }

  const handleDelete = (post: PostListItem) => {
    setSelectedPost(post)
    setDeleteDialogOpen(true)
  }

  const handleDialogSubmit = async (formData: PostFormData) => {
    try {
      if (dialogMode === 'create') {
        await createMutation.mutateAsync({
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          excerpt: formData.excerpt,
          categoryId: formData.category,
          featuredImageId: formData.featuredImageUrl,
          tags: formData.tags,
          status: formData.status,
        })
        toast.success('Artikel berhasil dibuat')
      } else if (selectedPost) {
        await updateMutation.mutateAsync({
          id: selectedPost.id,
          data: {
            title: formData.title,
            slug: formData.slug,
            content: formData.content,
            excerpt: formData.excerpt,
            categoryId: formData.category,
            featuredImageId: formData.featuredImageUrl,
            tags: formData.tags,
            status: formData.status,
          },
        })
        toast.success('Artikel berhasil diperbarui')
      }
      setDialogOpen(false)
    } catch {
      toast.error(dialogMode === 'create' ? 'Gagal membuat artikel' : 'Gagal memperbarui artikel')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedPost) return

    try {
      await deleteMutation.mutateAsync(selectedPost.id)
      toast.success('Artikel berhasil dihapus')
      setDeleteDialogOpen(false)
    } catch {
      toast.error('Gagal menghapus artikel')
    }
  }

  const isLoadingOperation =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

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
          title='Artikel'
          description='Kelola konten artikel dan berita website'
          actions={
            <Button onClick={handleCreate}>
              <Plus className='h-4 w-4' />
              Buat Artikel
            </Button>
          }
        />

        <PostsTable
          data={data?.items ?? []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <PostDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          mode={dialogMode}
          post={selectedPost ?? undefined}
          onSubmit={handleDialogSubmit}
          isLoading={isLoadingOperation}
        />

        <PostsDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          isLoading={isLoadingOperation}
          postTitle={selectedPost?.title}
        />
      </Main>
    </>
  )
}
