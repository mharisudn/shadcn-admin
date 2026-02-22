import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Row } from '@tanstack/react-table'
import type { Post } from '@/lib/api/types'

interface PostsRowActionsProps {
  row: Row<Post>
  onEdit?: (post: Post) => void
  onDelete?: (post: Post) => void
}

export function DataTableRowActions({ row, onEdit, onDelete }: PostsRowActionsProps) {
  const post = row.original

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm'>
          <span className='sr-only'>Buka menu</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
          <Eye className='mr-2 h-4 w-4' />
          Lihat
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit?.(post)}>
          <Pencil className='mr-2 h-4 w-4' />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete?.(post)}
          className='text-destructive'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
