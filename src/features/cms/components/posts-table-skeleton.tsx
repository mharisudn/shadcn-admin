import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function PostsTableSkeleton() {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Judul</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Penulis</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead className='text-right'>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className='h-4 w-48 animate-pulse rounded bg-muted' />
              </TableCell>
              <TableCell>
                <div className='h-4 w-24 animate-pulse rounded bg-muted' />
              </TableCell>
              <TableCell>
                <div className='h-6 w-16 animate-pulse rounded bg-muted' />
              </TableCell>
              <TableCell>
                <div className='h-4 w-32 animate-pulse rounded bg-muted' />
              </TableCell>
              <TableCell>
                <div className='h-4 w-24 animate-pulse rounded bg-muted' />
              </TableCell>
              <TableCell className='text-right'>
                <div className='flex justify-end gap-2'>
                  <div className='h-8 w-8 animate-pulse rounded bg-muted' />
                  <div className='h-8 w-8 animate-pulse rounded bg-muted' />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
