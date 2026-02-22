import type { ColumnDef } from '@tanstack/react-table'
import type { BoardMember } from '@/lib/api/types'
import { DataTableColumnHeader } from '@/components/data-table/column-header'

export const boardMembersColumns: ColumnDef<BoardMember>[] = [
  {
    accessorKey: 'orderIndex',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Urutan' />
    ),
    cell: ({ row }) => <span>{row.getValue('orderIndex')}</span>,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nama' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted font-medium'>
          {row.original.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)}
        </div>
        <span className='font-medium'>{row.getValue('name')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'position',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Jabatan' />
    ),
    cell: ({ row }) => <span>{row.getValue('position')}</span>,
  },
  {
    accessorKey: 'bio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Biografi' />
    ),
    cell: ({ row }) => (
      <span className='line-clamp-2 text-muted-foreground'>
        {row.getValue('bio') || '-'}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'Aksi',
    enableSorting: false,
  },
]
