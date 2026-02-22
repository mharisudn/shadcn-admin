import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

interface BoardMemberCardProps {
  name: string
  position: string
  photoUrl?: string
  bio?: string
}

export function BoardMemberCard({
  name,
  position,
  photoUrl,
  bio,
}: BoardMemberCardProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card>
      <CardContent className='flex flex-col items-center p-6 text-center'>
        <Avatar className='mb-4 h-24 w-24'>
          <AvatarImage src={photoUrl} alt={name} />
          <AvatarFallback className='text-lg'>{initials}</AvatarFallback>
        </Avatar>
        <h3 className='text-lg font-semibold'>{name}</h3>
        <p className='mb-2 text-sm text-muted-foreground'>{position}</p>
        {bio && (
          <p className='line-clamp-3 text-sm text-muted-foreground'>{bio}</p>
        )}
      </CardContent>
    </Card>
  )
}
