import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth'
import { requirePermission } from '../middleware/rbac'
import { uploadToR2, deleteFromR2 } from '../lib/r2'
import * as schema from '../db/schema'
import { createDB } from '../db'
import type { HonoEnv } from '../env.d'

const media = new Hono<HonoEnv>()

// Get presigned URL for upload
media.post(
  '/upload-url',
  authMiddleware,
  requirePermission('media:upload'),
  zValidator(
    'json',
    z.object({
      filename: z.string(),
      contentType: z.string(),
    })
  ),
  async (c) => {
    const { filename, contentType } = c.req.valid('json')

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(contentType)) {
      return c.json({ error: 'VALIDATION_ERROR', message: 'Invalid file type' }, 400)
    }

    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const key = `uploads/images/${year}/${month}/${Date.now()}-${filename}`

    return c.json({
      key,
      uploadUrl: `/api/cms/media/upload`,
    })
  }
)

// Upload file (multipart form data)
media.post('/upload', authMiddleware, requirePermission('media:upload'), async (c) => {
  const body = await c.req.parseBody()
  const file = body.file as File

  if (!file) {
    return c.json({ error: 'VALIDATION_ERROR', message: 'No file provided' }, 400)
  }

  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    return c.json({ error: 'VALIDATION_ERROR', message: 'File too large (max 5MB)' }, 400)
  }

  try {
    const result = await uploadToR2(c.env.MEDIA, file, 'uploads/images')

    const db = createDB(c.env.DATABASE_URL)
    const [mediaRecord] = await db
      .insert(schema.media)
      .values({
        filename: result.key,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: result.url,
        bucket: 'assurur-media',
        path: result.key,
        uploadedBy: c.get('user').sub,
      })
      .returning()

    return c.json(mediaRecord, 201)
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: 'UPLOAD_FAILED', message: 'Failed to upload file' }, 500)
  }
})

export { media as mediaRouter }
