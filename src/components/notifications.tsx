import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Notification {
  id: string
  title: string
  description: string
  time: string
  unread: boolean
  type: 'warning' | 'info' | 'error'
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Message Retention Warning',
    description:
      '2 messages will be deleted in 0 days due to retention policy. Upgrade to keep your...',
    time: '3 days ago',
    unread: true,
    type: 'warning',
  },
  {
    id: '2',
    title: 'News - Reset Password',
    description:
      'Pengguna Google sekarang bisa reset dan set password. Tambahkan password...',
    time: '10 days ago',
    unread: true,
    type: 'info',
  },
  {
    id: '3',
    title: 'Subscription Expiring Soon',
    description:
      'Your subscription will expire in 1 days. Renew now to continue enjoying premium...',
    time: '13 days ago',
    unread: true,
    type: 'error',
  },
]

export function Notifications() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='icon' className='relative rounded-full'>
          <Bell className='h-[1.2rem] w-[1.2rem]' />
          <span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white'>
            4
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-0' align='end'>
        <div className='flex items-center justify-between border-b px-4 py-2'>
          <h4 className='text-sm font-semibold'>Notifications</h4>
          <Button
            variant='ghost'
            size='sm'
            className='h-auto p-0 text-xs text-muted-foreground'
          >
            Mark all read
          </Button>
        </div>
        <ScrollArea className='h-[350px]'>
          <div className='flex flex-col'>
            {mockNotifications.map((n) => (
              <div
                key={n.id}
                className='flex cursor-pointer flex-col gap-1 border-b p-4 hover:bg-muted/50'
              >
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex items-center gap-2'>
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full',
                        n.unread ? 'bg-green-500' : 'bg-transparent'
                      )}
                    />
                    <h5 className='text-sm leading-none font-semibold'>
                      {n.title}
                    </h5>
                  </div>
                  <span className='text-[10px] whitespace-nowrap text-muted-foreground'>
                    {n.time}
                  </span>
                </div>
                <p className='line-clamp-2 text-xs text-muted-foreground'>
                  {n.description}
                </p>
                <Button
                  variant='ghost'
                  size='sm'
                  className='mt-1 h-auto self-start p-0 text-[11px] font-medium'
                >
                  Mark read
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className='border-t p-2 text-center'>
          <Button variant='ghost' size='sm' className='w-full text-xs'>
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
