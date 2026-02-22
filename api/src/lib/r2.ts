import type { R2Bucket } from '@cloudflare/workers-types'

export interface UploadResult {
  key: string
  url: string
  etag: string
}

export async function uploadToR2(
  bucket: R2Bucket,
  file: File,
  path: string
): Promise<UploadResult> {
  const key = `${path}/${Date.now()}-${file.name}`

  const result = await bucket.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  })

  if (!result) {
    throw new Error('UPLOAD_FAILED')
  }

  return {
    key,
    url: `https://cdn.assurur.com/${key}`,
    etag: result.etag,
  }
}

export async function deleteFromR2(bucket: R2Bucket, key: string): Promise<void> {
  await bucket.delete(key)
}

export function generatePresignedUrl(
  bucket: R2Bucket,
  key: string,
  expiresIn: number = 3600
): string {
  return `/api/cms/media/upload-url?key=${key}&expires=${expiresIn}`
}
