import { Card } from '@/components/ui/card'

export function MediaSkeleton() {
  return (
    <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
      {Array.from({ length: 10 }).map((_, i) => (
        <Card key={i}>
          <div className='relative aspect-square animate-pulse bg-muted' />
          <div className='p-3 space-y-2'>
            <div className='h-4 w-full animate-pulse rounded bg-muted' />
            <div className='h-3 w-16 animate-pulse rounded bg-muted' />
          </div>
        </Card>
      ))}
    </div>
  )
}
