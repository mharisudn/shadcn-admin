import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function CategoriesSkeleton() {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div className='flex-1 space-y-2'>
                <div className='h-6 w-32 animate-pulse rounded bg-muted' />
                <div className='h-4 w-24 animate-pulse rounded bg-muted' />
              </div>
              <div className='flex gap-1'>
                <div className='h-8 w-8 animate-pulse rounded bg-muted' />
                <div className='h-8 w-8 animate-pulse rounded bg-muted' />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='mb-4 space-y-2'>
              <div className='h-4 w-full animate-pulse rounded bg-muted' />
              <div className='h-4 w-3/4 animate-pulse rounded bg-muted' />
            </div>
            <div className='flex items-center justify-between'>
              <div className='h-4 w-24 animate-pulse rounded bg-muted' />
              <div className='h-4 w-8 animate-pulse rounded bg-muted' />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
