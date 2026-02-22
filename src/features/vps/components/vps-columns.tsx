import { useNavigate } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal,
  Play,
  Square,
  RefreshCw,
  Trash2,
  Terminal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { DataTableColumnHeader } from '@/components/data-table'
import { type VPS } from '../data/schema'

export const vpsColumns: ColumnDef<VPS>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Name'
        className='[&>button]:pl-0'
      />
    ),
    meta: {
      className: 'ps-1 max-w-0 w-2/3',
      tdClassName: 'ps-4',
    },
    cell: ({ row }) => {
      const NameCell = () => {
        const name = row.getValue('name') as string
        const navigate = useNavigate()
        return (
          <button
            onClick={() =>
              navigate({
                to: '/vps/$vpsId',
                params: { vpsId: row.original.id },
              })
            }
            className='truncate text-left font-medium hover:underline'
          >
            {name}
          </button>
        )
      }

      return <NameCell />
    },
  },
  {
    accessorKey: 'ip',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='IP Address' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => (
      <div className='text-sm text-muted-foreground'>{row.getValue('ip')}</div>
    ),
  },
  {
    accessorKey: 'os',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='OS / Region' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => {
      const os = row.getValue('os') as string
      const region = row.original.region
      return (
        <div className='flex flex-col'>
          <span className='text-sm'>{os}</span>
          <span className='text-xs text-muted-foreground'>{region}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <div className='flex w-[100px] items-center'>
          <Badge
            variant='outline'
            className={cn(
              'font-normal capitalize',
              status === 'running'
                ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-400'
                : status === 'stopped'
                  ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-400'
                  : 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400'
            )}
          >
            {status}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'created',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => <div className='text-sm'>{row.getValue('created')}</div>,
  },
  {
    accessorKey: 'autoRenew',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Auto Renew' />
    ),
    meta: { className: 'text-center', tdClassName: 'text-center' },
    cell: ({ row }) => {
      const autoRenew = row.getValue('autoRenew') as boolean
      return (
        <div className='flex items-center justify-center'>
          <Switch checked={autoRenew} />
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    enableSorting: false,
    cell: ({ row }) => {
      const ActionsCell = () => {
        const vps = row.original
        const navigate = useNavigate()

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigate({ to: '/vps/$vpsId', params: { vpsId: vps.id } })
                }
              >
                <Terminal className='mr-2 h-4 w-4' /> Console
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <RefreshCw className='mr-2 h-4 w-4' /> Reboot
              </DropdownMenuItem>
              <DropdownMenuItem>
                {vps.status === 'running' ? (
                  <>
                    <Square className='mr-2 h-4 w-4' /> Power Off
                  </>
                ) : (
                  <>
                    <Play className='mr-2 h-4 w-4' /> Power On
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='text-red-600'>
                <Trash2 className='mr-2 h-4 w-4' /> Destroy
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }

      return <ActionsCell />
    },
  },
]
