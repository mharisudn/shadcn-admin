import type { ColumnDef } from '@tanstack/react-table'
import type { SchoolUnit } from '@/lib/api/types'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table/column-header'

const levelLabels: Record<string, string> = {
  sd: 'SD',
  smp: 'SMP',
  sma: 'SMA',
}

const levelColors: Record<string, string> = {
  sd: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  smp: 'bg-green-100 text-green-800 hover:bg-green-200',
  sma: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
}

export const schoolUnitsColumns: ColumnDef<SchoolUnit>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nama Unit' />
    ),
    cell: ({ row }) => (
      <div>
        <div className='font-medium'>{row.getValue('name')}</div>
        {row.original.principalName && (
          <div className='text-sm text-muted-foreground'>
            Kepala Sekolah: {row.original.principalName}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'level',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Jenjang' />
    ),
    cell: ({ row }) => {
      const level = row.getValue('level') as string
      return <Badge className={levelColors[level]}>{levelLabels[level]}</Badge>
    },
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Alamat' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[300px] truncate text-muted-foreground'>
        {row.getValue('address')}
      </div>
    ),
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Telepon' />
    ),
    cell: ({ row }) => <span>{row.getValue('phone') || '-'}</span>,
  },
  {
    accessorKey: 'establishedDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Berdiri Sejak' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('establishedDate') as string | undefined
      if (!date) return '-'
      return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
      })
    },
  },
  {
    id: 'actions',
    header: 'Aksi',
    enableSorting: false,
  },
]
