import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface BoardMembersDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading?: boolean
  boardMemberName?: string
}

export function BoardMembersDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  boardMemberName,
}: BoardMembersDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Anggota Dewan?</AlertDialogTitle>
          <AlertDialogDescription>
            Anda yakin ingin menghapus{' '}
            <span className='font-semibold'>{boardMemberName}</span>? Tindakan
            ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
          >
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
