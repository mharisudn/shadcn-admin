import type { ColumnDef } from '@tanstack/react-table'
import type { Teacher } from '@/lib/api/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table/column-header'

export const teachersColumns: ColumnDef<Teacher>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nama' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-3'>
        <Avatar className='h-10 w-10'>
          <AvatarImage src={row.original.photoUrl ?? undefined} />
          <AvatarFallback>
            {row.original.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className='font-medium'>{row.getValue('name')}</div>
          {row.original.subject && (
            <div className='text-sm text-muted-foreground'>
              {row.original.subject}
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'subject',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Mata Pelajaran' />
    ),
    cell: ({ row }) => {
      const subject = row.getValue('subject') as string | undefined
      return subject ? (
        <Badge variant='secondary'>{subject}</Badge>
      ) : (
        <span className='text-muted-foreground'>-</span>
      )
    },
  },
  {
    accessorKey: 'schoolUnitId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Unit Sekolah' />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground'>
        {row.getValue('schoolUnitId')}
      </span>
    ),
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
