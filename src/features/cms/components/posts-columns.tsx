import type { ColumnDef } from '@tanstack/react-table'
import type { Post } from '@/lib/api/types'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { PostStatusBadge } from './post-status-badge'

export const postsColumns: ColumnDef<Post>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Judul' />
    ),
    cell: ({ row }) => (
      <div>
        <div className='font-medium'>{row.getValue('title')}</div>
        <div className='text-sm text-muted-foreground'>
          /{row.original.slug}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Kategori' />
    ),
    cell: ({ row }) => (
      <span className='rounded-full bg-primary/10 px-2 py-1 text-xs font-medium'>
        {row.getValue('category')}
      </span>
    ),
  },
  {
    accessorKey: 'authorName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Penulis' />
    ),
    cell: ({ row }) => <span>{row.original.authorName || '-'}</span>,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dibuat' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => <PostStatusBadge status={row.getValue('status')} />,
  },
  {
    id: 'actions',
    header: 'Aksi',
    enableSorting: false,
    cell: () => {
      // Actions will be handled by row actions component
      return null
    },
  },
]
