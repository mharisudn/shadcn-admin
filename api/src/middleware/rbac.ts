import { Context, Next } from 'hono'
import type { DecodedToken } from '../lib/jwt'

type Permission =
  | 'posts:create'
  | 'posts:edit'
  | 'posts:delete'
  | 'posts:publish'
  | 'pages:create'
  | 'pages:edit'
  | 'pages:delete'
  | 'categories:manage'
  | 'media:upload'
  | 'media:delete'
  | 'galleries:manage'
  | 'users:manage'

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    'posts:create',
    'posts:edit',
    'posts:delete',
    'posts:publish',
    'pages:create',
    'pages:edit',
    'pages:delete',
    'categories:manage',
    'media:upload',
    'media:delete',
    'galleries:manage',
    'users:manage',
  ],
  editor: [
    'posts:create',
    'posts:edit',
    'posts:publish',
    'pages:create',
    'pages:edit',
    'media:upload',
    'media:delete',
    'galleries:manage',
  ],
  author: ['posts:create', 'posts:edit', 'media:upload', 'galleries:manage'],
}

export function requirePermission(...permissions: Permission[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as DecodedToken
    const userRole = user.role || 'author' // default to least privileged

    const userPermissions = ROLE_PERMISSIONS[userRole] || []

    const hasPermission = permissions.some((p) => userPermissions.includes(p))

    if (!hasPermission) {
      return c.json(
        { error: 'FORBIDDEN', message: 'You do not have permission to perform this action' },
        403
      )
    }

    await next()
  }
}
