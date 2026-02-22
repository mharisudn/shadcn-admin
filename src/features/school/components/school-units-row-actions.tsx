import type { Row } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash } from 'lucide-react'
import type { SchoolUnit } from '@/lib/api/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SchoolUnitsRowActionsProps {
  row: Row<SchoolUnit>
  onEdit?: (unit: SchoolUnit) => void
  onDelete?: (unit: SchoolUnit) => void
}

export function DataTableRowActions({
  row,
  onEdit,
  onDelete,
}: SchoolUnitsRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon'>
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>Buka menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => onEdit?.(row.original)}>
          <Pencil className='mr-2 h-4 w-4' />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className='text-destructive'
          onClick={() => onDelete?.(row.original)}
        >
          <Trash className='mr-2 h-4 w-4' />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
