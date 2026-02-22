import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileImage, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FileWithPreview extends File {
  preview?: string
}

interface MediaUploadZoneProps {
  onUpload: (files: File[]) => void
  isLoading?: boolean
  accept?: Record<string, string[]>
  maxSize?: number
  maxFiles?: number
  className?: string
}

export function MediaUploadZone({
  onUpload,
  isLoading = false,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
  },
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 10,
  className,
}: MediaUploadZoneProps) {
  const [files, setFiles] = useCallback(
    (acceptedFiles: File[]) => {
      const filesWithPreview = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        })
      ) as FileWithPreview[]

      return filesWithPreview
    },
    []
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxSize,
    maxFiles,
    onDrop: useCallback(
      (acceptedFiles: File[]) => {
        const filesWithPreview = setFiles(acceptedFiles)
        onUpload(filesWithPreview)
      },
      [onUpload, setFiles]
    ),
    disabled: isLoading,
  })

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className='h-8 w-8 text-muted-foreground' />
    }
    return <FileText className='h-8 w-8 text-muted-foreground' />
  }

  return (
    <Card className={className}>
      <CardContent className='p-6'>
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          <div className='flex flex-col items-center gap-4'>
            <div className='rounded-full bg-muted p-4'>
              <Upload className='h-8 w-8 text-muted-foreground' />
            </div>
            <div className='space-y-1'>
              <p className='text-sm font-medium'>
                {isDragActive
                  ? 'Drop files here'
                  : 'Drag & drop files here, or click to select'}
              </p>
              <p className='text-xs text-muted-foreground'>
                PNG, JPG, GIF, WebP, PDF up to {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
            <Button type='button' variant='outline' size='sm' disabled={isLoading}>
              Browse Files
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface UploadedFileItemProps {
  file: FileWithPreview
  onRemove: () => void
}

export function UploadedFileItem({ file, onRemove }: UploadedFileItemProps) {
  return (
    <div className='group relative flex items-center gap-3 rounded-lg border border-border p-3'>
      {file.preview ? (
        <img
          src={file.preview}
          alt={file.name}
          className='h-12 w-12 rounded object-cover'
          onLoad={() => {
            if (file.preview) {
              URL.revokeObjectURL(file.preview)
            }
          }}
        />
      ) : (
        <div className='flex h-12 w-12 items-center justify-center rounded bg-muted'>
          {getFileIcon(file)}
        </div>
      )}
      <div className='flex-1 min-w-0'>
        <p className='truncate text-sm font-medium'>{file.name}</p>
        <p className='text-xs text-muted-foreground'>
          {(file.size / 1024).toFixed(1)} KB
        </p>
      </div>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        className='opacity-0 group-hover:opacity-100 transition-opacity'
        onClick={onRemove}
      >
        <X className='h-4 w-4' />
      </Button>
    </div>
  )
}

function getFileIcon(file: File) {
  if (file.type.startsWith('image/')) {
    return <FileImage className='h-8 w-8 text-muted-foreground' />
  }
  return <FileText className='h-8 w-8 text-muted-foreground' />
}
