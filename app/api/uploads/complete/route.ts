import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/database'
import { checkR2ObjectExists } from '@/lib/r2'
import { extractExif } from '@/lib/exif'
import { generateThumbnails } from '@/lib/thumbnails'
import { getCurrentUserFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { photoId, key } = await req.json()

    // R2アップロード確認
    const exists = await checkR2ObjectExists(key)
    if (!exists) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
    }

    // EXIF抽出
    const exif = await extractExif(key)
    
    // DB更新
    const pool = getPool()
    await pool.query(
      `UPDATE photos SET exif_json = $1, taken_at = $2, width = $3, height = $4 
       WHERE id = $5 AND family_id = $6`,
      [JSON.stringify(exif.json), exif.takenAt || new Date(), exif.width, exif.height, photoId, user.family_id]
    )

    // サムネイル生成（MVP版は同期的に実行）
    try {
      await generateThumbnails(photoId, key, user.family_id)
    } catch (thumbnailError) {
      console.error('Thumbnail generation failed:', thumbnailError)
      // サムネイル生成に失敗してもアップロード自体は成功とする
    }

    return NextResponse.json({ success: true, photoId })
  } catch (error) {
    console.error('Upload complete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

