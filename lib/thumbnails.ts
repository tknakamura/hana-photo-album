import sharp from 'sharp'
import { s3 } from './r2'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getPool } from './database'

export async function generateThumbnails(photoId: string, origKey: string, familyId: string) {
  try {
    // R2から原本取得
    const getCmd = new GetObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: origKey })
    const response = await s3.send(getCmd)
    const buffer = Buffer.from(await response.Body!.transformToByteArray())

    // thumb生成
    const thumbBuffer = await sharp(buffer).resize(320, 320, { fit: 'inside' }).webp().toBuffer()
    const thumbKey = `thumb/${familyId}/${photoId}.webp`
    await s3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: thumbKey,
      Body: thumbBuffer,
      ContentType: 'image/webp'
    }))

    // large生成
    const largeBuffer = await sharp(buffer).resize(2048, 2048, { fit: 'inside' }).webp().toBuffer()
    const largeKey = `large/${familyId}/${photoId}.webp`
    await s3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: largeKey,
      Body: largeBuffer,
      ContentType: 'image/webp'
    }))

    // photo_variantsに記録
    const pool = getPool()
    const thumbMeta = await sharp(thumbBuffer).metadata()
    const largeMeta = await sharp(largeBuffer).metadata()

    await pool.query(
      `INSERT INTO photo_variants (photo_id, variant, bucket_key, width, height, bytes)
       VALUES ($1, 'thumb', $2, $3, $4, $5), ($1, 'large', $6, $7, $8, $9)`,
      [
        photoId, 
        thumbKey, thumbMeta.width, thumbMeta.height, thumbBuffer.length,
        largeKey, largeMeta.width, largeMeta.height, largeBuffer.length
      ]
    )

    console.log(`Thumbnails generated for photo ${photoId}`)
  } catch (error) {
    console.error('Thumbnail generation error:', error)
    throw error
  }
}

