# CMS Frontend Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Integrate the CMS backend API with the frontend, implementing real data flow with TanStack Query, TipTap rich text editor, and complete CRUD functionality for posts, pages, categories, and media.

**Architecture:**
- Replace mock data in existing CMS components with real API calls using TanStack Query
- Implement custom hooks (usePosts, usePages, useCategories, useMedia) that wrap the API client
- Add TipTap editor for rich text content editing
- Implement proper error handling, loading states, and optimistic updates
- Add media upload functionality with drag-drop zone

**Tech Stack:**
- TanStack Query (React Query) for server state management
- TipTap editor for rich text content
- Axios API client (already implemented)
- Zod for form validation
- Shadcn UI components (Dialog, Table, Form, etc.)

---

## Task 1: Create API Query Hooks Base

**Files:**
- Create: `src/lib/api/hooks.ts`

**Step 1: Create the base hooks file**

Write to `src/lib/api/hooks.ts`:

```typescript
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import type {
  Post,
  Page,
  Category,
  Media,
  CreatePostInput,
  UpdatePostInput,
  CreatePageInput,
  UpdatePageInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  ListPostsQuery,
  ListPagesQuery,
  ListMediaQuery,
} from './types'
import { postsApi, pagesApi, categoriesApi, mediaApi, showErrorToast } from './'

// Query key factories for cache management
export const queryKeys = {
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (query: ListPostsQuery) => [...queryKeys.posts.lists(), query] as const,
    details: () => [...queryKeys.posts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.posts.details(), id] as const,
  },
  pages: {
    all: ['pages'] as const,
    lists: () => [...queryKeys.pages.all, 'list'] as const,
    list: (query: ListPagesQuery) => [...queryKeys.pages.lists(), query] as const,
    details: () => [...queryKeys.pages.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.pages.details(), id] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  media: {
    all: ['media'] as const,
    lists: () => [...queryKeys.media.all, 'list'] as const,
    list: (query: ListMediaQuery) => [...queryKeys.media.lists(), query] as const,
    details: () => [...queryKeys.media.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.media.details(), id] as const,
  },
}

// Generic mutation options with error handling
function getMutationOptions<TData, TError, TVariables, TContext>(
  successMessage?: string,
  queryKeysToInvalidate?: readonly unknown[][]
) {
  return {
    onSuccess: () => {
      if (successMessage) {
        // TODO: Add toast notification
        console.log(successMessage)
      }
      // Invalidate affected queries
      if (queryKeysToInvalidate) {
        const queryClient = useQueryClient()
        queryKeysToInvalidate.forEach((keys) => {
          queryClient.invalidateQueries({ queryKey: keys })
        })
      }
    },
    onError: (error: TError) => {
      showErrorToast(error)
    },
  }
}
```

**Step 2: Commit**

```bash
git add src/lib/api/hooks.ts
git commit -m "feat: add API query hooks base with query key factories"
```

---

## Task 2: Implement Posts Query Hooks

**Files:**
- Modify: `src/features/cms/hooks/use-posts.ts`

**Step 1: Replace mock implementation with real hooks**

Update `src/features/cms/hooks/use-posts.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postsApi, queryKeys } from '@/lib/api'
import type { CreatePostInput, UpdatePostInput, ListPostsQuery } from '@/lib/api'

export function usePosts(query?: ListPostsQuery) {
  return useQuery({
    queryKey: queryKeys.posts.list(query || {}),
    queryFn: () => postsApi.list(query).then((res) => res.data),
  })
}

export function usePost(id: string) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => postsApi.get(id).then((res) => res.data),
    enabled: !!id,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePostInput) =>
      postsApi.create(data).then((res) => res.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() })
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostInput }) =>
      postsApi.update(id, data).then((res) => res.data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(variables.id) })
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      postsApi.delete(id).then((res) => res.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() })
    },
  })
}

export function useTogglePublishPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      postsApi.togglePublish(id).then((res) => res.data),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) })
    },
  })
}
```

**Step 2: Commit**

```bash
git add src/features/cms/hooks/use-posts.ts
git commit -m "feat: implement real posts hooks with TanStack Query"
```

---

## Task 3: Implement Categories, Pages, and Media Hooks

**Files:**
- Modify: `src/features/cms/hooks/use-categories.ts`
- Modify: `src/features/cms/hooks/use-media.ts`
- Create: `src/features/cms/hooks/use-pages.ts`

**Step 1: Update categories hooks**

Update `src/features/cms/hooks/use-categories.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi, queryKeys } from '@/lib/api'
import type { CreateCategoryInput, UpdateCategoryInput } from '@/lib/api'

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => categoriesApi.list().then((res) => res.data.items),
  })
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoriesApi.get(id).then((res) => res.data),
    enabled: !!id,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCategoryInput) =>
      categoriesApi.create(data).then((res) => res.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) =>
      categoriesApi.update(id, data).then((res) => res.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      categoriesApi.delete(id).then((res) => res.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })
}
```

**Step 2: Update media hooks**

Update `src/features/cms/hooks/use-media.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mediaApi, queryKeys } from '@/lib/api'
import type { UpdateMediaInput, ListMediaQuery } from '@/lib/api'

export function useMedia(query?: ListMediaQuery) {
  return useQuery({
    queryKey: queryKeys.media.list(query || {}),
    queryFn: () => mediaApi.list(query).then((res) => res.data),
  })
}

export function useMediaItem(id: string) {
  return useQuery({
    queryKey: queryKeys.media.detail(id),
    queryFn: () => mediaApi.get(id).then((res) => res.data),
    enabled: !!id,
  })
}

export function useUploadMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) =>
      mediaApi.upload(file).then((res) => res.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.lists() })
    },
  })
}

export function useUpdateMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMediaInput }) =>
      mediaApi.update(id, data).then((res) => res.data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.media.detail(variables.id) })
    },
  })
}

export function useDeleteMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      mediaApi.delete(id).then((res) => res.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.lists() })
    },
  })
}
```

**Step 3: Create pages hooks**

Create `src/features/cms/hooks/use-pages.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pagesApi, queryKeys } from '@/lib/api'
import type { CreatePageInput, UpdatePageInput, ListPagesQuery } from '@/lib/api'

export function usePages(query?: ListPagesQuery) {
  return useQuery({
    queryKey: queryKeys.pages.list(query || {}),
    queryFn: () => pagesApi.list(query).then((res) => res.data),
  })
}

export function usePage(id: string) {
  return useQuery({
    queryKey: queryKeys.pages.detail(id),
    queryFn: () => pagesApi.get(id).then((res) => res.data),
    enabled: !!id,
  })
}

export function useCreatePage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePageInput) =>
      pagesApi.create(data).then((res) => res.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.lists() })
    },
  })
}

export function useUpdatePage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePageInput }) =>
      pagesApi.update(id, data).then((res) => res.data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.detail(variables.id) })
    },
  })
}

export function useDeletePage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      pagesApi.delete(id).then((res) => res.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.lists() })
    },
  })
}
```

**Step 4: Commit**

```bash
git add src/features/cms/hooks/
git commit -m "feat: implement categories, pages, and media hooks"
```

---

## Task 4: Update PostsPage Component to Use Real Data

**Files:**
- Modify: `src/features/cms/components/posts-page.tsx`

**Step 1: Replace mock data with real hooks**

Update `src/features/cms/components/posts-page.tsx`:

```typescript
import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Post } from '@/lib/api/types'
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

export function PostsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Real API hooks
  const { data: posts = [], isLoading } = usePosts()
  const createMutation = useCreatePost()
  const updateMutation = useUpdatePost()
  const deleteMutation = useDeletePost()

  const handleCreate = () => {
    setDialogMode('create')
    setSelectedPost(null)
    setDialogOpen(true)
  }

  const handleEdit = (post: Post) => {
    setDialogMode('edit')
    setSelectedPost(post)
    setDialogOpen(true)
  }

  const handleDelete = (post: Post) => {
    setSelectedPost(post)
    setDeleteDialogOpen(true)
  }

  const handleDialogSubmit = async (formData: PostFormData) => {
    try {
      if (dialogMode === 'create') {
        await createMutation.mutateAsync(formData)
      } else {
        await updateMutation.mutateAsync({
          id: selectedPost!.id,
          data: formData,
        })
      }
      setDialogOpen(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(selectedPost!.id)
      setDeleteDialogOpen(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

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
          data={posts}
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
          isLoading={isMutating}
        />

        <PostsDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          isLoading={isMutating}
          postTitle={selectedPost?.title}
        />
      </Main>
    </>
  )
}
```

**Step 2: Commit**

```bash
git add src/features/cms/components/posts-page.tsx
git commit -m "feat: connect PostsPage to real API"
```

---

## Task 5: Install and Configure TipTap Editor

**Files:**
- Create: `src/components/editor/tiptap-editor.tsx`
- Create: `src/components/editor/index.ts`

**Step 1: Install TipTap dependencies**

```bash
bun add @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-placeholder
```

**Step 2: Create TipTap editor component**

Create `src/components/editor/tiptap-editor.tsx`:

```typescript
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { cn } from '@/lib/utils'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Mulai menulis...',
  className,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3',
          className
        ),
      },
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className='border rounded-md'>
      {/* Toolbar */}
      <div className='border-b bg-muted/50 p-2 flex flex-wrap gap-1'>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          label='Bold'
          shortcut='Cmd+B'
        >
          <strong className='font-bold'>B</strong>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          label='Italic'
          shortcut='Cmd+I'
        >
          <em className='italic'>I</em>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          label='Strikethrough'
        >
          <s className='line-through'>S</s>
        </ToolbarButton>

        <div className='w-px h-6 bg-border mx-1' />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          label='Heading 1'
        >
          H1
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          label='Heading 2'
        >
          H2
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          label='Heading 3'
        >
          H3
        </ToolbarButton>

        <div className='w-px h-6 bg-border mx-1' />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          label='Bullet List'
        >
          • List
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          label='Numbered List'
        >
          1. List
        </ToolbarButton>

        <div className='w-px h-6 bg-border mx-1' />

        <ToolbarButton
          onClick={() => {
            const url = window.prompt('Enter URL:')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          active={editor.isActive('link')}
          label='Link'
        >
          🔗
        </ToolbarButton>

        <ToolbarButton
          onClick={() => {
            const url = window.prompt('Enter image URL:')
            if (url) {
              editor.chain().focus().setImage({ src: url }).run()
            }
          }}
          label='Image'
        >
          🖼️
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}

interface ToolbarButtonProps {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  label: string
  shortcut?: string
}

function ToolbarButton({ children, onClick, active, label, shortcut }: ToolbarButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
      className={cn(
        'px-2 py-1 rounded text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        active && 'bg-accent text-accent-foreground'
      )}
    >
      {children}
    </button>
  )
}
```

**Step 3: Create barrel export**

Create `src/components/editor/index.ts`:

```typescript
export { TiptapEditor } from './tiptap-editor'
```

**Step 4: Commit**

```bash
git add package.json bun.lockb src/components/editor/
git commit -m "feat: add TipTap rich text editor component"
```

---

## Task 6: Update PostDialog to Use TipTap Editor

**Files:**
- Modify: `src/features/cms/components/post-dialog.tsx`

**Step 1: Integrate TipTap editor in post dialog**

Update `src/features/cms/components/post-dialog.tsx` to use TiptapEditor for content field.

Find the textarea for content and replace with TipTap editor:

```typescript
import { TiptapEditor } from '@/components/editor'
```

Replace the content textarea with:

```typescript
<div className='space-y-2'>
  <Label htmlFor='content'>Konten *</Label>
  <TiptapEditor
    content={field.value}
    onChange={field.onChange}
    placeholder='Tulis konten artikel di sini...'
  />
  {fieldState.error && (
    <p className='text-sm text-destructive'>{fieldState.error.message}</p>
  )}
</div>
```

**Step 2: Commit**

```bash
git add src/features/cms/components/post-dialog.tsx
git commit -m "feat: integrate TipTap editor in post dialog"
```

---

## Task 7: Create Media Upload Component

**Files:**
- Create: `src/features/cms/components/media-upload-zone.tsx`

**Step 1: Create upload zone component**

Create `src/features/cms/components/media-upload-zone.tsx`:

```typescript
import { useCallback, useState } from 'react'
import { Upload, X, FileImage } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useUploadMedia } from '@/features/cms/hooks/use-media'

interface UploadFile {
  file: File
  preview: string
  progress: number
  status: 'uploading' | 'success' | 'error'
}

export function MediaUploadZone() {
  const [uploads, setUploads] = useState<UploadFile[]>([])
  const uploadMedia = useUploadMedia()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newUploads: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'uploading' as const,
    }))

    setUploads((prev) => [...prev, ...newUploads])

    // Upload each file
    newUploads.forEach((upload) => {
      uploadMedia.mutate(upload.file, {
        onSuccess: () => {
          setUploads((prev) =>
            prev.map((u) =>
              u.file === upload.file
                ? { ...u, progress: 100, status: 'success' as const }
                : u
            )
          )
          // Remove after 2 seconds
          setTimeout(() => {
            setUploads((prev) => prev.filter((u) => u.file !== upload.file))
          }, 2000)
        },
        onError: () => {
          setUploads((prev) =>
            prev.map((u) =>
              u.file === upload.file
                ? { ...u, status: 'error' as const }
                : u
            )
          )
        },
      })
    })
  }, [uploadMedia])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  const removeUpload = (upload: UploadFile) => {
    URL.revokeObjectURL(upload.preview)
    setUploads((prev) => prev.filter((u) => u !== upload))
  }

  return (
    <div className='space-y-4'>
      {/* Dropzone */}
      <Card
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragActive && 'border-primary bg-primary/5'
        )}
      >
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <Upload className='h-12 w-12 text-muted-foreground mb-4' />
          <p className='text-lg font-medium'>
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className='text-sm text-muted-foreground mt-1'>
            or click to browse (max 5MB)
          </p>
          <input {...getInputProps()} />
        </CardContent>
      </Card>

      {/* Uploads */}
      {uploads.length > 0 && (
        <div className='space-y-2'>
          {uploads.map((upload) => (
            <Card key={upload.file.name}>
              <CardContent className='flex items-center gap-4 py-3'>
                <FileImage className='h-10 w-10 text-muted-foreground' />
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium truncate'>
                    {upload.file.name}
                  </p>
                  {upload.status === 'uploading' && (
                    <Progress value={upload.progress} className='h-1 mt-1' />
                  )}
                  {upload.status === 'success' && (
                    <p className='text-xs text-green-600'>Uploaded</p>
                  )}
                  {upload.status === 'error' && (
                    <p className='text-xs text-destructive'>Upload failed</p>
                  )}
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => removeUpload(upload)}
                >
                  <X className='h-4 w-4' />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Install react-dropzone**

```bash
bun add react-dropzone
```

**Step 3: Commit**

```bash
git add package.json bun.lockb src/features/cms/components/media-upload-zone.tsx
git commit -m "feat: add media upload zone with drag-drop"
```

---

## Task 8: Update MediaPage Component

**Files:**
- Modify: `src/features/cms/components/media-page.tsx`

**Step 1: Connect MediaPage to real API**

Update `src/features/cms/components/media-page.tsx` to use real hooks and upload component.

**Step 2: Commit**

```bash
git add src/features/cms/components/media-page.tsx
git commit -m "feat: connect MediaPage to real API with upload"
```

---

## Task 9: Update CategoriesPage Component

**Files:**
- Modify: `src/features/cms/components/categories-page.tsx`

**Step 1: Connect CategoriesPage to real API**

Update `src/features/cms/components/categories-page.tsx` to use real hooks from `use-categories.ts`.

**Step 2: Commit**

```bash
git add src/features/cms/components/categories-page.tsx
git commit -m "feat: connect CategoriesPage to real API"
```

---

## Task 10: Add Loading Skeletons

**Files:**
- Create: `src/features/cms/components/posts-table-skeleton.tsx`
- Create: `src/features/cms/components/categories-skeleton.tsx`

**Step 1: Create skeleton components**

Create skeleton loading components for better UX during data fetching.

**Step 2: Commit**

```bash
git add src/features/cms/components/
git commit -m "feat: add loading skeletons for better UX"
```

---

## Task 11: Update Sidebar with CMS Routes

**Files:**
- Modify: `src/components/layout/data/sidebar-data.ts`

**Step 1: Add CMS navigation items**

Ensure CMS routes (Posts, Pages, Categories, Media) are properly linked in sidebar navigation.

**Step 2: Commit**

```bash
git add src/components/layout/data/sidebar-data.ts
git commit -m "feat: add CMS routes to sidebar navigation"
```

---

## Task 12: Test and Verify All Components

**Step 1: Run type-check**

```bash
npx tsc --noEmit
```

Expected: No errors

**Step 2: Run linter**

```bash
bun lint
```

Expected: No errors

**Step 3: Build project**

```bash
bun build
```

Expected: Build succeeds

**Step 4: Final commit**

```bash
git add .
git commit -m "chore: finalize CMS frontend integration"
```

---

## Summary

This implementation plan covers:

1. ✅ Base API query hooks with TanStack Query
2. ✅ Posts, Pages, Categories, and Media hooks
3. ✅ TipTap rich text editor integration
4. ✅ Media upload with drag-drop
5. ✅ Real API integration for all CMS components
6. ✅ Loading states and skeletons

**Next Steps:**
- Test all CRUD operations
- Add error toast notifications
- Implement optimistic updates
- Add form validation with Zod
- E2E testing with Playwright
