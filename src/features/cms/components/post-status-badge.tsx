import { Circle } from 'lucide-react'
import type { PostStatus } from '@/lib/api/types'
import { Badge } from '@/components/ui/badge'

interface PostStatusBadgeProps {
  status: PostStatus
}

export function PostStatusBadge({ status }: PostStatusBadgeProps) {
  const config = {
    draft: {
      label: 'Draft',
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      icon: <Circle className='h-2 w-2 fill-current' />,
    },
    published: {
      label: 'Published',
      className: 'bg-green-100 text-green-800 hover:bg-green-200',
      icon: <Circle className='h-2 w-2 fill-current' />,
    },
  }[status]

  return (
    <Badge className={config.className}>
      <span className='mr-1'>{config.icon}</span>
      {config.label}
    </Badge>
  )
}
