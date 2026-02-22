import { useState } from 'react'
import { Search, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Input } from '@/components/ui/input'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { MediaUploadZone, UploadedFileItem } from './media-upload-zone'
import { useMedia, useUploadMedia, useDeleteMedia } from '../hooks/use-media'
import { MediaSkeleton } from './media-skeleton'
import type { CreateMediaInput } from '@/lib/api/types'
import { toast } from 'sonner'

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export function MediaPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  const { data, isLoading, error } = useMedia()
  const uploadMutation = useUploadMedia()
  const deleteMutation = useDeleteMedia()

  const filteredData = data?.items.filter(
    (item) =>
      item.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.altText?.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? []

  const handleUpload = async (files: File[]) => {
    setPendingFiles([...pendingFiles, ...files])
  }

  const handleRemovePending = (index: number) => {
    setPendingFiles(pendingFiles.filter((_, i) => i !== index))
  }

  const handleConfirmUpload = async () => {
    try {
      for (const file of pendingFiles) {
        const input: CreateMediaInput = {
          file,
          altText: file.name,
        }
        await uploadMutation.mutateAsync(input)
      }
      toast.success('Media berhasil diunggah')
      setPendingFiles([])
      setShowUpload(false)
    } catch {
      toast.error('Gagal mengunggah media')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success(`"${name}" berhasil dihapus`)
    } catch {
      toast.error(`Gagal menghapus "${name}"`)
    }
  }

  return (
    <>
      <Header fixed>
        <SearchComponent />
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-6'>
        <PageHeader
          title='Media Library'
          description='Kelola gambar, dokumen, dan media lainnya'
          actions={
            <Button onClick={() => setShowUpload(!showUpload)}>
              <Upload className='mr-2 h-4 w-4' />
              {showUpload ? 'Tutup Upload' : 'Upload Media'}
            </Button>
          }
        />

        {showUpload && (
          <>
            <MediaUploadZone onUpload={handleUpload} isLoading={uploadMutation.isPending} />

            {pendingFiles.length > 0 && (
              <Card>
                <CardContent className='p-4'>
                  <div className='mb-4 flex items-center justify-between'>
                    <h3 className='font-medium'>
                      Menunggu Upload ({pendingFiles.length})
                    </h3>
                    <Button
                      size='sm'
                      onClick={handleConfirmUpload}
                      disabled={uploadMutation.isPending}
                    >
                      {uploadMutation.isPending ? 'Mengunggah...' : 'Unggah Semua'}
                    </Button>
                  </div>
                  <div className='space-y-2'>
                    {pendingFiles.map((file, index) => (
                      <UploadedFileItem
                        key={`${file.name}-${index}`}
                        file={file}
                        onRemove={() => handleRemovePending(index)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Search Bar */}
        <div className='flex items-center gap-4'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Cari media...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>

        {/* Media Grid */}
        {isLoading ? (
          <MediaSkeleton />
        ) : (
          <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
            {filteredData.map((item) => (
              <Card
                key={item.id}
                className={`group relative overflow-hidden transition-colors ${
                  selectedId === item.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div
                  className='cursor-pointer'
                  onClick={() => setSelectedId(item.id)}
                >
                  <div className='relative aspect-square bg-muted'>
                    {item.mimeType.startsWith('image/') ? (
                      <img
                        src={item.url}
                        alt={item.altText || item.originalName}
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <div className='flex h-full items-center justify-center'>
                        <div className='text-center'>
                          <div className='text-4xl'>📄</div>
                          <p className='mt-2 text-xs text-muted-foreground'>
                            {item.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className='p-3'>
                    <p className='truncate text-sm font-medium'>{item.originalName}</p>
                    <p className='text-xs text-muted-foreground'>
                      {formatFileSize(item.size)}
                    </p>
                  </CardContent>
                </div>
                <Button
                  size='sm'
                  variant='destructive'
                  className='absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity'
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(item.id, item.originalName)
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <X className='h-4 w-4' />
                </Button>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredData.length === 0 && (
          <Card>
            <CardContent className='flex h-64 items-center justify-center'>
              <div className='text-center'>
                <p className='text-muted-foreground'>
                  {searchQuery ? 'Tidak ada media ditemukan' : 'Belum ada media'}
                </p>
                {!searchQuery && (
                  <Button variant='outline' className='mt-4' onClick={() => setShowUpload(true)}>
                    <Upload className='mr-2 h-4 w-4' />
                    Upload Media Baru
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </Main>
    </>
  )
}
