import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type PageHeaderProps = {
  title: string
  description?: string
  actions?: React.ReactNode
  backButton?: { to: string; label?: string }
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  backButton,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-2',
        className
      )}
    >
      <div className='flex items-center gap-3'>
        {backButton && (
          <Button variant='ghost' size='sm' className='-ml-1 gap-1' asChild>
            <Link to={backButton.to}>
              <ChevronLeft className='h-4 w-4' />
              {backButton.label !== undefined ? backButton.label : 'Back'}
            </Link>
          </Button>
        )}
        <div>
          <h1 className='text-xl font-bold tracking-tight sm:text-2xl'>
            {title}
          </h1>
          {description && (
            <p className='text-sm text-muted-foreground'>{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className='flex flex-wrap items-center gap-2'>{actions}</div>
      )}
    </div>
  )
}
